const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone client with your API key
const pinecone = new Pinecone({
  apiKey: process.env.REACT_APP_PINECONE_API_KEY
});

async function checkIndex() {
  try {
    // List all indexes
    console.log("Checking available indexes...");
    const response = await pinecone.listIndexes();
    console.log("Available indexes:", response);
    
    // Extract the array of indexes
    const indexes = response.indexes || [];
    
    // If the index exists, check its stats
    const indexName = 'smu-involvement-data'; // Use your actual index name
    const indexExists = indexes.some(idx => idx.name === indexName);
    
    if (indexExists) {
      const index = pinecone.Index(indexName);
      
      // Get index stats
      console.log("\nChecking index statistics...");
      const stats = await index.describeIndexStats();
      console.log("Index stats:", stats);
      
      // Check if there are vectors in the index
      console.log(`\nTotal vectors in index: ${stats.totalVectorCount}`);
      if (stats.totalVectorCount === 0) {
        console.log("No vectors found in the index. The upload process did not complete successfully.");
      }
    } else {
      console.log(`The '${indexName}' index was not found in your Pinecone account.`);
    }
  } catch (error) {
    console.error("Error checking Pinecone index:", error);
  }
}

checkIndex();