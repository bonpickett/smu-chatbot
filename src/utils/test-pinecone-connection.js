const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize the Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.REACT_APP_PINECONE_API_KEY,
});

async function testConnection() {
  try {
    // List all your indexes
    console.log("Fetching indexes...");
    const response = await pinecone.listIndexes();
    console.log("Available indexes:", response);
    
    // Check if indexes exist in the response
    if (response.indexes && response.indexes.length > 0) {
      const firstIndex = response.indexes[0];
      console.log(`Connecting to index: ${firstIndex.name}`);
      
      const index = pinecone.Index(firstIndex.name);
      const stats = await index.describeIndexStats();
      
      console.log("Connection successful!");
      console.log("Index stats:", stats);
    } else {
      console.log("No indexes found. You need to create an index first.");
    }
  } catch (error) {
    console.error("Error connecting to Pinecone:", error);
  }
}

testConnection();