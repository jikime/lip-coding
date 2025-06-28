import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

export async function PUT(request: Request) {
  try {
    // Log the request body for debugging
    const body = await request.json();
    console.log('Profile update request body:', body);
    
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    console.log('Token from cookies:', token ? 'Found' : 'Not found');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }

    try {
      // Try to call the backend API
      console.log('Calling backend API:', `${BACKEND_URL}/profile`);
      const response = await axios.put(`${BACKEND_URL}/profile`, body, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Backend response:', response.data);
      return NextResponse.json({
        success: true,
        data: response.data
      });
    } catch (backendError: any) {
      console.error('Backend error:', backendError.response?.data || backendError.message);
      return NextResponse.json({
        error: 'Backend API error',
        details: backendError.response?.data || backendError.message,
        status: backendError.response?.status
      }, { status: backendError.response?.status || 500 });
    }
  } catch (error: any) {
    console.error('Profile debug error:', error.message);
    return NextResponse.json({
      error: 'General error',
      message: error.message
    }, { status: 500 });
  }
}