'use client';

import { useState, useRef, useEffect } from 'react';

const ALL_REGIONS = [
  'Москва', 'Санкт-Петербург', 'Московская область', 'Краснодарский край',
  'Свердловская область (Екатеринбург)', 'Новосибирская область', 'Республика Татарстан (Казань)',
  'Ростовская область', 'Воронежская область', 'Краснодар', 'Сочи', 'СПб',
  'Екатеринбург', 'Новосибирск', 'Казань', 'Ростов-на-Дону', 'Воронеж',
  'Нижегородская область (Нижний Новгород)', 'Челябинская область', 'Самарская область',
  'Красноярский край', 'Республика Башкортостан (Уфа)', 'Пермский край',
  'Волгоградская область', 'Саратовская область', 'Тюменская область',
  'Иркутская область', 'Кемеровская область', 'Хабаровский край',
  'Приморский край (Владивосток)', 'Ставропольский край', 'Белгородская область',
  'Тульская область', 'Ярославская область', 'Калининградская область',
  'Ленинградская область', 'Омская область', 'Томская область',
  'Оренбургская область', 'Кировская область', 'Ульяновская область',
  'Пензенская область', 'Рязанская область', 'Тверская область',
  'Липецкая область', 'Курская область', 'Тамбовская область',
  'Брянская область', 'Владимирская область', 'Орловская область',
  'Ивановская область', 'Смоленская область', 'Костромская область',
  'Вологодская область', 'Псковская область', 'Новгородская область',
  'Мурманская область', 'Архангельская область', 'Республика Карелия',
  'Республика Коми', 'Астраханская область', 'Республика Дагестан',
  'Республика Чечня', 'Республика Северная Осетия', 'Кабардино-Балкарская Республика',
  'Республика Адыгея', 'Республика Калмыкия', 'Республика Крым (Симферополь)',
  'Севастополь', 'Республика Бурятия', 'Республика Саха (Якутия)',
  'Амурская область', 'Сахалинская область', 'Камчатский край',
  'Магаданская область', 'Чукотский АО', 'Еврейская АО',
  'Забайкальский край', 'Республика Алтай', 'Алтайский край (Барнаул)',
  'Республика Тыва', 'Республика Хакасия', 'Ханты-Мансийский АО (Сургут)',
  'Ямало-Ненецкий АО', 'Ненецкий АО', 'Республика Марий Эл',
  'Республика Мордовия', 'Республика Чувашия', 'Республика Удмуртия (Ижевск)',
  'Нижний Новгород', 'Уфа', 'Самара', 'Челябинск', 'Красноярск',
  'Пермь', 'Волгоград', 'Саратов', 'Тюмень', 'Иркутск',
  'Хабаровск', 'Владивосток', 'Барнаул', 'Ставрополь', 'Симферополь',
];

// Убираем дубликаты
const UNIQUE_REGIONS = [...new Set(ALL_REGIONS)].sort((a, b) => a.localeCompare(b, 'ru'));

interface RegionSelectorProps {
  selected: string[];
  onChange: (regions: string[]) => void;
  color?: string;
}

export default function RegionSelector({ selected, onChange, color = 'var(--accent)' }: RegionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = UNIQUE_REGIONS.filter(r => r.toLowerCase().includes(search.toLowerCase()));

  const toggle = (region: string) => {
    if (selected.includes(region)) {
      onChange(selected.filter(r => r !== region));
    } else {
      onChange([...selected, region]);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Выбранные регионы */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {selected.map(r => (
          <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: `${color}15`, color, border: `1px solid ${color}40`, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {r}
            <span onClick={() => toggle(r)} style={{ cursor: 'pointer', fontSize: 14, lineHeight: 1, opacity: 0.7 }}>×</span>
          </span>
        ))}
        <button onClick={() => setOpen(!open)} style={{ padding: '4px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope' }}>
          + Добавить регион
        </button>
      </div>

      {/* Выпадающий список */}
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 320, maxHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <input
              className="input"
              placeholder="Поиск региона..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Не найдено</div>
            ) : filtered.map(r => {
              const isSelected = selected.includes(r);
              return (
                <div key={r} onClick={() => toggle(r)} style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: isSelected ? 'var(--accent-light)' : 'transparent', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${isSelected ? color : 'var(--border)'}`, background: isSelected ? color : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                    {isSelected ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: isSelected ? color : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>{r}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Выбрано: {selected.length}</span>
            <button onClick={() => setOpen(false)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Manrope' }}>Готово</button>
          </div>
        </div>
      )}
    </div>
  );
}
