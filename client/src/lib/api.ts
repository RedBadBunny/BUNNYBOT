import { apiRequest } from './queryClient';
import type { Ad, Group, Log, Schedule, Setting } from '@shared/schema';

export const api = {
  // Ads
  getAds: () => fetch('/api/ads').then(res => res.json()) as Promise<Ad[]>,
  createAd: (ad: { title: string; content: string; isActive: boolean }) =>
    apiRequest('POST', '/api/ads', ad),
  updateAd: (id: number, ad: Partial<{ title: string; content: string; isActive: boolean }>) =>
    apiRequest('PUT', `/api/ads/${id}`, ad),
  deleteAd: (id: number) => apiRequest('DELETE', `/api/ads/${id}`),

  // Groups
  getGroups: () => fetch('/api/groups').then(res => res.json()) as Promise<Group[]>,
  getEnrichedGroups: () => fetch('/api/groups/enriched').then(res => res.json()),
  getGroupInfo: (id: number) => fetch(`/api/groups/${id}/info`).then(res => res.json()),
  createGroup: (group: { name: string; chatId: string; isActive: boolean }) =>
    apiRequest('POST', '/api/groups', group),
  updateGroup: (id: number, group: Partial<{ name: string; chatId: string; isActive: boolean }>) =>
    apiRequest('PUT', `/api/groups/${id}`, group),
  deleteGroup: (id: number) => apiRequest('DELETE', `/api/groups/${id}`),

  // Logs
  getLogs: (limit?: number) => {
    const url = limit ? `/api/logs?limit=${limit}` : '/api/logs';
    return fetch(url).then(res => res.json()) as Promise<Log[]>;
  },

  // Settings
  getSettings: () => fetch('/api/settings').then(res => res.json()) as Promise<Setting[]>,
  updateSetting: (setting: { key: string; value: string }) =>
    apiRequest('POST', '/api/settings', setting),

  // Stats
  getStats: () => fetch('/api/stats').then(res => res.json()),

  // Bot control
  testBot: () => apiRequest('POST', '/api/bot/test'),
  restartBot: () => apiRequest('POST', '/api/bot/restart'),

  // Schedules
  getSchedules: () => fetch('/api/schedules').then(res => res.json()) as Promise<Schedule[]>,
};
