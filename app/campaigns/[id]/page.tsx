'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface Campaign {
  id: string; name: string; season: string; start_date: string; end_date: string;
  status: string; budget: number; spent: number; regions: string[]; channels: string[];
  objectives: string; checklist: ChecklistItem[]; metrics: Metric[];
  ai_risks: string; ai_recommendations: string; created_by: string;
}
interface ChecklistItem { id: string; title: string; category: string; done: boolean; due_date: string; assigned_to: string; }
interface Metric { name: string; plan: number; fact: number; unit: string; }

const SEASON_COLORS: Record<string, string> = {
  'ОРВИ': '#6366f1', 'Аллергия': '#10b981', 'Летний': '#f59e0b', 'Кардио': '#ef4444', 'Гастро': '#8b5cf6'
};
const CHANNELS = ['Аптека', 'Диджитал', 'Мерч', 'Полевые визиты', 'Конференции'];
const REGIONS = ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар', 'Ростов-на-Дону', 'Воронеж', 'Сочи'];
const STATUSES = ['Планирование', 'Активна', 'Приостановлена', 'Завершена'];

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₽`;
  return `${n} ₽`;
}

type Tab = 'overview' | 'checklist' | 'metrics' | 'ai';
type Role = 'category_manager' | 'regional_manager' | 'finance';
const ROLE_LABELS: Record<Role, string> = { category_manager: 'Категорийный менеджер OTC', regional_manager: 'Региональный менеджер', finance: 'Финансы (просмотр)' };

export default function CampaignDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [camp, setCamp] = useState<Campaign | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [role, setRole] = useState<Role>('category_manager');
  const [aiLoading, setAiLoading] = useState('');
  const [aiRisks, setAiRisks] = useState<{ risks: Array<{ title: string; severity: string; description: string; mitigation: string }>; launch_window: string; conflicts_warning: string } | null>(null);
  const [aiRecs, setAiRecs] = useState<{ recommendations: Array<{ category: string; title: string; description: string; impact: string }>; brief_template: string } | null>(null);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: '', plan: '', fact: '', unit: '' });
  const [newChecklistItem, setNewChecklistItem] = useState({ title: '', category: 'Материалы', due_date: '', assigned_to: '' });

  useEffect(() => { fetch(`/api/campaigns/${id}`).then(r => r.json()).then(setCamp); }, [id]);

  const canEdit = role !== 'finance';

  const save = async (data: Partial<Campaign>) => {
    const updated = await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
    setCamp(updated);
  };

  const toggleChecklist = async (itemId: string) => {
    if (!camp) return;
    await save({ checklist: camp.checklist.map(i => i.id === itemId ? { ...i, done: !i.done } : i) });
  };

  const deleteChecklistItem = async (itemId: string) => {
    if (!camp) return;
    await save({ checklist: camp.checklist.filter(i => i.id !== itemId) });
  };

  const addChecklistItem = async () => {
    if (!camp || !newChecklistItem.title) return;
    const item: ChecklistItem = { id: `cl-${Date.now()}`, ...newChecklistItem, done: false };
    await save({ checklist: [...camp.checklist, item] });
    setNewChecklistItem({ title: '', category: 'Материалы', due_date: '', assigned_to: '' });
    setShowAddChecklist(false);
  };

  const addMetric = async () => {
    if (!camp || !newMetric.name) return;
    const metric: Metric = { name: newMetric.name, plan: Number(newMetric.plan), fact: Number(newMetric.fact), unit: newMetric.unit };
    await save({ metrics: [...camp.metrics, metric] });
    setNewMetric({ name: '', plan: '', fact: '', unit: '' });
    setShowAddMetric(false);
  };

  const generateAIChecklist = async () => {
    if (!camp) return;
    setAiLoading('checklist');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_checklist', campaign: camp }),
      });
      const data = await res.json();
      if (data.result?.checklist) {
        await save({ checklist: [...camp.checklist, ...data.result.checklist] });
      }
    } catch {} finally { setAiLoading(''); }
  };

  const runAI = async (action: string) => {
    setAiLoading(action);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, campaign: camp }),
      });
      const data = await res.json();
      if (action === 'analyze_risks') setAiRisks(data.result);
      if (action === 'recommend') setAiRecs(data.result);
    } catch {} finally { setAiLoading(''); }
  };

  if (!camp) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
      </main>
    </div>
  );

  const color = SEASON_COLORS[camp.season] || 'var(--accent)';
  const pct = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
  const doneCount = camp.checklist.filter(i => i.done).length;
  const overdueItems = camp.checklist.filter(i => !i.done && new Date(i.due_date) < new Date());

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32, maxWidth: 'calc(100vw - 220px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }}>← Назад</button>
            {/* Переключатель роли */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Роль:</span>
              <select value={role} onChange={e => setRole(e.target.value as Role)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '6px 12px', fontSize: 12, fontFamily: 'Manrope', cursor: 'pointer', outline: 'none' }}>
                {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {!canEdit && <span style={{ fontSize: 11, color: 'var(--warning)', padding: '3px 8px', background: 'var(--warning-bg)', borderRadius: 20 }}>Только просмотр</span>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color, fontWeight: 700, padding: '3px 12px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 20 }}>{camp.season}</span>
                {canEdit ? (
                  <select value={camp.status} onChange={async e => await save({ status: e.target.value })}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-secondary)', padding: '3px 12px', fontSize: 12, fontFamily: 'Manrope', cursor: 'pointer', outline: 'none' }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 12px', border: '1px solid var(--border)', borderRadius: 20 }}>{camp.status}</span>
                )}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{camp.name}</h1>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>📅 {new Date(camp.start_date).toLocaleDateString('ru-RU')} — {new Date(camp.end_date).toLocaleDateString('ru-RU')}</span>
                <span>📍 {camp.regions?.join(', ')}</span>
                <span>💰 {fmt(camp.budget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {([['overview', 'Обзор'], ['checklist', `Чек-лист (${doneCount}/${camp.checklist.length})`], ['metrics', 'План/Факт'], ['ai', 'AI-анализ']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Manrope', fontSize: 14, fontWeight: tab === key ? 700 : 500, color: tab === key ? 'var(--accent)' : 'var(--text-secondary)', borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1 }}>
              {label}
              {key === 'checklist' && overdueItems.length > 0 && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--danger)', color: 'white', borderRadius: 10, padding: '1px 5px' }}>{overdueItems.length}</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Цели */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Цели кампании</h3>
                {canEdit ? (
                  <textarea className="input" rows={4} defaultValue={camp.objectives} style={{ resize: 'vertical' }}
                    onBlur={async e => await save({ objectives: e.target.value })}
                    placeholder="Опишите цели и KPI кампании..." />
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{camp.objectives || '—'}</p>
                )}
              </div>

              {/* Каналы */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Каналы продвижения</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CHANNELS.map(ch => {
                    const active = camp.channels?.includes(ch);
                    return (
                      <button key={ch} disabled={!canEdit} onClick={async () => {
                        if (!canEdit) return;
                        const updated = active ? camp.channels.filter(c => c !== ch) : [...(camp.channels || []), ch];
                        await save({ channels: updated });
                      }} style={{ padding: '8px 16px', background: active ? 'var(--accent-light)' : 'var(--bg-elevated)', color: active ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: canEdit ? 'pointer' : 'default', fontFamily: 'Manrope' }}>
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Регионы */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Регионы</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {REGIONS.map(r => {
                    const active = camp.regions?.includes(r);
                    return (
                      <button key={r} disabled={!canEdit} onClick={async () => {
                        if (!canEdit) return;
                        const updated = active ? camp.regions.filter(x => x !== r) : [...(camp.regions || []), r];
                        await save({ regions: updated });
                      }} style={{ padding: '6px 14px', background: active ? `${color}15` : 'var(--bg-elevated)', color: active ? color : 'var(--text-muted)', border: `1px solid ${active ? `${color}40` : 'var(--border)'}`, borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: canEdit ? 'pointer' : 'default', fontFamily: 'Manrope' }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Сайдбар */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Бюджет</h3>
                <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'IBM Plex Mono', marginBottom: 4 }}>{fmt(camp.budget)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Потрачено: {fmt(camp.spent)} ({pct}%)</div>
                <div className="progress-bar" style={{ height: 8, marginBottom: 16 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? 'var(--danger)' : '#10b981' }} />
                </div>
                {canEdit && (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <label className="label">Общий бюджет (руб.)</label>
                      <input className="input" type="number" defaultValue={camp.budget} onBlur={async e => await save({ budget: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Потрачено (руб.)</label>
                      <input className="input" type="number" defaultValue={camp.spent} onBlur={async e => await save({ spent: Number(e.target.value) })} />
                    </div>
                  </>
                )}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Прогресс чек-листа</h3>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', fontFamily: 'IBM Plex Mono', marginBottom: 4 }}>{doneCount}/{camp.checklist.length}</div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${camp.checklist.length ? (doneCount / camp.checklist.length) * 100 : 0}%`, background: '#10b981' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {tab === 'checklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {canEdit && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={generateAIChecklist} className="btn-ai" disabled={aiLoading === 'checklist'}>
                  {aiLoading === 'checklist' ? '⏳ Генерация...' : '◈ AI — сгенерировать задачи'}
                </button>
                <button onClick={() => setShowAddChecklist(!showAddChecklist)} className="btn-secondary">
                  + Добавить вручную
                </button>
              </div>
            )}

            {showAddChecklist && canEdit && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Новая задача</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="label">Название *</label>
                    <input className="input" placeholder="Название задачи" value={newChecklistItem.title} onChange={e => setNewChecklistItem(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Категория</label>
                    <select className="input" value={newChecklistItem.category} onChange={e => setNewChecklistItem(p => ({ ...p, category: e.target.value }))}>
                      {['Материалы', 'Обучение', 'Логистика', 'Согласования'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Срок</label>
                    <input type="date" className="input" value={newChecklistItem.due_date} onChange={e => setNewChecklistItem(p => ({ ...p, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Ответственный</label>
                    <input className="input" placeholder="ФИО / отдел" value={newChecklistItem.assigned_to} onChange={e => setNewChecklistItem(p => ({ ...p, assigned_to: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addChecklistItem} className="btn-primary" style={{ fontSize: 13 }}>Добавить</button>
                  <button onClick={() => setShowAddChecklist(false)} className="btn-secondary" style={{ fontSize: 13 }}>Отмена</button>
                </div>
              </div>
            )}

            {['Материалы', 'Обучение', 'Логистика', 'Согласования'].map(cat => {
              const items = camp.checklist.filter(i => i.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="card" style={{ padding: 20 }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat}</h3>
                  {items.map(item => {
                    const overdue = !item.done && item.due_date && new Date(item.due_date) < new Date();
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                        <div onClick={() => toggleChecklist(item.id)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${item.done ? '#10b981' : overdue ? 'var(--danger)' : 'var(--border)'}`, background: item.done ? '#10b981' : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 700 }}>
                          {item.done ? '✓' : ''}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: item.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: overdue ? 'var(--danger)' : 'var(--text-muted)', marginTop: 2 }}>
                            {overdue ? '⚠ Просрочено · ' : ''}{item.due_date ? `До: ${new Date(item.due_date).toLocaleDateString('ru-RU')}` : ''}{item.assigned_to ? ` · ${item.assigned_to}` : ''}
                          </div>
                        </div>
                        {canEdit && (
                          <button onClick={() => deleteChecklistItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {camp.checklist.length === 0 && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Чек-лист пуст</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Нажмите «AI — сгенерировать задачи» или добавьте вручную</div>
              </div>
            )}
          </div>
        )}

        {/* METRICS */}
        {tab === 'metrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {canEdit && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddMetric(!showAddMetric)} className="btn-secondary">+ Добавить метрику</button>
              </div>
            )}

            {showAddMetric && canEdit && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Новая метрика</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label className="label">Название *</label><input className="input" placeholder="Охват аптек" value={newMetric.name} onChange={e => setNewMetric(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><label className="label">План</label><input className="input" type="number" placeholder="1000" value={newMetric.plan} onChange={e => setNewMetric(p => ({ ...p, plan: e.target.value }))} /></div>
                  <div><label className="label">Факт</label><input className="input" type="number" placeholder="0" value={newMetric.fact} onChange={e => setNewMetric(p => ({ ...p, fact: e.target.value }))} /></div>
                  <div><label className="label">Единица</label><input className="input" placeholder="аптек" value={newMetric.unit} onChange={e => setNewMetric(p => ({ ...p, unit: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addMetric} className="btn-primary" style={{ fontSize: 13 }}>Добавить</button>
                  <button onClick={() => setShowAddMetric(false)} className="btn-secondary" style={{ fontSize: 13 }}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {camp.metrics.map((metric, i) => {
                const pctM = metric.plan > 0 ? Math.round((metric.fact / metric.plan) * 100) : 0;
                return (
                  <div key={i} className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>{metric.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>План</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}>{metric.plan} <span style={{ fontSize: 12 }}>{metric.unit}</span></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Факт</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: pctM >= 100 ? '#10b981' : metric.fact > 0 ? 'var(--warning)' : 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>
                          {metric.fact > 0 ? metric.fact : '—'} {metric.fact > 0 && <span style={{ fontSize: 12 }}>{metric.unit}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(pctM, 100)}%`, background: pctM >= 100 ? '#10b981' : 'var(--warning)' }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>{pctM}% от плана</div>
                    {canEdit && (
                      <div style={{ marginTop: 12 }}>
                        <label className="label">Обновить факт</label>
                        <input className="input" type="number" defaultValue={metric.fact} style={{ fontSize: 13 }}
                          onBlur={async e => {
                            const updated = camp.metrics.map((m, j) => j === i ? { ...m, fact: Number(e.target.value) } : m);
                            await save({ metrics: updated });
                          }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {camp.metrics.length === 0 && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Метрики не заданы. Нажмите «Добавить метрику».</div>
              </div>
            )}
          </div>
        )}

        {/* AI */}
        {tab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Окно запуска и риски */}
            <div className="ai-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>◈ Риск-лист и окно запуска</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Конкуренция за внимание, перегруз торговых точек, сезонные риски</div>
                </div>
                <button onClick={() => runAI('analyze_risks')} className="btn-ai" disabled={!!aiLoading}>
                  {aiLoading === 'analyze_risks' ? '⏳ Анализ...' : '◈ Запустить анализ'}
                </button>
              </div>
              {aiRisks ? (
                <div>
                  {aiRisks.launch_window && (
                    <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>🕐 ОПТИМАЛЬНОЕ ОКНО ЗАПУСКА</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{aiRisks.launch_window}</div>
                    </div>
                  )}
                  {aiRisks.conflicts_warning && (
                    <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 700, marginBottom: 2 }}>⚠ КОНФЛИКТЫ РЕСУРСОВ</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{aiRisks.conflicts_warning}</div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {aiRisks.risks?.map((risk, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: risk.severity === 'High' ? 'var(--danger-bg)' : risk.severity === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)', border: `1px solid ${risk.severity === 'High' ? 'rgba(239,68,68,0.25)' : risk.severity === 'Medium' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{risk.title}</div>
                          <span style={{ fontSize: 10, color: risk.severity === 'High' ? 'var(--danger)' : risk.severity === 'Medium' ? 'var(--warning)' : '#10b981', fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{risk.severity}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{risk.description}</div>
                        <div style={{ fontSize: 12, color: '#10b981' }}>→ {risk.mitigation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Нажмите кнопку для анализа рисков и определения оптимального окна запуска</div>
              )}
            </div>

            {/* Рекомендации и бриф */}
            <div className="ai-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>◈ Рекомендации и брифы каналам</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Оптимизация бюджета, каналов, сроков + готовые формулировки для команды</div>
                </div>
                <button onClick={() => runAI('recommend')} className="btn-ai" disabled={!!aiLoading}>
                  {aiLoading === 'recommend' ? '⏳ Генерация...' : '◈ Запустить'}
                </button>
              </div>
              {aiRecs ? (
                <div>
                  {aiRecs.brief_template && (
                    <div style={{ padding: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📝 БРИФ ДЛЯ КАНАЛОВ / КОМАНДЫ</div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{aiRecs.brief_template}</div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {aiRecs.recommendations?.map((rec, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{rec.category}</span>
                          <span style={{ fontSize: 10, color: rec.impact === 'High' ? '#10b981' : 'var(--warning)', fontWeight: 700 }}>{rec.impact}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{rec.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rec.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Нажмите кнопку для получения рекомендаций и брифа для каналов</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
