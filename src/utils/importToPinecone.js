import PineconeService from '../services/PineconeService';
import { smuData } from '../components/smuData';

async function importDataToPinecone() {
  const pineconeService = new PineconeService();
  
  console.log(`Starting import of ${smuData.length} items to Pinecone...`);
  
  try {
    const result = await pineconeService.importData(smuData);
    console.log('Import complete!', result);
  } catch (error) {
    console.error('Import failed:', error);
  }
}