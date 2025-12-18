"use client";
import React from 'react';
import Link from "next/link";
import { ArrowLeft, MapPin, Wallet } from 'lucide-react';
import { Position as PositionType, Client } from '@/lib/types';
import PipelineBoard from '@/components/positions/pipeline-board';
import PositionHeaderActions from '@/components/positions/PositionHeaderActions'; // Corrected import path

interface PositionDetailClientProps {
    position: PositionType;
    client: Client | null;
    applications: any[];
    candidates: any[];
}

const PositionDetailClient: React.FC<PositionDetailClientProps> = ({ 
    position, 
    client, 
    applications, 
    candidates
}) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      <Link href={client ? `/clients/${client.id}` : "/clients"} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to {client ? client.name : "Clients"}</span>
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{position.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {client && (
                <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {position.location || client.location}
                </span>
            )}
            <span className="text-slate-400">&bull;</span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Wallet className="h-4 w-4" />
              {/* Add salary info if available */}
            </span>
          </div>
        </div>
        
        <PositionHeaderActions 
            positionId={position.id}
            clientId={client?.id || null}
            currentStatus={position.status}
            initialFunnelMetrics={position.funnelMetrics}
        />
      </div>
      
      <PipelineBoard 
        positionId={position.id}
        applications={applications}
        candidates={candidates}
      />
    </div>
  );
};

export default PositionDetailClient;
