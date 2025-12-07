import { ShopDashboardService } from '../service/shopDashboard.service.js';

const dashboardService = new ShopDashboardService();

/**
 * @route   GET /api/shop/dashboard/:shopId
 * @access  Private (shop owner / admin)
 */
export const getShopDashboard = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.user_id;

    const dashboardData = await dashboardService.getDashboardData(shopId, userId);

    return res.status(200).json({
      success: true,
      message: "Shop dashboard data fetched successfully",
      data: dashboardData
    });

  } catch (error) {

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop dashboard data",
      error: error.message
    });
  }
};

