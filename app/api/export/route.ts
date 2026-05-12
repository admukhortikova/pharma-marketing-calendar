import { NextResponse } from 'next/server';
import { getStats, getAllCampaigns, getSeasonPeaks, getAllSKUs } from '@/lib/db';

export async function GET() {
  const stats = getStats();
  const campaigns = getAllCampaigns();
  const peaks = getSeasonPeaks();
  const skus = getAllSKUs();

  // Бюджет по месяцам
  const monthlyBudget: Record<string, number> = {};
  campaigns.forEach(c => {
    const month = c.start_date.substring(0, 7);
    monthlyBudget[month] = (monthlyBudget[month] || 0) + c.budget;
  });

  // Бюджет по каналам
  const channelBudget: Record<string, number> = {};
  campaigns.forEach(c => {
    const perChannel = c.budget / (c.channels.length || 1);
    c.channels.forEach(ch => { channelBudget[ch] = (channelBudget[ch] || 0) + perChannel; });
  });

  // Просроченные чеклисты
  const overdueChecklist: Array<{ campaign: string; item: string; due_date: string }> = [];
  campaigns.forEach(c => {
    c.checklist.forEach(item => {
      if (!item.done && new Date(item.due_date) < new Date()) {
        overdueChecklist.push({ campaign: c.name, item: item.title, due_date: item.due_date });
      }
    });
  });

  return NextResponse.json({
    stats,
    monthly_budget: Object.entries(monthlyBudget).sort(([a], [b]) => a.localeCompare(b)).map(([month, budget]) => ({ month, budget })),
    channel_budget: Object.entries(channelBudget).map(([channel, budget]) => ({ channel, budget })),
    overdue_checklist: overdueChecklist,
    season_peaks: peaks,
    sku_count: skus.length,
  });
}
