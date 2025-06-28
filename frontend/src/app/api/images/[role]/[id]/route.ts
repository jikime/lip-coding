import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string; id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { role, id } = params;
    const response = await axios.get(`${BACKEND_URL}/images/${role}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });
    
    // Handle case where backend returns a URL string
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = JSON.parse(Buffer.from(response.data).toString());
      if (jsonData.url) {
        return NextResponse.json({ url: jsonData.url }, { status: 200 });
      }
    }
    
    // Otherwise, assume it's an image
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error: any) {
    console.error('Get image error:', error.response?.data || error.message);
    
    // Return default placeholder image based on role
    const role = params.role;
    const defaultImageUrl = role === 'mentor' 
      ? 'https://placehold.co/500x500.jpg?text=MENTOR'
      : 'https://placehold.co/500x500.jpg?text=MENTEE';
      
    return NextResponse.json({ url: defaultImageUrl }, { status: 200 });
  }
}