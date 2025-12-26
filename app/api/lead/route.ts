import { NextResponse } from 'next/server';

const SHEET_WEBHOOK = process.env.SHEETS_WEBHOOK!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await fetch(SHEET_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
