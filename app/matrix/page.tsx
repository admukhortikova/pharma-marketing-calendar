'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface SKU { id: string; name: string; category: string; season: string[]; price: number; stock: number; regions: string[]; }
interface Campaign { id: string; name: string; season: string; sku_ids: string[]; start_date: string; end_date: string; regions: string[]; status: string; budget: number; }

const REGIONS = ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар', 'Ростов-на-Дону', 'Воронеж', 'Сочи'];
const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

export default function MatrixPage() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('Все');
  const [view, setView] = useState<'sku_region' | 'sku_campaign'>('sku_region');

  useEffect(() => {
    fetch('/api/export').then(r => r.json()).then(d => {
      // SKU из отдельного запроса нет, используем данные из кампаний
    });
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
    // Синтетические SKU
    setSkus([
      { id: 'sku-001', name: 'АнтиГрипп Форте 500мг', category: 'ОРВИ', season: ['ОРВИ'], price: 380, stock: 45000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск'] },
      { id: 'sku-002', name: 'КолдФри Комби', category: 'ОРВИ', season: ['ОРВИ'], price: 290, stock: 32000, regions: ['Москва', 'СПб', 'Казань', 'Краснодар'] },
      { id: 'sku-003', name: 'АллергоСтоп 10мг', category: 'Аллергия', season: ['Аллергия'], price: 450, stock: 28000, regions: ['Москва', 'СПб', 'Ростов-на-Дону', 'Воронеж'] },
      { id: 'sku-004', name: 'ПолиНоз Спрей', category: 'Аллергия', season: ['Аллергия'], price: 620, stock: 15000, regions: ['Москва', 'СПб', 'Краснодар'] },
      { id: 'sku-005', name: 'КардиоПлюс 5мг', category: 'Кардио', season: ['Кардио'], price: 890, stock: 22000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань'] },
      { id: 'sku-006', name: 'ГастроНорм Про', category: 'Гастро', season: ['Гастро', 'Летний'], price: 340, stock: 38000, regions: ['Москва', 'СПб', 'Сочи', 'Краснодар'] },
      { id: 'sku-007', name: 'ВитаМин Комплекс', category: 'Летний', season: ['Летний'], price: 560, stock: 19000, regions: ['Москва', 'СПб', 'Екатеринбург'] },
      { id: 'sku-008', name: 'ФлюТаб Экспресс', category: 'ОРВИ', season: ['ОРВИ'], price: 210, stock: 55000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар'] },
    ]);
  }, []);

  const filteredSkus = selectedSeason === 'Все' ? skus : skus.filter(s => s.season.includes(selectedSeason));

  const getStockStatus = (stock: number) => {
    if (stock > 30000) return { color: '#10b981', label: 'Высокий' };
    if (stock > 15000) return { color: '#f59e0b', label: 'Средний' };
    return { color: '#ef4444', label: 'Низкий' };
  };

  const hasCampaign = (skuId: string, region: string) => {
    return campaigns.some(c => c.sku_ids?.includes(skuId) && c.regions?.includes(region) && c.status !== 'Завершена');
  };

  const getCampaignForSku = (skuId: string) => {
    return campaigns.filter(c => c.sku_ids?.includes(skuId) && c.status !== 'Завершена');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Матрица SKU</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>SKU × Регион × Кампании с ограничениями по запасам</p>
        </div>

        {/* Фильтры и переключение */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Все', 'ОРВИ', 'Аллергия', 'Летний', 'Кардио', 'Гастро'].map(s => (
              <button key={s} onClick={() => setSelectedSeason(s)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${selectedSeason === s ? 'var(--accent)' : 'var(--border)'}`, background: selectedSeason === s ? 'var(--accent-light)' : 'transparent', color: selectedSeason === s ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 600 }}>{s}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {[['sku_region', 'SKU × Регион'], ['sku_campaign', 'SKU × Кампании']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v as 'sku_region' | 'sku_campaign')} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`, background: view === v ? 'var(--accent-light)' : 'transparent', color: view === v ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 600 }}>{label}</button>
            ))}
          </div>
        </div>

        {view === 'sku_region' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: 200 }}>SKU / Препарат</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Цена</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Запас</th>
                  {REGIONS.map(r => <th key={r} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: 80 }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredSkus.map(sku => {
                  const stockStatus = getStockStatus(sku.stock);
                  const color = SEASON_COLORS[sku.season[0]] || 'var(--accent)';
                  return (
                    <tr key={sku.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{sku.name}</div>
                        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{sku.season.join(', ')}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color: 'var(--text-primary)', fontWeight: 600 }}>{sku.price} ₽</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: stockStatus.color, fontWeight: 700 }}>{(sku.stock / 1000).toFixed(0)}K</div>
                        <div style={{ fontSize: 10, color: stockStatus.color }}>{stockStatus.label}</div>
                      </td>
                      {REGIONS.map(region => {
                        const inSku = sku.regions.includes(region);
                        const inCampaign = hasCampaign(sku.id, region);
                        return (
                          <td key={region} style={{ padding: '8px', textAlign: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: !inSku ? 'var(--border-subtle)' : inCampaign ? `${color}25` : 'var(--bg-elevated)', border: !inSku ? 'none' : inCampaign ? `1px solid ${color}60` : '1px solid var(--border)' }}>
                              {!inSku ? '' : inCampaign ? '◈' : '○'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>◈ Активная кампания</span>
              <span>○ Присутствует в регионе</span>
              <span style={{ opacity: 0.4 }}>□ Не представлен</span>
            </div>
          </div>
        )}

        {view === 'sku_campaign' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {filteredSkus.map(sku => {
              const skuCampaigns = getCampaignForSku(sku.id);
              const stockStatus = getStockStatus(sku.stock);
              const color = SEASON_COLORS[sku.season[0]] || 'var(--accent)';
              return (
                <div key={sku.id} className="card" style={{ padding: 20, borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{sku.name}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{sku.season.join(', ')}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sku.price} ₽</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: stockStatus.color, fontFamily: 'IBM Plex Mono' }}>{(sku.stock / 1000).toFixed(0)}K</div>
                      <div style={{ fontSize: 10, color: stockStatus.color }}>единиц на складе</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Регионы: {sku.regions.join(', ')}</div>
                  {skuCampaigns.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Активные кампании</div>
                      {skuCampaigns.map(c => (
                        <div key={c.id} style={{ padding: '8px 10px', background: 'var(--accent-light)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, marginBottom: 6, cursor: 'pointer' }}
                          onClick={() => window.location.href = `/campaigns/${c.id}`}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.start_date).toLocaleDateString('ru-RU')} — {new Date(c.end_date).toLocaleDateString('ru-RU')}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Нет активных кампаний</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
