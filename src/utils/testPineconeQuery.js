// testPineconeQuery.js
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY
});

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.REACT_APP_PINECONE_API_KEY
});

// Get reference to your index
const index = pinecone.Index('smu-involvement-data'); // Make sure this matches your index name

// Function to get embedding from OpenAI
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

// Function to test a query
async function testQuery(query) {
  try {
    console.log(`Testing query: "${query}"`);
    
    // Get embedding for query
    const queryEmbedding = await getEmbedding(query);
    
    // Query Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });
    
    console.log(`Top ${results.matches.length} results for query "${query}":`);
    
    if (results.matches.length === 0) {
      console.log("No matches found. Check if data was uploaded correctly.");
      return;
    }
    
    results.matches.forEach((match, i) => {
      console.log(`\n${i+1}. ${match.metadata.title} (Score: ${match.score.toFixed(4)})`);
      console.log(`Category: ${match.metadata.category}`);
      console.log(`${match.metadata.text.substring(0, 200)}...`);
    });
  } catch (error) {
    console.error('Error testing query:', error);
  }
}

// Run several test queries
async function runTests() {
  await testQuery("cultural organizations");
  await testQuery("sports clubs");
  await testQuery("business student groups");
  await testQuery("volunteer opportunities");
  await testQuery("leadership roles");
}

// Execute the tests
runTests();