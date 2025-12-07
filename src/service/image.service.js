import { uploadToAzureBlob, deleteFromAzureBlob, extractBlobNameFromUrl } from '../config/azure.blob.config.js';

export class ImageService {
  /**
   * Upload image to Azure Blob Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original file name
   * @param {string} type - Type of image ('user', 'shop', 'product')
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadImage(fileBuffer, originalName, type = 'general') {
    try {
      const { generateFileName } = await import('../middleware/upload.middleware.js');
      const fileName = generateFileName(originalName, type);
      const contentType = this.getContentType(originalName);
      
      const imageUrl = await uploadToAzureBlob(fileBuffer, fileName, contentType);
      return imageUrl;
    } catch (error) {
      console.error('Error in uploadImage service:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete image from Azure Blob Storage
   * @param {string} imageUrl - Full URL of the image to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl) {
        return false;
      }

      const blobName = extractBlobNameFromUrl(imageUrl);
      if (!blobName) {
        return false;
      }

      return await deleteFromAzureBlob(blobName);
    } catch (error) {
      console.error('Error in deleteImage service:', error);
      return false;
    }
  }

  /**
   * Get content type from file extension
   * @param {string} fileName - File name
   * @returns {string} MIME type
   */
  getContentType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return contentTypes[ext] || 'image/jpeg';
  }

  /**
   * Validate image file
   * @param {Object} file - Multer file object
   * @returns {Object} Validation result
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true };
  }
}

