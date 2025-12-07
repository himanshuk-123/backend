import { UserAddressRepository } from '../repositories/userAddress.repository.js';
import { ValidationError } from './user.service.js';

export class UserAddressService {

  constructor() {
    this.addressRepo = new UserAddressRepository();
  }

  async getAllAddresses(userId) {
    if (!userId) throw new ValidationError('User ID is required');

    return await this.addressRepo.getUserAddresses(userId);
  }


  async getDefaultAddress(userId) {
    if (!userId) throw new ValidationError('User ID is required');

    return await this.addressRepo.getDefaultAddress(userId);
  }


  async addAddress(userId, data) {
    if (!userId) throw new ValidationError('User ID is required');

    if (!data.full_name || !data.phone || !data.house || !data.city || !data.state || !data.pincode) {
      throw new ValidationError('All address fields are required');
    }

    // If this new address is default -> remove previous default
    if (data.is_default === true) {
      await this.addressRepo.removeAllDefaults(userId);
    }

    return await this.addressRepo.createAddress(userId, data);
  }


  async setDefaultAddress(userId, addressId) {
    if (!userId) throw new ValidationError('User ID is required');
    if (!addressId) throw new ValidationError('Address ID is required');

    await this.addressRepo.removeAllDefaults(userId);

    const updated = await this.addressRepo.setDefaultAddress(userId, addressId);

    if (!updated) {
      throw new ValidationError('Address not found or already deleted');
    }

    return true;
  }


  async deleteAddress(userId, addressId) {
    if (!userId) throw new ValidationError('User ID is required');
    if (!addressId) throw new ValidationError('Address ID is required');

    const deleted = await this.addressRepo.deleteAddress(userId, addressId);

    if (!deleted) {
      throw new ValidationError('Address not found');
    }

    return true;
  }

}
