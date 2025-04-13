import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

class PineconeService {
  // In PineconeService constructor, add console logs
constructor() {
  this.apiKey = process.env.REACT_APP_PINECONE_API_KEY;
  this.indexName = 'smu-involvement-data';
  this.baseUrl = `https://${this.indexName}-kc56z2x.svc.aped-4627-b74a.pinecone.io`;
  
  console.log("Pinecone service initialized");
  console.log("Index name:", this.indexName);
  console.log("Base URL:", this.baseUrl);
  console.log("API key available:", !!this.apiKey);
}

  // Get embedding from OpenAI
  async getEmbedding(text) {
    try {
      console.log("Getting embedding for:", text.substring(0, 50) + "...");
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      console.log("Embedding received successfully");
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error getting embedding:", error);
      throw error;
    }
  }

  // Search Pinecone for similar vectors
  async search(query, topK = 3) {
    try {
      console.log(`Searching Pinecone for: "${query}"`);
      
      // Get embedding for the query
      const embedding = await this.getEmbedding(query);
      console.log("Got embedding successfully");
      
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
      console.log("Pinecone response:", data);
      console.log(`Found ${data.matches?.length || 0} matches`);
      
      // Extract metadata from matches
      const results = data.matches ? data.matches.map(match => match.metadata) : [];
      console.log("Extracted results:", results);
      
      return results;
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      return [];
    }
  }

  
}

export default PineconeService;