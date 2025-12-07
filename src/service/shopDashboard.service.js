import { ShopDashboardRepository } from '../repositories/shopDashboard.repository.js';

const dashboardRepository = new ShopDashboardRepository();

export class ShopDashboardService {

async getDashboardData(shopId, userId) {
  try {
    if (!shopId || isNaN(shopId)) {
      throw new Error('Valid shopId is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const isOwner = await dashboardRepository.isShopOwner(shopId, userId);

    if (!isOwner) {
      throw new Error('Unauthorized access to this shop dashboard');
    }

    const data = await dashboardRepository.getDashboardData(parseInt(shopId));

    return {
      totalProducts: data.totalProducts,
      totalStock: data.totalStock,
      totalOrders: data.totalOrders,
      pendingOrders: data.pendingOrders,
      completedOrders: data.completedOrders,
      totalRevenue: data.totalRevenue,
      bestProduct: data.bestProduct
        ? {
            product_id: data.bestProduct.product_id,
            name: data.bestProduct.name,
            total_sold: data.bestProduct.total_sold,
          }
        : null,
      recentOrders: data.recentOrders
    };

  } catch (error) {
    console.error('Error in ShopDashboardService:', error);
    throw error;
  }
}


}
