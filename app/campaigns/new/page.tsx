'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const REGIONS = ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар', 'Ростов-на-Дону', 'Воронеж', 'Сочи'];
const CHANNELS = ['Аптека', 'Диджитал', 'Мерч', 'Полевые визиты', 'Конференции'];
const SEASONS = ['ОРВИ', 'Аллергия', 'Летний', 'Кардио', 'Гастро'];

export default function NewCampaign() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', season: 'ОРВИ', start_date: '', end_date: '',
    regions: [] as string[], channels: [] as string[],
    budget: '', objectives: '', created_by: 'category_manager',
  });
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<Array<{name:string;plan:string;fact:string;unit:string}>>([]);
  const [newMetric, setNewMetric] = useState({name:'',plan:'',fact:'',unit:''});
  const [aiChecklist, setAiChecklist] = useState<null | { checklist: Array<{ id: string; title: string; category: string; done: boolean; due_date: string; assigned_to: string }> }>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const toggle = (field: 'regions' | 'channels', val: string) => {
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }));
  };

  const generateChecklist = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_checklist', campaign: { ...form, budget: Number(form.budget) } }),
      });
      const data = await res.json();
      setAiChecklist(data.result);
    } catch {} finally { setAiLoading(false); }
  };

  const save = async () => {
    if (!form.name || !form.start_date || !form.end_date) { alert('Заполните название и даты'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: Number(form.budget), checklist: aiChecklist?.checklist || [], metrics: metrics.map(m => ({name:m.name, plan:Number(m.plan), fact:Number(m.fact), unit:m.unit})) }),
      });
      const data = await res.json();
      router.push(`/campaigns/${data.id}`);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32, maxWidth: 'calc(100vw - 220px)' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 8 }}>← Назад</button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Новая кампания</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Основное */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Основное</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Название кампании *</label>
                  <input className="input" placeholder="Например: Осенний антигрипп 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label">Сезон *</label>
                    <select className="input" value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))}>
                      {SEASONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Дата начала *</label>
                    <input type="date" className="input" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Дата окончания *</label>
                    <input type="date" className="input" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label">Бюджет (руб.)</label>
                    <input className="input" type="number" placeholder="5000000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Роль создателя</label>
                    <select className="input" value={form.created_by} onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))}>
                      <option value="category_manager">Категорийный менеджер OTC</option>
                      <option value="regional_manager">Региональный менеджер</option>
                      <option value="finance">Финансы</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Цели кампании</label>
                  <textarea className="input" rows={3} placeholder="Опишите цели и KPI кампании..." value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Регионы */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Регионы</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {REGIONS.map(r => (
                  <button key={r} onClick={() => toggle('regions', r)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${form.regions.includes(r) ? 'var(--accent)' : 'var(--border)'}`, background: form.regions.includes(r) ? 'var(--accent-light)' : 'transparent', color: form.regions.includes(r) ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 500 }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Каналы */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Каналы продвижения</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CHANNELS.map(ch => (
                  <button key={ch} onClick={() => toggle('channels', ch)} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${form.channels.includes(ch) ? 'var(--accent)' : 'var(--border)'}`, background: form.channels.includes(ch) ? 'var(--accent-light)' : 'transparent', color: form.channels.includes(ch) ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 600 }}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* AI чеклист */}
            {aiChecklist && (
              <div className="ai-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span>◈</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI-чеклист запуска</span>
                </div>
                {aiChecklist.checklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, padding: '10px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap', height: 'fit-content' }}>{item.category}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>До: {item.due_date} · {item.assigned_to}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Метрики */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>План/Факт метрики</h3>
              {metrics.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <span style={{ flex: 2, fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{m.name}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono' }}>План: {m.plan}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono' }}>Факт: {m.fact || '—'}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)' }}>{m.unit}</span>
                  <button onClick={() => setMetrics(ms => ms.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginTop: 10 }}>
                <input className="input" placeholder="Название метрики" value={newMetric.name} onChange={e => setNewMetric(p => ({...p, name: e.target.value}))} />
                <input className="input" type="number" placeholder="План" value={newMetric.plan} onChange={e => setNewMetric(p => ({...p, plan: e.target.value}))} />
                <input className="input" type="number" placeholder="Факт" value={newMetric.fact} onChange={e => setNewMetric(p => ({...p, fact: e.target.value}))} />
                <input className="input" placeholder="ед." value={newMetric.unit} onChange={e => setNewMetric(p => ({...p, unit: e.target.value}))} />
                <button onClick={() => { if(newMetric.name){ setMetrics(ms => [...ms, newMetric]); setNewMetric({name:'',plan:'',fact:'',unit:''}); }}} className="btn-secondary" style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}>+ Добавить</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={save} className="btn-primary" disabled={saving}>
                {saving ? '⏳ Сохранение...' : 'Создать кампанию'}
              </button>
            </div>
          </div>

          {/* AI панель */}
          <div className="ai-panel" style={{ padding: 24, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, background: 'var(--ai-gradient)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◈</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI-помощник</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Генерация чек-листа запуска</div>
              </div>
            </div>
            <button onClick={generateChecklist} className="btn-ai" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} disabled={aiLoading}>
              {aiLoading ? '⏳ Генерация...' : '◈ Сгенерировать чек-лист'}
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              AI создаст список задач для запуска кампании на основе выбранных каналов, регионов и даты старта. Включает материалы, обучение, логистику и согласования.
            </div>

            {form.name && form.season && (
              <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Предпросмотр</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{form.name}</div>
                {form.season && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Сезон: {form.season}</div>}
                {form.regions.length > 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Регионы: {form.regions.length}</div>}
                {form.channels.length > 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Каналы: {form.channels.join(', ')}</div>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
