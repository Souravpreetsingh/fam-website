const cron = require('node-cron');
const Booking = require('../models/Booking');
const Newsletter = require('../models/Newsletter');

const startJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily cleanup jobs...');
    try {
      const result = await Booking.updateMany(
        {
          status: 'confirmed',
          checkOut: { $lt: new Date() },
        },
        { status: 'completed', completedAt: new Date() }
      );
      console.log(`[Cron] Completed ${result.modifiedCount} bookings`);
    } catch (error) {
      console.error('[Cron] Booking completion error:', error.message);
    }
  });

  cron.schedule('0 2 * * 0', async () => {
    console.log('[Cron] Running weekly newsletter cleanup...');
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await Newsletter.deleteMany({
        isActive: false,
        unsubscribedAt: { $lt: sixMonthsAgo },
      });
      console.log(`[Cron] Cleaned up ${result.deletedCount} inactive subscribers`);
    } catch (error) {
      console.error('[Cron] Newsletter cleanup error:', error.message);
    }
  });

  console.log('[Cron] Background jobs initialized');
};

module.exports = { startJobs };
