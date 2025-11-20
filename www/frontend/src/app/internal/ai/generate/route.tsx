import { NextResponse } from 'next/server';

// URL of the Python service within the Docker network
// In local without docker you might use 'http://127.0.0.1:5000'
// In docker-compose use the service name: 'http://ai-engine:5000'
const AI_SERVICE_URL = 'http://ai:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log updated to reflect the new internal route
    console.log(`📡 [Internal Proxy] Forwarding request to AI Engine: ${AI_SERVICE_URL}/generate-schema`);

    // Server-to-Server Call (Server-Side Fetch)
    // This happens INSIDE the Docker/Server network, so it has access to port 5000
    const response = await fetch(`${AI_SERVICE_URL}/generate-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AI Engine responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Error in Internal Proxy:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to communicate with AI Engine' },
      { status: 500 }
    );
  }
}