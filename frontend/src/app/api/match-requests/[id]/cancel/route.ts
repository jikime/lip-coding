import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/api';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies or Authorization header
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
    
    const requestId = params.id;
    const response = await axios.delete(`${BACKEND_URL}/match-requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Cancel request error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Failed to cancel request' },
      { status: error.response?.status || 500 }
    );
  }
}