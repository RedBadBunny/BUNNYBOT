import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';

class TelegramBotService {
  private bot: TelegramBot | null = null;
  private isInitialized = false;

  async initialize() {
    const botTokenSetting = await storage.getSetting('bot_token');
    const botToken = botTokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      await storage.createLog({
        type: 'error',
        message: 'Bot token not found. Please configure TELEGRAM_BOT_TOKEN environment variable.',
      });
      return false;
    }

    try {
      this.bot = new TelegramBot(botToken, { polling: false });
      
      // Test the bot
      const me = await this.bot.getMe();
      await storage.createLog({
        type: 'info',
        message: `Bot initialized successfully: @${me.username}`,
      });
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      await storage.createLog({
        type: 'error',
        message: `Failed to initialize bot: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return false;
    }
  }

  async sendMessage(chatId: string, message: string, adId?: number, groupId?: number): Promise<boolean> {
    if (!this.bot || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.bot) {
      await storage.createLog({
        type: 'error',
        message: 'Bot not initialized',
        adId,
        groupId,
      });
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
      await storage.createLog({
        type: 'success',
        message: `Message sent successfully to chat ${chatId}`,
        adId,
        groupId,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.createLog({
        type: 'error',
        message: `Failed to send message to chat ${chatId}: ${errorMessage}`,
        adId,
        groupId,
      });
      return false;
    }
  }

  async validateGroup(chatId: string): Promise<boolean> {
    if (!this.bot || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.bot) return false;

    try {
      const chat = await this.bot.getChat(chatId);
      return chat.type === 'group' || chat.type === 'supergroup';
    } catch (error) {
      return false;
    }
  }

  async getGroupInfo(chatId: string): Promise<any> {
    if (!this.bot || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.bot) return null;

    try {
      const chat = await this.bot.getChat(chatId);
      const members = await this.bot.getChatMemberCount(chatId);
      const admins = await this.bot.getChatAdministrators(chatId);
      const me = await this.bot.getMe();
      
      const botMember = admins.find(admin => admin.user.id === me.id);
      const canSendMessages = botMember?.can_post_messages !== false;

      return {
        id: chat.id,
        title: chat.title || 'Sin título',
        type: chat.type,
        memberCount: members,
        description: (chat as any).description || null,
        canSendMessages,
        isBot: true
      };
    } catch (error) {
      return null;
    }
  }

  async getAllBotGroups(): Promise<any[]> {
    // Esta funcionalidad requiere acceso a la API de Telegram Bot
    // Como limitación de la API, no podemos obtener todos los grupos automáticamente
    // Solo podemos verificar grupos específicos por chat ID
    return [];
  }

  isReady(): boolean {
    return this.isInitialized && this.bot !== null;
  }
}

export const telegramBot = new TelegramBotService();
