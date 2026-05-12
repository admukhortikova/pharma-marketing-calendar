import { v4 as uuidv4 } from 'uuid';

export type Channel = 'Аптека' | 'Диджитал' | 'Мерч' | 'Полевые визиты' | 'Конференции';
export type Status = 'Планирование' | 'Активна' | 'Завершена' | 'Приостановлена';
export type Role = 'category_manager' | 'regional_manager' | 'finance';
export type Season = 'ОРВИ' | 'Аллергия' | 'Летний' | 'Кардио' | 'Гастро';

export interface SKU {
  id: string;
  name: string;
  category: string;
  season: Season[];
  price: number;
  stock: number; // units available
  regions: string[];
}

export interface Campaign {
  id: string;
  name: string;
  sku_ids: string[];
  season: Season;
  start_date: string;
  end_date: string;
  regions: string[];
  channels: Channel[];
  budget: number;
  spent: number;
  status: Status;
  objectives: string;
  checklist: ChecklistItem[];
  metrics: Metric[];
  ai_risks: string;
  ai_recommendations: string;
  created_by: Role;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'Материалы' | 'Обучение' | 'Логистика' | 'Согласования';
  done: boolean;
  due_date: string;
  assigned_to: string;
}

export interface Metric {
  name: string;
  plan: number;
  fact: number;
  unit: string;
}

export interface SeasonPeak {
  id: string;
  season: Season;
  name: string;
  peak_months: number[]; // 1-12
  regions: string[];
  description: string;
  color: string;
}

