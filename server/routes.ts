import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAdSchema, insertGroupSchema, insertSettingSchema } from "@shared/schema";
import { telegramBot } from "./services/telegram-bot";
import { scheduler } from "./services/scheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await telegramBot.initialize();
  await scheduler.start();

  // Ads routes
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.post("/api/ads", async (req, res) => {
    try {
      const result = insertAdSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ad data", errors: result.error.issues });
      }

      const ad = await storage.createAd(result.data);
      
      // Trigger scheduling for new ad
      await scheduler.scheduleNextBatch();
      
      res.status(201).json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.put("/api/ads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertAdSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ad data", errors: result.error.issues });
      }

      const ad = await storage.updateAd(id, result.data);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/ads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAd(id);
      
      if (!success) {
        return res.status(404).json({ message: "Ad not found" });
      }

      res.json({ message: "Ad deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  // Groups routes
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const result = insertGroupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid group data", errors: result.error.issues });
      }

      // Validate group exists and is accessible
      const isValid = await telegramBot.validateGroup(result.data.chatId);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid group chat ID or bot doesn't have access" });
      }

      const group = await storage.createGroup(result.data);
      
      // Trigger scheduling for new group
      await scheduler.scheduleNextBatch();
      
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.put("/api/groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertGroupSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid group data", errors: result.error.issues });
      }

      const group = await storage.updateGroup(id, result.data);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGroup(id);
      
      if (!success) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json({ message: "Group deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Logs routes
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const result = insertSettingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid setting data", errors: result.error.issues });
      }

      const setting = await storage.setSetting(result.data);
      
      // Restart scheduler if auto_send_enabled changed
      if (result.data.key === 'auto_send_enabled') {
        if (result.data.value === 'true') {
          await scheduler.start();
        } else {
          await scheduler.stop();
        }
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const [messagesSent, activeGroups, successRate] = await Promise.all([
        storage.getMessagesSentCount(),
        storage.getActiveGroupsCount(),
        storage.getSuccessRate(),
      ]);

      const nextScheduled = await scheduler.getNextScheduledTime();
      
      res.json({
        messagesSent,
        activeGroups,
        successRate: Math.round(successRate * 10) / 10,
        nextScheduled,
        botOnline: telegramBot.isReady(),
        schedulerRunning: scheduler.isSchedulerRunning(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Bot control routes
  app.post("/api/bot/test", async (req, res) => {
    try {
      await telegramBot.initialize();
      const isReady = telegramBot.isReady();
      if (isReady) {
        res.json({ success: true, message: "Bot conectado exitosamente", isReady });
      } else {
        res.status(400).json({ success: false, message: "No se pudo conectar al bot", isReady: false });
      }
    } catch (error) {
      console.error("Error testing bot connection:", error);
      res.status(400).json({ success: false, message: "Error al conectar el bot", isReady: false });
    }
  });

  app.post("/api/bot/restart", async (req, res) => {
    try {
      await scheduler.stop();
      await telegramBot.initialize();
      await scheduler.start();
      
      await storage.createLog({
        type: 'info',
        message: 'Bot and scheduler restarted manually',
      });

      res.json({ message: "Bot restarted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to restart bot" });
    }
  });

  // Schedules routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Group info routes
  app.get("/api/groups/:id/info", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.getGroup(id);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const groupInfo = await telegramBot.getGroupInfo(group.chatId);
      
      if (!groupInfo) {
        return res.status(400).json({ message: "Cannot access group information" });
      }

      res.json({
        ...group,
        ...groupInfo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group info" });
    }
  });

  // Get enriched groups with Telegram info
  app.get("/api/groups/enriched", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      const enrichedGroups = await Promise.all(
        groups.map(async (group) => {
          const groupInfo = await telegramBot.getGroupInfo(group.chatId);
          return {
            ...group,
            telegramInfo: groupInfo
          };
        })
      );
      
      res.json(enrichedGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enriched groups" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
