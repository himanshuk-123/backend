import { UserAddressService } from "../service/userAddress.service.js";
import { ValidationError } from "../service/user.service.js";

const addressService = new UserAddressService();

/**
 * @route   GET /api/address
 * @desc    Get all addresses of logged in user
 * @access  Private
 */
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const addresses = await addressService.getAllAddresses(userId);

    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });

  } catch (error) {
    console.error("Error in getUserAddresses:", error);

    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to fetch addresses",
    });
  }
};


/**
 * @route   GET /api/address/default
 * @desc    Get default address
 * @access  Private
 */
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const address = await addressService.getDefaultAddress(userId);

    res.status(200).json({
      success: true,
      message: "Default address fetched successfully",
      data: address,
    });

  } catch (error) {
    console.error("Error in getDefaultAddress:", error);

    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to fetch default address",
    });
  }
};


/**
 * @route   POST /api/address
 * @desc    Add new address
 * @access  Private
 */
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const newAddress = await addressService.addAddress(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });

  } catch (error) {
    console.error("Error in createAddress:", error);

    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to create address",
    });
  }
};


/**
 * @route   PUT /api/address/:id/set-default
 * @desc    Set a specific address as default
 * @access  Private
 */
export const setDefault = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    await addressService.setDefaultAddress(userId, id);

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });

  } catch (error) {
    console.error("Error in setDefault:", error);

    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to set default address",
    });
  }
};


/**
 * @route   DELETE /api/address/:id
 * @desc    Delete (soft delete) address
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    await addressService.deleteAddress(userId, id);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });

  } catch (error) {
    console.error("Error in deleteAddress:", error);

    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to delete address",
    });
  }
};
