import React from 'react';
import { Client } from '../../lib/types';
import { CLIENT_STATUS_CONFIG } from '../../lib/config';
import { MoreHorizontal } from 'lucide-react';

type ClientCardProps = {
  client: Client;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, onEdit }) => {
  const statusConfig =
    CLIENT_STATUS_CONFIG[client.relationshipStatus] ||
    CLIENT_STATUS_CONFIG.client;

  return (
    <div 
        onClick={onClick}
        className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
    >
        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-lg font-semibold">
          {client.name ? client.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{client.name}</h3>
                    <p className="text-sm text-slate-500">{client.industry}</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusConfig.className}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}></span>
                        {statusConfig.label}
                    </div>
                    <button 
                        onClick={onEdit}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
