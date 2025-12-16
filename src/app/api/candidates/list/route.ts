import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedCandidates } from '@/lib/repositories/candidates';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { candidates, nextCursor } = await getPaginatedCandidates({ cursor, limit });

    const response = NextResponse.json({ candidates, nextCursor });
    response.headers.set('Cache-Control', 'private, max-age=30');
    
    return response;
  } catch (error) {
    console.error('Error fetching paginated candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
