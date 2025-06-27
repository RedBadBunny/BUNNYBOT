import cron from 'node-cron';
import { storage } from '../storage';
import { telegramBot } from './telegram-bot';

class SchedulerService {
  private schedulerTask: cron.ScheduledTask | null = null;
  private isRunning = false;

  async start() {
    if (this.isRunning) return;

    // Run every minute to check for pending schedules
    this.schedulerTask = cron.schedule('* * * * *', async () => {
      await this.processPendingSchedules();
    });

    this.isRunning = true;
    await storage.createLog({
      type: 'info',
      message: 'Scheduler started successfully',
    });

    // Schedule next batch of messages
    await this.scheduleNextBatch();
  }

  async stop() {
    if (this.schedulerTask) {
      this.schedulerTask.stop();
      this.schedulerTask = null;
    }
    
    this.isRunning = false;
    await storage.createLog({
      type: 'info',
      message: 'Scheduler stopped',
    });
  }

  async processPendingSchedules() {
    const autoSendSetting = await storage.getSetting('auto_send_enabled');
    if (autoSendSetting?.value !== 'true') return;

    const pendingSchedules = await storage.getPendingSchedules();
    
    for (const schedule of pendingSchedules) {
      const ad = await storage.getAd(schedule.adId);
      const group = await storage.getGroup(schedule.groupId);

      if (!ad || !group || !ad.isActive || !group.isActive) {
        await storage.updateSchedule(schedule.id, { isCompleted: true });
        continue;
      }

      const success = await telegramBot.sendMessage(
        group.chatId,
        ad.content,
        ad.id,
        group.id
      );

      await storage.updateSchedule(schedule.id, { isCompleted: true });

      if (success) {
        // Schedule next message for this ad-group combination
        await this.scheduleNextMessage(ad.id, group.id);
      }
    }
  }

  async scheduleNextBatch() {
    const ads = await storage.getAds();
    const groups = await storage.getGroups();

    const activeAds = ads.filter(ad => ad.isActive);
    const activeGroups = groups.filter(group => group.isActive);

    for (const ad of activeAds) {
      for (const group of activeGroups) {
        // Check if there's already a pending schedule for this combination
        const existingSchedules = await storage.getSchedules();
        const hasPending = existingSchedules.some(
          schedule => 
            schedule.adId === ad.id && 
            schedule.groupId === group.id && 
            !schedule.isCompleted
        );

        if (!hasPending) {
          await this.scheduleNextMessage(ad.id, group.id);
        }
      }
    }
  }

  private async scheduleNextMessage(adId: number, groupId: number) {
    const intervalSetting = await storage.getSetting('interval_minutes');
    const variationSetting = await storage.getSetting('interval_variation_minutes');

    const baseInterval = parseInt(intervalSetting?.value || '60');
    const variation = parseInt(variationSetting?.value || '10');

    // Calculate random interval: baseInterval ± variation
    const minInterval = baseInterval - variation;
    const maxInterval = baseInterval + variation;
    const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + randomInterval);

    await storage.createSchedule({
      adId,
      groupId,
      scheduledFor,
      isCompleted: false,
    });

    await storage.createLog({
      type: 'info',
      message: `Scheduled next message for ${randomInterval} minutes from now`,
      adId,
      groupId,
    });
  }

  async getNextScheduledTime(): Promise<Date | null> {
    const schedules = await storage.getSchedules();
    const pendingSchedules = schedules.filter(s => !s.isCompleted);
    
    if (pendingSchedules.length === 0) return null;

    return pendingSchedules.reduce((earliest, schedule) => 
      schedule.scheduledFor < earliest ? schedule.scheduledFor : earliest,
      pendingSchedules[0].scheduledFor
    );
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}

export const scheduler = new SchedulerService();
