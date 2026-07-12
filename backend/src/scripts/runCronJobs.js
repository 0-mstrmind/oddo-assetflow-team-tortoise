import mongoose from "mongoose";
import dotenv from "dotenv";
import AssetAllocation from "../modules/assetAllocation/assetAllocation.model.js";
import Notification from "../modules/notification/notification.model.js";
import User from "../modules/user/user.model.js";
import Asset from "../modules/asset/asset.model.js";
import MaintenanceRequest from "../modules/maintenanceRequest/maintenanceRequest.model.js";
import { sendEmail } from "../shared/utils/resend.js";

dotenv.config();

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB database");

    // ==========================================
    // TASK 1: Send Return Reminders (1 Day Prior)
    // ==========================================
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    console.log(`Checking allocations expected between: ${startOfTomorrow.toISOString()} and ${endOfTomorrow.toISOString()}`);

    const allocations = await AssetAllocation.find({
      status: "active",
      expectedReturnDate: { $gte: startOfTomorrow, $lte: endOfTomorrow }
    })
      .populate("employeeId")
      .populate("assetId");

    console.log(`Found ${allocations.length} allocations due tomorrow`);

    for (const allocation of allocations) {
      const user = allocation.employeeId;
      const asset = allocation.assetId;

      if (!user || !user.email || !asset) {
        continue;
      }

      // Create in-app alert notification
      await Notification.create({
        userId: user._id,
        title: "Asset Return Reminder",
        message: `Reminder: Your allocated asset ${asset.name} (${asset.assetTag}) is due for return tomorrow.`,
        type: "alert"
      });

      // Send email reminder via Resend
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
          <h2>Asset Return Reminder</h2>
          <p>Hi ${user.name},</p>
          <p>This is a reminder that the asset <strong>${asset.name} (${asset.assetTag})</strong> allocated to you is scheduled to be returned tomorrow, <strong>${new Date(allocation.expectedReturnDate).toDateString()}</strong>.</p>
          <p>Please ensure it is returned to the inventory manager in good condition.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>AssetFlow Team</strong></p>
        </div>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: `Reminder: Return ${asset.name} tomorrow`,
          html: emailHtml
        });
        console.log(`Sent reminder email to ${user.email} for ${asset.assetTag}`);
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
      }
    }

    // ==========================================
    // TASK 2: Queue Maintenance for Servicing Due
    // ==========================================
    console.log("Checking for assets due for maintenance...");
    
    // Find an administrator to request maintenance under their name
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.warn("No admin user found to request maintenance. Skipping maintenance auto-queue.");
    } else {
      const assets = await Asset.find({ status: { $in: ["available", "allocated"] } }).populate("categoryId");
      const now = new Date();
      let queuedCount = 0;

      for (const asset of assets) {
        const categoryName = asset.categoryId ? asset.categoryId.name.toLowerCase() : "";
        const startDate = asset.acquisitionDate || asset.createdAt;

        // Skip retirement candidates
        let expectedLifeDays = 5 * 365;
        if (categoryName.includes("laptop") || categoryName.includes("electronics")) {
          expectedLifeDays = 4 * 365;
        } else if (categoryName.includes("furniture")) {
          expectedLifeDays = 10 * 365;
        }
        
        const ageInDays = Math.ceil(Math.abs(now - new Date(startDate)) / (1000 * 60 * 60 * 24));
        if (ageInDays >= expectedLifeDays * 0.9) {
          continue; // Let retirement handle this
        }

        // Check time since last completed service
        const lastRequest = await MaintenanceRequest.findOne({ assetId: asset._id, status: "resolved" })
          .sort({ updatedAt: -1 });

        const baseDate = lastRequest ? lastRequest.updatedAt : startDate;
        const daysSinceService = Math.ceil(Math.abs(now - new Date(baseDate)) / (1000 * 60 * 60 * 24));

        if (daysSinceService >= 180) {
          // Check if there is already an active pending/approved/in-progress maintenance request
          const activeRequest = await MaintenanceRequest.findOne({
            assetId: asset._id,
            status: { $in: ["pending", "approved", "in-progress"] }
          });

          if (!activeRequest) {
            // Queue maintenance request
            await MaintenanceRequest.create({
              assetId: asset._id,
              requestedBy: adminUser._id,
              priority: "medium",
              issue: `Automated preventive maintenance (180-day cycle). Days since last service: ${daysSinceService}.`,
              status: "pending"
            });

            // Log notification for admin
            await Notification.create({
              userId: adminUser._id,
              title: "Maintenance Queued",
              message: `Asset ${asset.name} (${asset.assetTag}) was automatically queued for maintenance.`,
              type: "alert"
            });

            console.log(`Queued maintenance request for asset ${asset.assetTag}`);
            queuedCount++;
          }
        }
      }
      console.log(`Maintenance check completed. Queued ${queuedCount} assets.`);
    }

    console.log("Cron script run completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Cron script failed:", error);
    process.exit(1);
  }
};

run();
