import Asset from "../asset/asset.model.js";
import Resource from "../resource/resource.model.js";
import ResourceBooking from "../resourceBooking/resourceBooking.model.js";
import TransferRequest from "../transferRequest/transferRequest.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import ActivityLog from "../activityLog/activityLog.model.js";

// Fetch dashboard metrics counts using MongoDB aggregations
export const getDashboardMetricsService = async (user) => {
  const now = new Date();

  const [assetStats, resourceStats, bookingStats, transferStats, allocationStats] = await Promise.all([
    // Group assets by status to find available and allocated counts
    Asset.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),

    // Group resources by status to find available counts
    Resource.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),

    // Count confirmed bookings active at the current moment
    ResourceBooking.aggregate([
      {
        $match: {
          status: "confirmed",
          startTime: { $lte: now },
          endTime: { $gte: now }
        }
      },
      {
        $count: "count"
      }
    ]),

    // Count pending transfer requests
    TransferRequest.aggregate([
      {
        $match: {
          status: "pending"
        }
      },
      {
        $count: "count"
      }
    ]),

    // Segment active allocations into upcoming vs overdue using conditional summation
    AssetAllocation.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          upcoming: {
            $sum: {
              $cond: [{ $gte: ["$expectedReturnDate", now] }, 1, 0]
            }
          },
          overdue: {
            $sum: {
              $cond: [{ $lt: ["$expectedReturnDate", now] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  // Extract metrics from aggregation results with fallbacks to 0
  const availableAssets = assetStats.find(s => s._id === "available")?.count || 0;
  const allocatedAssets = assetStats.find(s => s._id === "allocated")?.count || 0;
  const availableResources = resourceStats.find(s => s._id === "available")?.count || 0;
  const activeBookings = bookingStats[0]?.count || 0;
  const pendingTransfers = transferStats[0]?.count || 0;
  const upcomingReturns = allocationStats[0]?.upcoming || 0;
  const overdueReturns = allocationStats[0]?.overdue || 0;

  // Retrieve recent activity logs
  const activityQuery = user?.role === 'employee' ? { userId: user.userid } : {};
  let recentActivities = await ActivityLog.find(activityQuery)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name email")
    .lean();

  return {
    metrics: {
      availableAssets,
      allocatedAssets,
      availableResources,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns
    },
    recentActivities
  };
};
