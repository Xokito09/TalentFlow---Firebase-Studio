import { NextRequest, NextResponse } from 'next/server';
import { getApplicationById } from '@/lib/repositories/applications';
import { getCandidateById } from '@/lib/repositories/candidates';
import { getPositionById } from '@/lib/repositories/positions';
import { getClientById } from '@/lib/repositories/clients';

export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
  const { applicationId } = params;

  if (!applicationId) {
    return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
  }

  try {
    const application = await getApplicationById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const [candidate, position] = await Promise.all([
      getCandidateById(application.candidateId),
      getPositionById(application.positionId),
    ]);

    let client = null;
    if (position?.clientId) {
      client = await getClientById(position.clientId);
    }

    return NextResponse.json({ application, candidate, position, client });

  } catch (error) {
    console.error('Error fetching application detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}