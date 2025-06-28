import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    return NextResponse.json({
      message: 'Debug API is working',
      query: request.url,
      headers: Object.fromEntries(request.headers),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}