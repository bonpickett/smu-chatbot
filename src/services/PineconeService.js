import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

class PineconeService {
  constructor() {
    this.apiKey = process.env.REACT_APP_PINECONE_API_KEY;
    this.indexName = 'smu-involvement-data';
    this.baseUrl = `https://${this.indexName}-kc56z2x.svc.aped-4627-b74a.pinecone.io`;
  }

  // Get embedding from OpenAI
  async getEmbedding(text) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  }

  // Search Pinecone for similar vectors
  async search(query, topK = 3) {
    try {
      // Get embedding for the query
      const embedding = await this.getEmbedding(query);
      
      // Query Pinecone
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector: embedding,
          topK: topK,
          includeMetadata: true
        })
      });
      
      const data = await response.json();
      
      // Extract metadata from matches
      return data.matches.map(match => match.metadata);
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      return [];
    }
  }
}

export default PineconeService;