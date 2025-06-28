import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await axios.post(`${BACKEND_URL}/signup`, body);
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Signup failed' },
      { status: error.response?.status || 500 }
    );
  }
}