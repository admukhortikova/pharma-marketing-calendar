'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface ReportData {
  stats: { total: number; totalBudget: number; totalSpent: number; bySeason: Record<string,number>; byStatus: Record<string,number> };
  monthly_budget: Array<{ month: string; budget: number }>;
  channel_budget: Array<{ channel: string; budget: number }>;
  overdue_checklist: Array<{ campaign: string; item: string; due_date: string }>;
}

const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₽`;
  return `${n} ₽`;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => { fetch('/api/export').then(r => r.json()).then(setData); }, []);

  if (!data) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
      </main>
    </div>
  );

  const maxBudget = Math.max(...data.monthly_budget.map(m => m.budget), 1);
  const maxChannel = Math.max(...data.channel_budget.map(c => c.budget), 1);
  const pct = data.stats.totalBudget > 0 ? Math.round((data.stats.totalSpent / data.stats.totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Аналитика</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>Отчёты по кампаниям, бюджетам и активностям</p>
          </div>
          <button onClick={() => window.print()} className="btn-secondary" style={{ fontSize: 13 }}>
            ↓ Экспорт для совещания
          </button>
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Всего кампаний', value: data.stats.total, color: 'var(--accent)', fmt: false },
            { label: 'Общий бюджет', value: data.stats.totalBudget, color: 'var(--accent)', fmt: true },
            { label: 'Освоено', value: data.stats.totalSpent, color: '#10b981', fmt: true },
            { label: 'Просрочено задач', value: data.overdue_checklist.length, color: data.overdue_checklist.length > 0 ? 'var(--danger)' : '#10b981', fmt: false },
          ].map(({ label, value, color, fmt: f }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'IBM Plex Mono' }}>{f ? fmt(value) : value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Бюджет по месяцам */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Бюджет по месяцам запуска</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {data.monthly_budget.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '3px 3px 0 0', height: `${(m.budget / maxBudget) * 120}px`, minHeight: 4 }} title={fmt(m.budget)} />
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'IBM Plex Mono', textAlign: 'center' }}>{m.month.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Бюджет по каналам */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Распределение по каналам</h3>
            {data.channel_budget.sort((a, b) => b.budget - a.budget).map((c, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.channel}</span>
                  <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color: 'var(--accent)', fontWeight: 700 }}>{fmt(c.budget)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(c.budget / maxChannel) * 100}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* По сезонам */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Кампании по сезонам</h3>
            {Object.entries(data.stats.bySeason).map(([season, count]) => (
              <div key={season} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: `${SEASON_COLORS[season] || '#666'}10`, border: `1px solid ${SEASON_COLORS[season] || '#666'}30`, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: SEASON_COLORS[season], fontFamily: 'IBM Plex Mono', minWidth: 36 }}>{count}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: SEASON_COLORS[season] }}>{season}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.round((count / data.stats.total) * 100)}% от общего числа</div>
                </div>
              </div>
            ))}
          </div>

          {/* Просроченные задачи */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: data.overdue_checklist.length > 0 ? 'var(--danger)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {data.overdue_checklist.length > 0 ? `⚠ Просроченные задачи (${data.overdue_checklist.length})` : '✓ Просрочек нет'}
            </h3>
            {data.overdue_checklist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#10b981' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Все задачи выполнены в срок</div>
              </div>
            ) : data.overdue_checklist.map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700, marginBottom: 2 }}>{item.campaign}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{item.item}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Срок: {new Date(item.due_date).toLocaleDateString('ru-RU')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Общий прогресс бюджета */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Общее освоение бюджета</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Потрачено: {fmt(data.stats.totalSpent)}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: pct > 80 ? 'var(--danger)' : '#10b981' }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? 'var(--danger)' : pct > 60 ? 'var(--warning)' : '#10b981' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>0</span>
            <span>Итого бюджет: {fmt(data.stats.totalBudget)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
