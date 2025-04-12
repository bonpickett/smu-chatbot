const Papa = require('papaparse');
const fs = require('fs');
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure to set this environment variable
});

// Initialize the Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY // Make sure to set this environment variable
});

// Get a reference to your Pinecone index
const index = pinecone.Index('smu-involvement');

// Function to read and parse the CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, fileData) => {
      if (err) {
        return reject(err);
      }
      
      Papa.parse(fileData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  });
}

// Function to transform organizations data for Pinecone
function transformOrganizationsData(rawData) {
  return rawData.map((org, index) => {
    // Create a unique ID
    const id = `org-${index + 1}`;
    
    // Extract core fields
    const title = org.name || '';
    const description = org.description || '';
    
    // Generate tags from various fields
    const tags = [];
    
    // Add duration as a tag if available
    if (org.duration) {
      tags.push(org.duration.toLowerCase());
    }
    
    // Add recruitment period as a tag if available
    if (org.recruitment_period) {
      tags.push(org.recruitment_period.toLowerCase());
    }
    
    // Add category tags if available
    if (org.category_tags) {
      const categories = org.category_tags.split(',').map(cat => cat.trim().toLowerCase());
      tags.push(...categories);
    }
    
    // Add group type as tag
    if (org.group_type_lookup) {
      tags.push(org.group_type_lookup.toLowerCase());
    }
    
    // Add paid/unpaid status as a tag if available
    if (org.paid_unpaid) {
      tags.push(org.paid_unpaid.toLowerCase());
    }
    
    // Create the text field that combines multiple fields
    const text = `${title}. ${description || ''} ${org.duration ? `Duration: ${org.duration}.` : ''} 
                 ${org.recruitment_period ? `Recruitment Period: ${org.recruitment_period}.` : ''} 
                 ${org.paid_unpaid ? `This is a ${org.paid_unpaid} organization.` : ''}`.trim();
    
    // Determine the appropriate category
    let category = 'organizations';
    if (org.group_type_lookup) {
      const groupType = org.group_type_lookup.toLowerCase();
      if (groupType.includes('greek')) {
        category = 'greek life';
      } else if (groupType.includes('academic')) {
        category = 'academic';
      }
    }
    
    // Return the formatted object
    return {
      id,
      title,
      text,
      category,
      tags: [...new Set(tags)], // Remove duplicates
      // Additional metadata fields
      duration: org.duration || null,
      recruitmentPeriod: org.recruitment_period || null,
      contactName: org.contact || null,
      contactEmail: org.contact_email || null,
      groupType: org.group_type_lookup || null
    };
  });
}

// Function to get embeddings from OpenAI
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

// Function to prepare vectors for Pinecone
async function prepareVectors(transformedData) {
  const vectors = [];
  
  console.log(`Preparing embeddings for ${transformedData.length} organizations...`);
  
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    
    console.log(`Processing item ${i + 1}/${transformedData.length}: ${item.title}`);
    
    // Create text for embedding
    const textForEmbedding = `
      Organization: ${item.title || ''} 
      ${item.text || ''} 
      Type: ${item.groupType || ''}
      Category: ${item.category || ''} 
      Tags: ${Array.isArray(item.tags) ? item.tags.join(', ') : ''}
    `.trim();
    
    // Get embedding
    const embedding = await getEmbedding(textForEmbedding);
    
    vectors.push({
      id: item.id,
      values: embedding,
      metadata: {
        title: item.title,
        text: item.text,
        category: item.category,
        tags: item.tags,
        duration: item.duration,
        recruitmentPeriod: item.recruitmentPeriod,
        contactName: item.contactName,
        contactEmail: item.contactEmail,
        groupType: item.groupType
      }
    });
  }
  
  return vectors;
}

// Function to upload vectors to Pinecone in batches
async function uploadToPinecone(vectors) {
  const batchSize = 10;
  
  console.log(`Uploading ${vectors.length} vectors to Pinecone in batches of ${batchSize}...`);
  
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectors.length/batchSize)}...`);
    
    await index.upsert(batch);
    
    // Add a small delay between batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Upload to Pinecone complete!');
}

// Main function to process the file and upload to Pinecone
async function processAndUpload() {
  try {
    console.log('Starting process...');
    
    // 1. Read and parse the CSV file
    console.log('Reading CSV file...');
    const rawData = await readCSV('./smuorganizations.csv');
    console.log(`CSV file read successfully, found ${rawData.length} rows.`);
    
    // 2. Transform the data
    console.log('Transforming data...');
    const transformedData = transformOrganizationsData(rawData);
    console.log(`Data transformed successfully, created ${transformedData.length} objects.`);
    
    // 3. Prepare vectors with embeddings
    console.log('Preparing vectors with embeddings...');
    const vectors = await prepareVectors(transformedData);
    console.log(`Vectors prepared successfully, created ${vectors.length} vectors.`);
    
    // 4. Upload to Pinecone
    console.log('Uploading to Pinecone...');
    await uploadToPinecone(vectors);
    
    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error in process:', error);
  }
}

// Run the process
processAndUpload();