// Синтетические SKU
const SKUS: SKU[] = [
  { id: 'sku-001', name: 'АнтиГрипп Форте 500мг', category: 'ОРВИ', season: ['ОРВИ'], price: 380, stock: 45000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск'] },
  { id: 'sku-002', name: 'КолдФри Комби', category: 'ОРВИ', season: ['ОРВИ'], price: 290, stock: 32000, regions: ['Москва', 'СПб', 'Казань', 'Краснодар'] },
  { id: 'sku-003', name: 'АллергоСтоп 10мг', category: 'Аллергия', season: ['Аллергия'], price: 450, stock: 28000, regions: ['Москва', 'СПб', 'Ростов-на-Дону', 'Воронеж'] },
  { id: 'sku-004', name: 'ПолиНоз Спрей', category: 'Аллергия', season: ['Аллергия'], price: 620, stock: 15000, regions: ['Москва', 'СПб', 'Краснодар'] },
  { id: 'sku-005', name: 'КардиоПлюс 5мг', category: 'Кардио', season: ['Кардио'], price: 890, stock: 22000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань'] },
  { id: 'sku-006', name: 'ГастроНорм Про', category: 'Гастро', season: ['Гастро', 'Летний'], price: 340, stock: 38000, regions: ['Москва', 'СПб', 'Сочи', 'Краснодар'] },
  { id: 'sku-007', name: 'ВитаМин Комплекс', category: 'Летний', season: ['Летний'], price: 560, stock: 19000, regions: ['Москва', 'СПб', 'Екатеринбург'] },
  { id: 'sku-008', name: 'ФлюТаб Экспресс', category: 'ОРВИ', season: ['ОРВИ'], price: 210, stock: 55000, regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар'] },
];

// Сезонные пики
const SEASON_PEAKS: SeasonPeak[] = [
  { id: 'sp-001', season: 'ОРВИ', name: 'Сезон ОРВИ / Грипп', peak_months: [10, 11, 12, 1, 2, 3], regions: ['Все регионы'], description: 'Пик заболеваемости ОРВИ и гриппом. Максимальный спрос на противовирусные и симптоматические средства.', color: '#6366f1' },
  { id: 'sp-002', season: 'Аллергия', name: 'Сезон аллергии', peak_months: [4, 5, 6, 7], regions: ['Москва', 'СПб', 'Краснодар', 'Ростов-на-Дону'], description: 'Период цветения. Высокий спрос на антигистаминные препараты и назальные спреи.', color: '#10b981' },
  { id: 'sp-003', season: 'Летний', name: 'Летний сезон', peak_months: [6, 7, 8], regions: ['Сочи', 'Краснодар', 'Москва', 'СПб'], description: 'Активный отдых, туризм, солнечные ожоги. Спрос на витамины и средства для ЖКТ.', color: '#f59e0b' },
  { id: 'sp-004', season: 'Кардио', name: 'Кардио сезон', peak_months: [11, 12, 1, 2, 3, 4], regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск'], description: 'Холодный период — рост кардиологических обращений. Стабильный спрос весь год с зимним пиком.', color: '#ef4444' },
  { id: 'sp-005', season: 'Гастро', name: 'Гастро активность', peak_months: [5, 6, 7, 8, 9], regions: ['Все регионы'], description: 'Летний период — рост ЖКТ-нарушений. Связан с изменением питания и путешествиями.', color: '#8b5cf6' },
];

// Синтетические кампании
let CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Осенний антигрипп 2025',
    sku_ids: ['sku-001', 'sku-002', 'sku-008'],
    season: 'ОРВИ',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск'],
    channels: ['Аптека', 'Диджитал', 'Полевые визиты'],
    budget: 8500000,
    spent: 6200000,
    status: 'Завершена',
    objectives: 'Увеличить долю рынка ОРВИ-препаратов на 3% в ключевых регионах. Охват 1500 аптек.',
    checklist: [
      { id: 'cl-001', title: 'POS-материалы для аптек', category: 'Материалы', done: true, due_date: '2025-09-20', assigned_to: 'Иванова А.' },
      { id: 'cl-002', title: 'Обучение медпредставителей', category: 'Обучение', done: true, due_date: '2025-09-25', assigned_to: 'Петров К.' },
      { id: 'cl-003', title: 'Запуск диджитал-баннеров', category: 'Материалы', done: true, due_date: '2025-10-01', assigned_to: 'Смирнова Л.' },
      { id: 'cl-004', title: 'Согласование с регуляторным отделом', category: 'Согласования', done: true, due_date: '2025-09-15', assigned_to: 'Козлов Д.' },
    ],
    metrics: [
      { name: 'Охват аптек', plan: 1500, fact: 1380, unit: 'аптек' },
      { name: 'Визиты медпредставителей', plan: 4500, fact: 4820, unit: 'визитов' },
      { name: 'Рост продаж', plan: 18, fact: 22, unit: '%' },
      { name: 'ROI кампании', plan: 240, fact: 195, unit: '%' },
    ],
    ai_risks: '',
    ai_recommendations: '',
    created_by: 'category_manager',
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2025-12-31T18:00:00Z',
  },
  {
    id: 'camp-002',
    name: 'Весна без аллергии 2026',
    sku_ids: ['sku-003', 'sku-004'],
    season: 'Аллергия',
    start_date: '2026-03-15',
    end_date: '2026-06-30',
    regions: ['Москва', 'СПб', 'Краснодар', 'Ростов-на-Дону'],
    channels: ['Аптека', 'Диджитал', 'Мерч'],
    budget: 5200000,
    spent: 1800000,
    status: 'Активна',
    objectives: 'Вывести АллергоСтоп в топ-3 антигистаминных препаратов в регионах присутствия.',
    checklist: [
      { id: 'cl-005', title: 'Брендированные стойки для аптек', category: 'Материалы', done: true, due_date: '2026-03-10', assigned_to: 'Волкова Н.' },
      { id: 'cl-006', title: 'Контент для соцсетей (12 постов)', category: 'Материалы', done: true, due_date: '2026-03-12', assigned_to: 'Лебедев С.' },
      { id: 'cl-007', title: 'Тренинг для фармацевтов (онлайн)', category: 'Обучение', done: false, due_date: '2026-04-01', assigned_to: 'Новикова Т.' },
      { id: 'cl-008', title: 'Партнёрство с клиниками аллергологии', category: 'Согласования', done: false, due_date: '2026-04-15', assigned_to: 'Орлов В.' },
    ],
    metrics: [
      { name: 'Охват аптек', plan: 800, fact: 640, unit: 'аптек' },
      { name: 'CTR диджитал', plan: 2.5, fact: 3.1, unit: '%' },
      { name: 'Рост продаж', plan: 25, fact: 18, unit: '%' },
      { name: 'NPS фармацевтов', plan: 70, fact: 0, unit: 'баллов' },
    ],
    ai_risks: '',
    ai_recommendations: '',
    created_by: 'category_manager',
    created_at: '2026-01-20T09:00:00Z',
    updated_at: '2026-03-15T12:00:00Z',
  },
  {
    id: 'camp-003',
    name: 'КардиоЗима 2025-2026',
    sku_ids: ['sku-005'],
    season: 'Кардио',
    start_date: '2025-11-01',
    end_date: '2026-03-31',
    regions: ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск'],
    channels: ['Полевые визиты', 'Конференции'],
    budget: 12000000,
    spent: 9800000,
    status: 'Активна',
    objectives: 'Продвижение КардиоПлюс среди кардиологов и терапевтов. Увеличение назначений на 15%.',
    checklist: [
      { id: 'cl-009', title: 'Научные публикации (3 статьи)', category: 'Материалы', done: true, due_date: '2025-10-15', assigned_to: 'Медотдел' },
      { id: 'cl-010', title: 'Конференция кардиологов (спонсорство)', category: 'Согласования', done: true, due_date: '2025-11-10', assigned_to: 'Захаров А.' },
      { id: 'cl-011', title: 'Обучение медпредставителей по кардио', category: 'Обучение', done: true, due_date: '2025-10-25', assigned_to: 'Тренинг-центр' },
      { id: 'cl-012', title: 'Round table для КОЛ (ключевые врачи)', category: 'Согласования', done: false, due_date: '2026-02-20', assigned_to: 'Захаров А.' },
    ],
    metrics: [
      { name: 'Визиты к врачам', plan: 6000, fact: 5840, unit: 'визитов' },
      { name: 'Охват KOL', plan: 120, fact: 98, unit: 'врачей' },
      { name: 'Рост назначений', plan: 15, fact: 11, unit: '%' },
      { name: 'Участники конференций', plan: 400, fact: 520, unit: 'чел.' },
    ],
    ai_risks: '',
    ai_recommendations: '',
    created_by: 'category_manager',
    created_at: '2025-09-01T08:00:00Z',
    updated_at: '2026-01-15T16:00:00Z',
  },
  {
    id: 'camp-004',
    name: 'Летний ЖКТ 2026',
    sku_ids: ['sku-006', 'sku-007'],
    season: 'Летний',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    regions: ['Москва', 'СПб', 'Сочи', 'Краснодар'],
    channels: ['Аптека', 'Диджитал', 'Мерч'],
    budget: 3800000,
    spent: 0,
    status: 'Планирование',
    objectives: 'Захватить сезонный спрос на ЖКТ-препараты в курортных регионах. Промо в туристических точках.',
    checklist: [
      { id: 'cl-013', title: 'Разработка летних POS-материалов', category: 'Материалы', done: false, due_date: '2026-05-01', assigned_to: 'Дизайн-отдел' },
      { id: 'cl-014', title: 'Договор с аптечными сетями курортов', category: 'Согласования', done: false, due_date: '2026-04-15', assigned_to: 'Коммерческий отдел' },
      { id: 'cl-015', title: 'Таргетированная реклама (туристы)', category: 'Материалы', done: false, due_date: '2026-05-20', assigned_to: 'Диджитал-команда' },
    ],
    metrics: [
      { name: 'Охват аптек в курортных зонах', plan: 200, fact: 0, unit: 'аптек' },
      { name: 'Диджитал охват', plan: 500000, fact: 0, unit: 'просмотров' },
      { name: 'Рост продаж в сезон', plan: 35, fact: 0, unit: '%' },
    ],
    ai_risks: '',
    ai_recommendations: '',
    created_by: 'regional_manager',
    created_at: '2026-02-10T11:00:00Z',
    updated_at: '2026-02-10T11:00:00Z',
  },
];

// CRUD функции
export function getAllCampaigns(): Campaign[] {
  return CAMPAIGNS.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getCampaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find(c => c.id === id);
}

export function createCampaign(data: Partial<Campaign>): Campaign {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: uuidv4(),
    name: data.name || '',
    sku_ids: data.sku_ids || [],
    season: data.season || 'ОРВИ',
    start_date: data.start_date || now.split('T')[0],
    end_date: data.end_date || now.split('T')[0],
    regions: data.regions || [],
    channels: data.channels || [],
    budget: data.budget || 0,
    spent: 0,
    status: 'Планирование',
    objectives: data.objectives || '',
    checklist: data.checklist || [],
    metrics: data.metrics || [],
    ai_risks: '',
    ai_recommendations: '',
    created_by: data.created_by || 'category_manager',
    created_at: now,
    updated_at: now,
  };
  CAMPAIGNS.push(campaign);
  return campaign;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | null {
  const index = CAMPAIGNS.findIndex(c => c.id === id);
  if (index === -1) return null;
  CAMPAIGNS[index] = { ...CAMPAIGNS[index], ...data, id, updated_at: new Date().toISOString() };
  return CAMPAIGNS[index];
}

export function getAllSKUs(): SKU[] { return SKUS; }
export function getSKUById(id: string): SKU | undefined { return SKUS.find(s => s.id === id); }
export function getSeasonPeaks(): SeasonPeak[] { return SEASON_PEAKS; }

export function getStats() {
  const total = CAMPAIGNS.length;
  const byStatus = {
    'Планирование': CAMPAIGNS.filter(c => c.status === 'Планирование').length,
    'Активна': CAMPAIGNS.filter(c => c.status === 'Активна').length,
    'Завершена': CAMPAIGNS.filter(c => c.status === 'Завершена').length,
    'Приостановлена': CAMPAIGNS.filter(c => c.status === 'Приостановлена').length,
  };
  const totalBudget = CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
  const totalSpent = CAMPAIGNS.reduce((s, c) => s + c.spent, 0);
  const bySeason: Record<string, number> = {};
  CAMPAIGNS.forEach(c => { bySeason[c.season] = (bySeason[c.season] || 0) + 1; });

  const conflicts = findConflicts();

  return { total, byStatus, totalBudget, totalSpent, bySeason, conflicts };
}

export function findConflicts(): Array<{camp1: string; camp2: string; overlap: string; type: string}> {
  const conflicts: Array<{camp1: string; camp2: string; overlap: string; type: string}> = [];
  for (let i = 0; i < CAMPAIGNS.length; i++) {
    for (let j = i + 1; j < CAMPAIGNS.length; j++) {
      const a = CAMPAIGNS[i];
      const b = CAMPAIGNS[j];
      // Пересечение по времени и регионам
      const timeOverlap = new Date(a.start_date) <= new Date(b.end_date) && new Date(b.start_date) <= new Date(a.end_date);
      const regionOverlap = a.regions.some(r => b.regions.includes(r));
      const channelOverlap = a.channels.some(ch => b.channels.includes(ch));
      if (timeOverlap && regionOverlap && channelOverlap && a.status !== 'Завершена' && b.status !== 'Завершена') {
        const overlapRegions = a.regions.filter(r => b.regions.includes(r));
        conflicts.push({
          camp1: a.name,
          camp2: b.name,
          overlap: overlapRegions.join(', '),
          type: 'Конфликт каналов и регионов',
        });
      }
    }
  }
  return conflicts;
}

export const REGIONS = ['Москва', 'СПб', 'Екатеринбург', 'Новосибирск', 'Казань', 'Краснодар', 'Ростов-на-Дону', 'Воронеж', 'Сочи'];
export const CHANNELS: Channel[] = ['Аптека', 'Диджитал', 'Мерч', 'Полевые визиты', 'Конференции'];
export const SEASONS: Season[] = ['ОРВИ', 'Аллергия', 'Летний', 'Кардио', 'Гастро'];
export const ROLES: Record<Role, string> = { category_manager: 'Категорийный менеджер OTC', regional_manager: 'Региональный менеджер', finance: 'Финансы' };
