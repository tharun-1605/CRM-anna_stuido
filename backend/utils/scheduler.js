import Screenshot from '../models/Screenshot.js';

/**
 * Deletes screenshots that are older than 2 months.
 */
export const cleanupOldScreenshots = async () => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    console.log(`[Scheduler] Checking for screenshots older than: ${twoMonthsAgo.toISOString()}`);
    
    const result = await Screenshot.deleteMany({
      date: { $lt: twoMonthsAgo }
    });

    console.log(`[Scheduler] Successfully deleted ${result.deletedCount} old screenshot(s).`);
  } catch (error) {
    console.error('[Scheduler] Error during screenshot cleanup:', error);
  }
};

/**
 * Initializes all background schedules.
 */
export const initScheduler = () => {
  console.log('[Scheduler] Initializing background tasks...');
  
  // Run cleanup once on server startup (delayed slightly to ensure DB connection is ready)
  setTimeout(() => {
    cleanupOldScreenshots();
  }, 5000);

  // Run cleanup every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(cleanupOldScreenshots, TWENTY_FOUR_HOURS);
};
