import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'anthropic/claude-sonnet-4-5';

async function callLLM(prompt: string): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pharma-marketing.vercel.app',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: 'Ты отвечаешь ТОЛЬКО валидным JSON без markdown и без текста вокруг.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function parseJSON(text: string) {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : clean);
}

export async function POST(request: NextRequest) {
  try {
    const { action, campaign, campaigns } = await request.json();

    if (action === 'analyze_risks') {
      const prompt = `Ты — маркетинговый аналитик фармацевтической компании.

Проанализируй маркетинговую кампанию и выяви риски:

Кампания: ${campaign.name}
Сезон: ${campaign.season}
Период: ${campaign.start_date} — ${campaign.end_date}
Регионы: ${campaign.regions?.join(', ')}
Каналы: ${campaign.channels?.join(', ')}
Бюджет: ${campaign.budget?.toLocaleString()} руб.
Цели: ${campaign.objectives}

Верни JSON:
{"risks": [{"title": "...", "severity": "High|Medium|Low", "description": "...", "mitigation": "..."}], "launch_window": "Оптимальное окно запуска в 1 предложении", "conflicts_warning": "Предупреждение о возможных конфликтах или пустая строка"}

МАКСИМУМ 4 риска, каждое поле не длиннее 15 слов.`;

      const text = await callLLM(prompt);
      return NextResponse.json({ result: parseJSON(text) });
    }

    if (action === 'recommend') {
      const prompt = `Ты — стратег маркетинга фармкомпании.

Дай рекомендации по оптимизации кампании:

Кампания: ${campaign.name}
Сезон: ${campaign.season}
Каналы: ${campaign.channels?.join(', ')}
Бюджет: ${campaign.budget?.toLocaleString()} руб. / Потрачено: ${campaign.spent?.toLocaleString()} руб.
Метрики план/факт: ${JSON.stringify(campaign.metrics)}

Верни JSON:
{"recommendations": [{"category": "Бюджет|Каналы|Сроки|Регионы", "title": "...", "description": "...", "impact": "High|Medium|Low"}], "brief_template": "Готовый текст внутреннего брифа для команды в 3-4 предложениях"}

МАКСИМУМ 4 рекомендации.`;

      const text = await callLLM(prompt);
      return NextResponse.json({ result: parseJSON(text) });
    }

    if (action === 'detect_conflicts') {
      const activeCampaigns = campaigns.filter((c: { status: string }) => c.status !== 'Завершена');
      const prompt = `Ты — планировщик маркетинговых активностей фармкомпании.

Проанализируй список кампаний и выяви конфликты ресурсов и пересечения:

${activeCampaigns.map((c: { name: string; start_date: string; end_date: string; regions: string[]; channels: string[]; season: string }) => `- ${c.name}: ${c.start_date}—${c.end_date}, регионы: ${c.regions?.join(', ')}, каналы: ${c.channels?.join(', ')}, сезон: ${c.season}`).join('\n')}

Верни JSON:
{"conflicts": [{"campaigns": ["...", "..."], "type": "Временной|Региональный|Канальный|Бюджетный", "description": "...", "recommendation": "..."}], "optimization_tips": ["совет1", "совет2", "совет3"]}

МАКСИМУМ 3 конфликта и 3 совета. Каждое поле не длиннее 20 слов.`;

      const text = await callLLM(prompt);
      return NextResponse.json({ result: parseJSON(text) });
    }

    if (action === 'generate_checklist') {
      const prompt = `Ты — операционный менеджер маркетинга фармкомпании.

Сгенерируй чек-лист запуска кампании:

Кампания: ${campaign.name}
Каналы: ${campaign.channels?.join(', ')}
Дата запуска: ${campaign.start_date}
Регионы: ${campaign.regions?.join(', ')}

Верни JSON:
{"checklist": [{"title": "...", "category": "Материалы|Обучение|Логистика|Согласования", "due_days_before": 14, "assigned_to": "..."}]}

МАКСИМУМ 6 пунктов. Названия не длиннее 8 слов.`;

      const text = await callLLM(prompt);
      const parsed = parseJSON(text);
      const startDate = new Date(campaign.start_date);
      const checklist = parsed.checklist.map((item: { title: string; category: string; due_days_before: number; assigned_to: string }, i: number) => ({
        id: `cl-ai-${i}`,
        title: item.title,
        category: item.category,
        done: false,
        due_date: new Date(startDate.getTime() - item.due_days_before * 86400000).toISOString().split('T')[0],
        assigned_to: item.assigned_to,
      }));
      return NextResponse.json({ result: { checklist } });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('AI error:', e);
    return NextResponse.json({ error: 'AI error: ' + String(e) }, { status: 500 });
  }
}
