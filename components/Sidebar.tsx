'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', icon: '⬡', label: 'Дашборд' },
  { href: '/calendar', icon: '◫', label: 'Календарь сезонов' },
  { href: '/campaigns', icon: '◈', label: 'Кампании' },
  { href: '/campaigns/new', icon: '+', label: 'Новая кампания' },
  { href: '/matrix', icon: '⊞', label: 'Матрица SKU' },
  { href: '/reports', icon: '▦', label: 'Аналитика' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 12px', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ padding: '0 8px 24px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--ai-gradient)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.3 }}>PharmaMarketing</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono', letterSpacing: 0.5 }}>CAMPAIGN PLANNER</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, padding: '0 12px', marginBottom: 8, textTransform: 'uppercase' }}>Навигация</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(item => {
            const active = item.href === '/' ? path === '/' : path.startsWith(item.href) && !(item.href === '/campaigns' && path === '/campaigns/new');
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: item.icon === '+' ? 18 : 14, fontWeight: 700 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div style={{ padding: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'IBM Plex Mono' }}>AI АКТИВЕН</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Claude Sonnet via OpenRouter</div>
      </div>
    </aside>
  );
}
