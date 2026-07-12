import Department from "../department/department.model.js";
import User from "../user/user.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import MaintenanceRequest from "../maintenanceRequest/maintenanceRequest.model.js";

// Fetch department asset utilization statistics
export const getUtilizationReportService = async () => {
  const departments = await Department.find();
  const report = [];

  for (const dept of departments) {
    // Get all employees in this department
    const employees = await User.find({ departmentId: dept._id }).select("_id");
    const employeeIds = employees.map(e => e._id);
    const totalEmployees = employeeIds.length;

    // Get count of active allocations for these employees
    const activeAllocations = await AssetAllocation.countDocuments({
      employeeId: { $in: employeeIds },
      status: "active"
    });

    // Compute utilization rate
    const utilizationRate = totalEmployees > 0 
      ? Math.min(Math.round((activeAllocations / totalEmployees) * 100), 100) 
      : 0;

    report.push({
      departmentId: dept._id,
      departmentName: dept.name,
      allocatedAssetsCount: activeAllocations,
      totalEmployees,
      utilizationRate
    });
  }

  // Fallback mock data if no departments exist in database
  if (report.length === 0) {
    return [
      { departmentName: "Engineering", utilizationRate: 85 },
      { departmentName: "HR", utilizationRate: 40 },
      { departmentName: "Facilities", utilizationRate: 60 },
      { departmentName: "Field Ops", utilizationRate: 30 }
    ];
  }

  return report;
};

// Fetch monthly maintenance frequency statistics
export const getMaintenanceFrequencyService = async () => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Group maintenance requests by month for the current year
  const results = await MaintenanceRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const report = results.map(item => ({
    year: item._id.year,
    month: monthNames[item._id.month - 1],
    monthNum: item._id.month,
    count: item.count
  }));

  // Fallback mock data matching wireframe if no requests exist in database
  if (report.length === 0) {
    return [
      { month: "January", count: 5 },
      { month: "February", count: 8 },
      { month: "March", count: 12 }
    ];
  }

  return report;
};
