'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Campaign {
  id: string; name: string; season: string; start_date: string;
  end_date: string; status: string; budget: number; spent: number;
  regions: string[]; channels: string[]; objectives: string;
}

const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₽`;
  return `${n} ₽`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { 'Планирование': '#7c85a8', 'Активна': '#10b981', 'Завершена': '#818cf8', 'Приостановлена': '#f59e0b' };
  const bgs: Record<string, string> = { 'Планирование': 'rgba(74,82,112,0.2)', 'Активна': 'rgba(16,185,129,0.1)', 'Завершена': 'rgba(99,102,241,0.1)', 'Приостановлена': 'rgba(245,158,11,0.1)' };
  return <span style={{ background: bgs[status], color: colors[status], border: `1px solid ${colors[status]}40`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'IBM Plex Mono', display: 'inline-block' }}>{status}</span>;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState({ status: 'Все', season: 'Все', search: '' });

  useEffect(() => { fetch('/api/campaigns').then(r => r.json()).then(setCampaigns); }, []);

  const filtered = campaigns.filter(c =>
    (filter.status === 'Все' || c.status === filter.status) &&
    (filter.season === 'Все' || c.season === filter.season) &&
    (!filter.search || c.name.toLowerCase().includes(filter.search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Кампании</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>Всего: {filtered.length} из {campaigns.length}</p>
          </div>
          <Link href="/campaigns/new" className="btn-primary">+ Новая кампания</Link>
        </div>

        {/* Фильтры */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Поиск по названию..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
          <select className="input" style={{ width: 'auto' }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            {['Все', 'Планирование', 'Активна', 'Завершена', 'Приостановлена'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={filter.season} onChange={e => setFilter(f => ({ ...f, season: e.target.value }))}>
            {['Все', 'ОРВИ', 'Аллергия', 'Летний', 'Кардио', 'Гастро'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(c => {
            const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
            const color = SEASON_COLORS[c.season] || 'var(--accent)';
            return (
              <div key={c.id} className="card" style={{ padding: 20, cursor: 'pointer', borderLeft: `3px solid ${color}` }}
                onClick={() => window.location.href = `/campaigns/${c.id}`}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{c.season}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                  {c.objectives?.slice(0, 100)}{c.objectives?.length > 100 ? '...' : ''}
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>📅 {new Date(c.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {new Date(c.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                  <span style={{ color: 'var(--text-muted)' }}>📍 {c.regions?.slice(0, 2).join(', ')}{c.regions?.length > 2 ? ` +${c.regions.length - 2}` : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {c.channels?.map(ch => (
                    <span key={ch} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 20, fontWeight: 600 }}>{ch}</span>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Бюджет: {fmt(c.budget)}</span>
                    <span style={{ color: pct > 80 ? 'var(--danger)' : '#10b981', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? 'var(--danger)' : '#10b981' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
