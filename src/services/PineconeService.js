import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Add your key to .env.local file
});

const pinecone = new Pinecone({
  apiKey: process.env.REACT_APP_PINECONE_API_KEY, // Add your key to .env.local file
});

class PineconeService {
  constructor() {
    this.index = pinecone.Index(process.env.REACT_APP_PINECONE_INDEX || 'smu-involvement-data');
    this.initialized = false;
  }

  // Get embedding from OpenAI
  async getEmbedding(text) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Search for similar documents
  async search(query, topK = 3) {
    try {
      // Get embedding for query
      const queryEmbedding = await this.getEmbedding(query);
      
      // Search Pinecone
      const results = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true
      });
      
      return results.matches.map(match => match.metadata);
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      return [];
    }
  }

  // Import data to Pinecone (use this function to initially populate your database)
  async importData(data) {
    try {
      const vectors = [];
      
      for (const item of data) {
        // Create text for embedding
        const textForEmbedding = `
          ${item.title || ''} 
          ${item.description || item.text || ''} 
          Category: ${item.category || ''} 
          Tags: ${Array.isArray(item.tags) ? item.tags.join(', ') : ''}
        `.trim();
        
        // Get embedding
        const embedding = await this.getEmbedding(textForEmbedding);
        
        vectors.push({
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          values: embedding,
          metadata: {
            title: item.title || '',
            text: item.description || item.text || '',
            category: item.category || '',
            tags: item.tags || []
          }
        });
      }
      
      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data to Pinecone:', error);
      return false;
    }
  }
}

export default PineconeService;