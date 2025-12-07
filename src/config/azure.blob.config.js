import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

// Azure Blob Storage Configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'localmarket';

// Initialize Blob Service Client
let blobServiceClient;
let containerClient;

try {
  if (AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
    
    // Ensure container exists
    containerClient.createIfNotExists({
      access: 'blob' // Public read access
    }).catch(err => {
      if (err.statusCode !== 409) { // 409 = container already exists
        console.error('Error creating Azure container:', err);
      }
    });
    
    console.log('✅ Azure Blob Storage initialized');
  } else {
    console.warn('⚠️ Azure Blob Storage connection string not provided. Image uploads will not work.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Azure Blob Storage:', error.message);
}

/**
 * Upload file to Azure Blob Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Unique file name
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadToAzureBlob = async (fileBuffer, fileName, contentType = 'image/jpeg') => {
  if (!containerClient) {
    throw new Error('Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env');
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Upload file with content type
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    // Return public URL
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure Blob:', error);
    throw new Error('Failed to upload file to Azure Blob Storage');
  }
};

/**
 * Delete file from Azure Blob Storage
 * @param {string} blobName - Name of the blob to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteFromAzureBlob = async (blobName) => {
  if (!containerClient) {
    return false;
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error('Error deleting from Azure Blob:', error);
    return false;
  }
};

/**
 * Extract blob name from Azure URL
 * @param {string} url - Azure Blob URL
 * @returns {string} Blob name
 */
export const extractBlobNameFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const containerIndex = pathParts.findIndex(part => part === AZURE_STORAGE_CONTAINER_NAME);
    
    if (containerIndex !== -1 && pathParts[containerIndex + 1]) {
      return pathParts.slice(containerIndex + 1).join('/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting blob name from URL:', error);
    return null;
  }
};

export { containerClient, blobServiceClient };

