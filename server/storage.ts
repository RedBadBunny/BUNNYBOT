import { 
  ads, groups, schedules, logs, settings,
  type Ad, type InsertAd,
  type Group, type InsertGroup,
  type Schedule, type InsertSchedule,
  type Log, type InsertLog,
  type Setting, type InsertSetting
} from "@shared/schema";

export interface IStorage {
  // Ads
  getAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<boolean>;

  // Groups
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;

  // Schedules
  getSchedules(): Promise<Schedule[]>;
  getPendingSchedules(): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;

  // Logs
  getLogs(limit?: number): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  deleteOldLogs(olderThanDays: number): Promise<number>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getSettings(): Promise<Setting[]>;

  // Stats
  getMessagesSentCount(): Promise<number>;
  getActiveGroupsCount(): Promise<number>;
  getSuccessRate(): Promise<number>;
}

export class MemStorage implements IStorage {
  private ads: Map<number, Ad> = new Map();
  private groups: Map<number, Group> = new Map();
  private schedules: Map<number, Schedule> = new Map();
  private logs: Map<number, Log> = new Map();
  private settings: Map<string, Setting> = new Map();
  
  private currentAdId = 1;
  private currentGroupId = 1;
  private currentScheduleId = 1;
  private currentLogId = 1;
  private currentSettingId = 1;

  constructor() {
    // Initialize default settings
    this.setSetting({ key: 'bot_token', value: process.env.TELEGRAM_BOT_TOKEN || '' });
    this.setSetting({ key: 'auto_send_enabled', value: 'true' });
    this.setSetting({ key: 'interval_minutes', value: '60' });
    this.setSetting({ key: 'interval_variation_minutes', value: '10' });
  }

  // Ads
  async getAds(): Promise<Ad[]> {
    return Array.from(this.ads.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = this.currentAdId++;
    const ad: Ad = {
      id,
      title: insertAd.title,
      content: insertAd.content,
      isActive: insertAd.isActive ?? true,
      createdAt: new Date(),
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: number, update: Partial<InsertAd>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd = { ...ad, ...update };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAd(id: number): Promise<boolean> {
    return this.ads.delete(id);
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.currentGroupId++;
    const group: Group = {
      id,
      name: insertGroup.name,
      chatId: insertGroup.chatId,
      isActive: insertGroup.isActive ?? true,
      createdAt: new Date(),
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, update: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...update };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  // Schedules
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  async getPendingSchedules(): Promise<Schedule[]> {
    const now = new Date();
    return Array.from(this.schedules.values())
      .filter(schedule => !schedule.isCompleted && schedule.scheduledFor <= now)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentScheduleId++;
    const schedule: Schedule = {
      id,
      adId: insertSchedule.adId,
      groupId: insertSchedule.groupId,
      scheduledFor: insertSchedule.scheduledFor,
      isCompleted: insertSchedule.isCompleted ?? false,
      createdAt: new Date(),
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: number, update: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...update };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Logs
  async getLogs(limit = 100): Promise<Log[]> {
    return Array.from(this.logs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentLogId++;
    const log: Log = {
      id,
      type: insertLog.type,
      message: insertLog.message,
      adId: insertLog.adId ?? null,
      groupId: insertLog.groupId ?? null,
      createdAt: new Date(),
    };
    this.logs.set(id, log);
    return log;
  }

  async deleteOldLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deletedCount = 0;
    for (const [id, log] of Array.from(this.logs.entries())) {
      if (log.createdAt < cutoffDate) {
        this.logs.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = this.settings.get(insertSetting.key);
    const id = existing?.id || this.currentSettingId++;
    const setting: Setting = {
      ...insertSetting,
      id,
      updatedAt: new Date(),
    };
    this.settings.set(insertSetting.key, setting);
    return setting;
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  // Stats
  async getMessagesSentCount(): Promise<number> {
    return Array.from(this.logs.values())
      .filter(log => log.type === 'success').length;
  }

  async getActiveGroupsCount(): Promise<number> {
    return Array.from(this.groups.values())
      .filter(group => group.isActive).length;
  }

  async getSuccessRate(): Promise<number> {
    const allMessages = Array.from(this.logs.values())
      .filter(log => log.type === 'success' || log.type === 'error');
    
    if (allMessages.length === 0) return 100;
    
    const successMessages = allMessages.filter(log => log.type === 'success');
    return (successMessages.length / allMessages.length) * 100;
  }
}

export const storage = new MemStorage();
