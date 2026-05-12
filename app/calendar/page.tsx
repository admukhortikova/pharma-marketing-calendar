'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface SeasonPeak {
  id: string; season: string; name: string; peak_months: number[];
  regions: string[]; description: string; color: string;
}

interface Campaign {
  id: string; name: string; season: string; start_date: string;
  end_date: string; status: string; regions: string[];
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

export default function CalendarPage() {
  const [peaks, setPeaks] = useState<SeasonPeak[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/export').then(r => r.json()).then(d => setPeaks(d.season_peaks || []));
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
  }, []);

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Календарь сезонов и пиков</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>Сезонные паттерны спроса с привязкой к регионам и кампаниям</p>
        </div>

        {/* Легенда */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {Object.entries(SEASON_COLORS).map(([season, color]) => (
            <div key={season} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 20, cursor: 'pointer', opacity: selected && selected !== season ? 0.4 : 1 }}
              onClick={() => setSelected(selected === season ? null : season)}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 13, color, fontWeight: 600 }}>{season}</span>
            </div>
          ))}
        </div>

        {/* Сетка календаря */}
        <div className="card" style={{ padding: 24, marginBottom: 24, overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Тепловая карта сезонов</h3>
          <div style={{ minWidth: 700 }}>
            {/* Заголовок месяцев */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(12, 1fr)', gap: 4, marginBottom: 8 }}>
              <div />
              {MONTHS.map((m, i) => (
                <div key={m} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: i + 1 === currentMonth ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'IBM Plex Mono', padding: '4px 0', background: i + 1 === currentMonth ? 'var(--accent-light)' : 'transparent', borderRadius: 4 }}>{m}</div>
              ))}
            </div>

            {/* Строки сезонов */}
            {peaks.filter(p => !selected || p.season === selected).map(peak => (
              <div key={peak.id} style={{ display: 'grid', gridTemplateColumns: '160px repeat(12, 1fr)', gap: 4, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: peak.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{peak.season}</span>
                </div>
                {MONTHS.map((_, i) => {
                  const month = i + 1;
                  const isPeak = peak.peak_months.includes(month);
                  const isCurrent = month === currentMonth;
                  return (
                    <div key={i} style={{ height: 36, borderRadius: 6, background: isPeak ? `${peak.color}${isCurrent ? 'ff' : '60'}` : isCurrent ? 'var(--accent-light)' : 'var(--bg-elevated)', border: isCurrent ? `1px solid var(--accent)` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: isPeak ? 'white' : 'transparent', fontWeight: 700 }}>
                      {isPeak ? '●' : ''}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Строки кампаний */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Кампании</div>
              {campaigns.filter(c => !selected || c.season === selected).filter(c => c.status !== 'Завершена').map(camp => {
                const start = new Date(camp.start_date);
                const end = new Date(camp.end_date);
                return (
                  <div key={camp.id} style={{ display: 'grid', gridTemplateColumns: '160px repeat(12, 1fr)', gap: 4, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</span>
                    </div>
                    {MONTHS.map((_, i) => {
                      const month = i + 1;
                      const year = month >= 10 ? 2025 : 2026;
                      const date = new Date(year, month - 1, 15);
                      const inRange = date >= start && date <= end;
                      const color = SEASON_COLORS[camp.season] || 'var(--accent)';
                      return (
                        <div key={i} style={{ height: 28, borderRadius: 4, background: inRange ? `${color}30` : 'transparent', border: inRange ? `1px solid ${color}60` : '1px solid transparent', cursor: inRange ? 'pointer' : 'default' }}
                          onClick={() => inRange && (window.location.href = `/campaigns/${camp.id}`)} />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Карточки сезонов */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {peaks.filter(p => !selected || p.season === selected).map(peak => (
            <div key={peak.id} className="card" style={{ padding: 20, borderLeft: `3px solid ${peak.color}`, cursor: 'pointer', opacity: selected && selected !== peak.season ? 0.4 : 1 }}
              onClick={() => setSelected(selected === peak.season ? null : peak.season)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: peak.color }}>{peak.season}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {MONTHS.map((m, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: peak.peak_months.includes(i + 1) ? peak.color : 'var(--border)' }} title={m} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{peak.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{peak.description}</div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Регионы</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {peak.regions.map(r => (
                    <span key={r} style={{ fontSize: 10, padding: '2px 8px', background: `${peak.color}15`, color: peak.color, border: `1px solid ${peak.color}30`, borderRadius: 20, fontWeight: 600 }}>{r}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Кампаний в сезоне: {campaigns.filter(c => c.season === peak.season).length}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
