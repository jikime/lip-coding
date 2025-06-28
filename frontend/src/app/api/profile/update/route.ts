import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/api';

export async function PUT(request: Request) {
  try {
    // Get the token from cookies or Authorization header
    const cookieStore = cookies();
    let token = cookieStore.get('token')?.value;
    
    console.log('Profile update request received');
    
    // If token not found in cookies, try to get it from Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Token found in Authorization header');
      }
    }
    
    console.log('Token exists:', !!token);

    if (!token) {
      console.log('No token found in cookies or Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    
    try {
      // Make request to backend
      console.log('Calling backend at:', `${BACKEND_URL}/profile`);
      const response = await axios.put(`${BACKEND_URL}/profile`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile update successful');
      return NextResponse.json(response.data, { status: 200 });
    } catch (axiosError: any) {
      console.error('Backend request failed:', axiosError.response?.status, axiosError.response?.data);
      return NextResponse.json(
        { error: axiosError.response?.data?.detail || 'Backend request failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Update profile error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}