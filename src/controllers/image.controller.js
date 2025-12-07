import { ImageService } from '../service/image.service.js';
import { UserRepository } from '../repositories/user.repositories.js';
import { ShopRepository } from '../repositories/shop.repositories.js';
import { ProductRepository } from '../repositories/product.repositories.js';
import { ValidationError } from '../service/user.service.js';

const imageService = new ImageService();
const userRepository = new UserRepository();
const shopRepository = new ShopRepository();
const productRepository = new ProductRepository();

/**
 * Upload user profile image
 * @route POST /api/users/upload-image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Validate image
    const validation = imageService.validateImage(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const userId = req.user.user_id;

    // Delete old image if exists
    const existingUser = await userRepository.findById(userId);
    if (existingUser && existingUser.image_url) {
      await imageService.deleteImage(existingUser.image_url);
    }

    // Upload new image
    const imageUrl = await imageService.uploadImage(req.file.buffer, req.file.originalname, 'user');

    // Update user record
    await userRepository.updateImageUrl(userId, imageUrl);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image_url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error in uploadUserImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to upload image'
    });
  }
};

/**
 * Upload shop image
 * @route POST /api/shops/:id/upload-image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadShopImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Validate image
    const validation = imageService.validateImage(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { id: shopId } = req.params;
    const userId = req.user.user_id;

    // Verify shop ownership
    const isOwner = await shopRepository.isOwner(parseInt(shopId), userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload image for this shop'
      });
    }

    // Delete old image if exists
    const existingShop = await shopRepository.findById(parseInt(shopId));
    if (existingShop && existingShop.image_url) {
      await imageService.deleteImage(existingShop.image_url);
    }

    // Upload new image
    const imageUrl = await imageService.uploadImage(req.file.buffer, req.file.originalname, 'shop');

    // Update shop record
    await shopRepository.updateImageUrl(parseInt(shopId), imageUrl);

    res.status(200).json({
      success: true,
      message: 'Shop image uploaded successfully',
      data: {
        image_url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error in uploadShopImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to upload image'
    });
  }
};

/**
 * Upload product image
 * @route POST /api/products/:id/upload-image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Validate image
    const validation = imageService.validateImage(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { id: productId } = req.params;
    const userId = req.user.user_id;

    // Verify product ownership
    const isOwner = await productRepository.isProductOwner(parseInt(productId), userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload image for this product'
      });
    }

    // Delete old image if exists
    const existingProduct = await productRepository.findById(parseInt(productId));
    if (existingProduct && existingProduct.image_url) {
      await imageService.deleteImage(existingProduct.image_url);
    }

    // Upload new image
    const imageUrl = await imageService.uploadImage(req.file.buffer, req.file.originalname, 'product');

    // Update product record
    await productRepository.updateImageUrl(parseInt(productId), imageUrl);

    res.status(200).json({
      success: true,
      message: 'Product image uploaded successfully',
      data: {
        image_url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error in uploadProductImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to upload image'
    });
  }
};

