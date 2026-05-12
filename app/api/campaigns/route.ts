import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaigns, createCampaign } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getAllCampaigns());
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const campaign = createCampaign(data);
  return NextResponse.json(campaign, { status: 201 });
}
