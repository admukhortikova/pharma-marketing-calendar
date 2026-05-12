'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Campaign {
  id: string; name: string; season: string; start_date: string; end_date: string;
  status: string; budget: number; spent: number; regions: string[]; channels: string[];
  objectives: string; checklist: ChecklistItem[]; metrics: Metric[];
  created_by: string;
}
interface ChecklistItem { id: string; title: string; category: string; done: boolean; due_date: string; assigned_to: string; }
interface Metric { name: string; plan: number; fact: number; unit: string; }

const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₽`;
  return `${n} ₽`;
}

export default function ExportPage() {
  const { id } = useParams() as { id: string };
  const [camp, setCamp] = useState<Campaign | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(data => {
      setCamp(data);
      setTimeout(() => window.print(), 800);
    });
  }, [id]);

  if (!camp) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Manrope', color: '#666' }}>Подготовка презентации...</div>;

  const color = SEASON_COLORS[camp.season] || '#6366f1';
  const pct = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
  const doneCount = camp.checklist.filter(i => i.done).length;
  const overdueItems = camp.checklist.filter(i => !i.done && i.due_date && new Date(i.due_date) < new Date());

  const ROLE_LABELS: Record<string, string> = {
    category_manager: 'Категорийный менеджер OTC',
    regional_manager: 'Региональный менеджер',
    finance: 'Финансы',
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; }
        
        @media print {
          body { background: white; }
          .slide { page-break-after: always; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          .slide:last-child { page-break-after: avoid; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
        
        .slide {
          width: 297mm;
          min-height: 210mm;
          background: white;
          margin: 20px auto;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .slide-header {
          padding: 32px 48px 24px;
          color: white;
          position: relative;
        }
        
        .slide-body {
          padding: 32px 48px;
          flex: 1;
        }
        
        .slide-footer {
          padding: 16px 48px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #9ca3af;
        }
        
        .metric-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        
        .tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .progress {
          background: #e5e7eb;
          border-radius: 99px;
          height: 8px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 99px;
        }
      `}</style>

      {/* Кнопка печати (скрывается при печати) */}
      <div className="no-print" style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, display: 'flex', gap: 10 }}>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', background: color, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          🖨 Распечатать / Сохранить PDF
        </button>
        <button onClick={() => window.close()} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          ✕ Закрыть
        </button>
      </div>

      <div style={{ padding: '60px 20px 40px' }}>

        {/* СЛАЙД 1: Титульный */}
        <div className="slide">
          <div className="slide-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, minHeight: 140 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12 }}>
              Маркетинговая кампания · {camp.season}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>{camp.name}</div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14, opacity: 0.9 }}>
              <span>📅 {new Date(camp.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} — {new Date(camp.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>💰 Бюджет: {fmt(camp.budget)}</span>
              <span>📊 Статус: {camp.status}</span>
            </div>
          </div>
          <div className="slide-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Цели кампании</div>
                <div style={{ fontSize: 15, color: '#111827', lineHeight: 1.7 }}>{camp.objectives || 'Не указаны'}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Ключевые параметры</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Регионы:</span>
                    {camp.regions?.map(r => <span key={r} className="tag" style={{ background: `${color}15`, color }}>{r}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Каналы:</span>
                    {camp.channels?.map(ch => <span key={ch} className="tag" style={{ background: '#f3f4f6', color: '#374151' }}>{ch}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Ответственный:</span>
                    <span style={{ fontSize: 13, color: '#111827' }}>{ROLE_LABELS[camp.created_by] || camp.created_by}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <span>PharmaMarketing · Конфиденциально</span>
            <span>Слайд 1 из 4</span>
          </div>
        </div>

        {/* СЛАЙД 2: Бюджет и метрики */}
        <div className="slide">
          <div className="slide-header" style={{ background: '#1f2937', minHeight: 80 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6, marginBottom: 8, color: 'white' }}>Финансы и KPI</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>Бюджет и показатели эффективности</div>
          </div>
          <div className="slide-body">
            {/* Бюджет */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
              {[
                { label: 'Общий бюджет', value: fmt(camp.budget), color: color },
                { label: 'Потрачено', value: fmt(camp.spent), color: '#10b981' },
                { label: 'Освоение', value: `${pct}%`, color: pct > 80 ? '#ef4444' : '#10b981' },
              ].map(({ label, value, color: c }) => (
                <div key={label} className="metric-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: c, fontFamily: 'monospace' }}>{value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div className="progress" style={{ marginBottom: 28 }}>
              <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? '#ef4444' : '#10b981' }} />
            </div>

            {/* Метрики */}
            {camp.metrics.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Метрики план / факт</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(camp.metrics.length, 4)}, 1fr)`, gap: 12 }}>
                  {camp.metrics.map((m, i) => {
                    const p = m.plan > 0 ? Math.round((m.fact / m.plan) * 100) : 0;
                    return (
                      <div key={i} className="metric-card">
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>{m.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>П: {m.plan} {m.unit}</span>
                          <span style={{ fontSize: 11, color: p >= 100 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>Ф: {m.fact || '—'} {m.fact ? m.unit : ''}</span>
                        </div>
                        <div className="progress">
                          <div className="progress-fill" style={{ width: `${Math.min(p, 100)}%`, background: p >= 100 ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>{p}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="slide-footer">
            <span>PharmaMarketing · Конфиденциально</span>
            <span>Слайд 2 из 4</span>
          </div>
        </div>

        {/* СЛАЙД 3: Чек-лист */}
        <div className="slide">
          <div className="slide-header" style={{ background: `linear-gradient(135deg, #059669, #10b981)`, minHeight: 80 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8, color: 'white' }}>Операционный план</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>Чек-лист запуска ({doneCount}/{camp.checklist.length} выполнено)</div>
          </div>
          <div className="slide-body">
            {camp.checklist.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, paddingTop: 40 }}>Чек-лист не заполнен</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {['Материалы', 'Обучение', 'Логистика', 'Согласования'].map(cat => {
                  const items = camp.checklist.filter(i => i.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: 4 }}>{cat}</span>
                      </div>
                      {items.map(item => {
                        const overdue = !item.done && item.due_date && new Date(item.due_date) < new Date();
                        return (
                          <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, background: item.done ? '#10b981' : overdue ? '#ef4444' : '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, marginTop: 1 }}>
                              {item.done ? '✓' : overdue ? '!' : ''}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, color: item.done ? '#9ca3af' : '#111827', textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</div>
                              {item.due_date && <div style={{ fontSize: 11, color: overdue ? '#ef4444' : '#9ca3af' }}>До {new Date(item.due_date).toLocaleDateString('ru-RU')} · {item.assigned_to}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {overdueItems.length > 0 && (
              <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>⚠ Просрочено: {overdueItems.length} задач</span>
              </div>
            )}
          </div>
          <div className="slide-footer">
            <span>PharmaMarketing · Конфиденциально</span>
            <span>Слайд 3 из 4</span>
          </div>
        </div>

        {/* СЛАЙД 4: Сводка */}
        <div className="slide">
          <div className="slide-header" style={{ background: `linear-gradient(135deg, #4f46e5, #7c3aed)`, minHeight: 80 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8, color: 'white' }}>Итоги</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>Сводка кампании</div>
          </div>
          <div className="slide-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Статус выполнения</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Статус кампании', value: camp.status, color: camp.status === 'Активна' ? '#10b981' : camp.status === 'Завершена' ? '#6366f1' : '#f59e0b' },
                    { label: 'Освоение бюджета', value: `${pct}%`, color: pct > 80 ? '#ef4444' : '#10b981' },
                    { label: 'Чек-лист', value: `${doneCount} из ${camp.checklist.length}`, color: doneCount === camp.checklist.length ? '#10b981' : '#f59e0b' },
                    { label: 'Просрочено задач', value: `${overdueItems.length}`, color: overdueItems.length > 0 ? '#ef4444' : '#10b981' },
                  ].map(({ label, value, color: c }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: c, fontFamily: 'monospace' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Охват</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Регионы ({camp.regions?.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {camp.regions?.map(r => <span key={r} className="tag" style={{ background: `${color}15`, color, fontSize: 12 }}>{r}</span>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Каналы ({camp.channels?.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {camp.channels?.map(ch => <span key={ch} className="tag" style={{ background: '#f3f4f6', color: '#374151', fontSize: 12 }}>{ch}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <span>PharmaMarketing · {new Date().toLocaleDateString('ru-RU')} · Конфиденциально</span>
            <span>Слайд 4 из 4</span>
          </div>
        </div>

      </div>
    </>
  );
}
