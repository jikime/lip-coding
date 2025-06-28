import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    let token = cookieStore.get('token')?.value;
    
    // If token not found in cookies, try to get it from Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const orderBy = searchParams.get('order_by');
    
    let url = `${BACKEND_URL}/mentors`;
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (orderBy) params.append('order_by', orderBy);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Get mentors error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Failed to get mentors' },
      { status: error.response?.status || 500 }
    );
  }
}