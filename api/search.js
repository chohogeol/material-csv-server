import { NextResponse } from 'next/server';
import CONFIG from './config.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const encodedQ = encodeURIComponent(q);

    const targetUrl = `${CONFIG.GOOGLE_SCRIPT_URL}?q=${encodedQ}`;

    const res = await fetch(targetUrl);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data', detail: error.message },
      { status: 500 }
    );
  }
}
