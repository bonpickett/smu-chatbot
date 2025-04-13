// Create a file called uploadTestData.js
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.REACT_APP_PINECONE_API_KEY
});

const index = pinecone.Index('smu-involvement-data');

// Sample test data
const testData = [
  {
    id: 'test-org-1',
    title: 'Cultural Student Association',
    text: 'A club dedicated to celebrating diverse cultures on campus through events, discussions, and community service.',
    category: 'cultural',
    tags: ['cultural', 'diversity', 'events']
  },
  {
    id: 'test-org-2',
    title: 'Business Leaders Club',
    text: 'An organization for business majors to network, learn professional skills, and connect with industry partners.',
    category: 'academic',
    tags: ['business', 'professional', 'networking']
  },
  {
    id: 'test-org-3',
    title: 'SMU Sports Club',
    text: 'A recreational sports organization offering activities like basketball, soccer, and volleyball for students of all skill levels.',
    category: 'sports',
    tags: ['sports', 'recreation', 'fitness']
  }
];

// Get embedding
async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

// Upload test data
async function uploadTestData() {
  try {
    console.log("Preparing to upload test data...");
    
    const vectors = [];
    
    for (const item of testData) {
      console.log(`Processing: ${item.title}`);
      
      // Create text for embedding
      const textForEmbedding = `
        Organization: ${item.title} 
        ${item.text}
        Category: ${item.category}
        Tags: ${item.tags.join(', ')}
      `.trim();
      
      // Get embedding
      const embedding = await getEmbedding(textForEmbedding);
      console.log(`Got embedding for: ${item.title}`);
      
      vectors.push({
        id: item.id,
        values: embedding,
        metadata: {
          title: item.title,
          text: item.text,
          category: item.category,
          tags: item.tags
        }
      });
    }
    
    console.log(`Uploading ${vectors.length} test vectors to Pinecone...`);
    
    // Upload to Pinecone
    await index.upsert(vectors);
    
    console.log("Test data upload complete!");
  } catch (error) {
    console.error("Error uploading test data:", error);
  }
}

uploadTestData();