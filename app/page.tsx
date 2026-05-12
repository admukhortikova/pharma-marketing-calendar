'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
  bySeason: Record<string, number>;
  conflicts: Array<{ camp1: string; camp2: string; overlap: string; type: string }>;
}

interface Campaign {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  spent: number;
  regions: string[];
  channels: string[];
}

const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

const STATUS_LABELS: Record<string, string> = {
  'Планирование': 'Планирование', 'Активна': 'Активна', 'Завершена': 'Завершена', 'Приостановлена': 'Приостановлена'
};

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₽`;
  return `${n} ₽`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    'Планирование': { bg: 'rgba(74,82,112,0.2)', color: '#7c85a8', border: 'rgba(74,82,112,0.4)' },
    'Активна': { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    'Завершена': { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    'Приостановлена': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  };
  const s = colors[status] || colors['Планирование'];
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'IBM Plex Mono', display: 'inline-block' }}>{status}</span>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [aiConflicts, setAiConflicts] = useState<{ conflicts: Array<{ campaigns: string[]; type: string; description: string; recommendation: string }>; optimization_tips: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/export').then(r => r.json()).then(d => setStats(d.stats));
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
  }, []);

  const runAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'detect_conflicts', campaigns }),
      });
      const data = await res.json();
      setAiConflicts(data.result);
    } catch {}
    finally { setAiLoading(false); }
  };

  const pct = stats ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Дашборд кампаний</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>
              Маркетинговое планирование · {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/campaigns/new" className="btn-primary">+ Новая кампания</Link>
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Всего кампаний', value: stats?.total || 0, color: 'var(--accent)', fmt: false },
            { label: 'Активных', value: stats?.byStatus['Активна'] || 0, color: '#10b981', fmt: false },
            { label: 'В планировании', value: stats?.byStatus['Планирование'] || 0, color: 'var(--warning)', fmt: false },
            { label: 'Общий бюджет', value: stats?.totalBudget || 0, color: 'var(--accent)', fmt: true },
            { label: 'Освоено', value: stats?.totalSpent || 0, color: '#10b981', fmt: true },
          ].map(({ label, value, color, fmt: f }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'IBM Plex Mono' }}>{f ? fmt(value) : value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Бюджет */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Освоение бюджета</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Потрачено</span>
              <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Потрачено: {fmt(stats?.totalSpent || 0)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Бюджет: {fmt(stats?.totalBudget || 0)}</span>
            </div>
          </div>

          {/* По сезонам */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Кампании по сезонам</h3>
            {stats && Object.entries(stats.bySeason).map(([season, count]) => (
              <div key={season} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season}</span>
                  <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color: SEASON_COLORS[season] || 'var(--accent)', fontWeight: 700 }}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(count / (stats.total || 1)) * 100}%`, background: SEASON_COLORS[season] || 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Конфликты */}
        {stats && stats.conflicts.length > 0 && (
          <div style={{ padding: '12px 20px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 14 }}>Обнаружено {stats.conflicts.length} конфликта кампаний</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>{stats.conflicts[0].camp1} + {stats.conflicts[0].camp2} ({stats.conflicts[0].overlap})</span>
            </div>
          </div>
        )}

        {/* AI анализ */}
        <div className="ai-panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiConflicts ? 20 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--ai-gradient)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◈</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI-анализ конфликтов и оптимизации</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Выявление пересечений кампаний и рекомендации</div>
              </div>
            </div>
            <button onClick={runAI} className="btn-ai" disabled={aiLoading}>
              {aiLoading ? '⏳ Анализ...' : '◈ Запустить AI-анализ'}
            </button>
          </div>

          {aiConflicts && (
            <div style={{ marginTop: 20 }}>
              {aiConflicts.conflicts.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Конфликты</div>
                  {aiConflicts.conflicts.map((c, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.campaigns?.join(' + ')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{c.description}</div>
                      <div style={{ fontSize: 12, color: '#10b981' }}>→ {c.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}
              {aiConflicts.optimization_tips?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Советы по оптимизации</div>
                  {aiConflicts.optimization_tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: 'var(--accent)', fontSize: 12 }}>→</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Таблица кампаний */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Все кампании</h3>
            <Link href="/campaigns" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Все →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Название', 'Сезон', 'Период', 'Регионы', 'Бюджет', 'Освоено', 'Статус'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', borderLeft: `3px solid ${SEASON_COLORS[c.season] || 'transparent'}` }}
                  onClick={() => window.location.href = `/campaigns/${c.id}`}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, color: SEASON_COLORS[c.season], fontWeight: 700 }}>{c.season}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)' }}>
                      {new Date(c.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {new Date(c.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.regions?.slice(0, 2).join(', ')}{c.regions?.length > 2 ? ` +${c.regions.length - 2}` : ''}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: 'var(--text-primary)' }}>{fmt(c.budget)}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: c.spent > 0 ? '#10b981' : 'var(--text-muted)' }}>{fmt(c.spent)}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
