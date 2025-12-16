import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedProspects } from '@/lib/repositories/prospects'; // Assuming a new function for paginated prospects

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const { prospects, nextCursor } = await getPaginatedProspects({ cursor, limit });
    const response = NextResponse.json({ prospects, nextCursor });
    response.headers.set('Cache-Control', 'private, max-age=30');

    return response;
  } catch (error)
 {
    console.error('Error fetching paginated prospects:', error);
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 });
  }
}
