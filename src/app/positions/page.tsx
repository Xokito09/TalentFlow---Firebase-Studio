"use client";
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { Position } from '../../lib/types';
import Image from 'next/image'; // Import next/image
import { Search, ChevronDown, Check } from 'lucide-react';
import { POSITION_STATUS_CONFIG, POSITION_STATUS_KEYS } from '../../lib/config';
import { usePagination } from '../../hooks/use-pagination';
import { useDebounce } from '../../hooks/use-debounce';
import { FilterDropdown } from '../../components/ui/filter-dropdown';
import PositionsHeader from './header'; // Import the new header component

const AllPositionsList: React.FC = () => {
  const { positions, clients, setViewState } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [clientFilter, setClientFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'client' | 'role' | 'status' | null>(null);

  const uniqueRoles = useMemo(() => Array.from(new Set(positions.map(p => p.title))).sort(), [positions]);

  const filteredPositions = useMemo(() => positions.filter(p => {
      const clientName = clients.find(c => c.id === p.clientId)?.name.toLowerCase() || '';
      const matchesSearch = 
        p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        clientName.includes(debouncedSearchTerm.toLowerCase());
      
      const matchesClient = clientFilter ? p.clientId === clientFilter : true;
      const matchesRole = roleFilter ? p.title === roleFilter : true;
      const matchesStatus = statusFilter ? p.status === statusFilter : true;

      return matchesSearch && matchesClient && matchesRole && matchesStatus;
  }), [positions, clients, debouncedSearchTerm, clientFilter, roleFilter, statusFilter]);

  const { 
    paginatedItems: paginatedPositions, 
    currentPage, 
    totalPages, 
    goToNextPage, 
    goToPreviousPage, 
    startIndex,
    endIndex,
    totalItems
  } = usePagination<Position>(filteredPositions, 10, [debouncedSearchTerm, clientFilter, roleFilter, statusFilter]);

  // Dropdown Helpers
  const getClientLabel = () => {
      if (!clientFilter) return "All Clients";
      return clients.find(c => c.id === clientFilter)?.name || "Unknown Client";
  };

  const getRoleLabel = () => {
      if (!roleFilter) return "All Roles";
      return roleFilter;
  };

  const getStatusLabel = () => {
      if (!statusFilter) return "All Statuses";
      const statusKey = statusFilter as keyof typeof POSITION_STATUS_CONFIG;
      return POSITION_STATUS_CONFIG[statusKey]?.label || statusFilter;
  };

  return (
      <div className="max-w-7xl mx-auto px-6 py-8">
           <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
              <PositionsHeader /> {/* Use the new server component for the header */}
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                      type="text" 
                      placeholder="Search roles or clients..." 
                      className="w-full md:w-64 pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 relative z-10">
                {/* Client Dropdown */}
                <FilterDropdown
                    label={getClientLabel()}
                    isOpen={activeDropdown === 'client'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'client' ? null : 'client')}
                    onClose={() => setActiveDropdown(null)}
                    isActive={!!clientFilter}
                    className="min-w-[180px]"
                >
                    <button onClick={() => { setClientFilter(''); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 border-b border-slate-50">All Clients</button>
                    {clients.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => { setClientFilter(c.id); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 flex justify-between items-center"
                        >
                            <span className="truncate">{c.name}</span>
                            {clientFilter === c.id && <Check className="w-4 h-4 text-purple-500" />}
                        </button>
                    ))}
                </FilterDropdown>

                {/* Role Dropdown */}
                <FilterDropdown
                    label={getRoleLabel()}
                    isOpen={activeDropdown === 'role'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'role' ? null : 'role')}
                    onClose={() => setActiveDropdown(null)}
                    isActive={!!roleFilter}
                    className="min-w-[180px]"
                >
                    <button onClick={() => { setRoleFilter(''); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 border-b border-slate-50">All Roles</button>
                    {uniqueRoles.map(r => (
                        <button 
                            key={r} 
                            onClick={() => { setRoleFilter(r); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 flex justify-between items-center"
                        >
                            <span className="truncate">{r}</span>
                            {roleFilter === r && <Check className="w-4 h-4 text-purple-500" />}
                        </button>
                    ))}
                </FilterDropdown>

                {/* Status Dropdown */}
                <FilterDropdown
                    label={getStatusLabel()}
                    isOpen={activeDropdown === 'status'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    onClose={() => setActiveDropdown(null)}
                    isActive={!!statusFilter}
                    className="min-w-[180px]"
                >
                    <button onClick={() => { setStatusFilter(''); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 border-b border-slate-50">All Statuses</button>
                    {POSITION_STATUS_KEYS.map(s => (
                        <button 
                            key={s} 
                            onClick={() => { setStatusFilter(s); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 flex justify-between items-center"
                        >
                            <span>{POSITION_STATUS_CONFIG[s].label}</span>
                            {statusFilter === s && <Check className="w-4 h-4 text-purple-500" />}
                        </button>
                    ))}
                </FilterDropdown>
                
                {(clientFilter || roleFilter || statusFilter) && (
                    <button 
                        onClick={() => {
                            setClientFilter('');
                            setRoleFilter('');
                            setStatusFilter('');
                        }}
                        className="text-sm text-purple-500 font-medium hover:underline px-2"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative z-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedPositions.map(pos => {
                                const client = clients.find(c => c.id === pos.clientId);
                                const statusKey = pos.status as keyof typeof POSITION_STATUS_CONFIG;
                                const statusConfig = POSITION_STATUS_CONFIG[statusKey] || POSITION_STATUS_CONFIG['Open'];
                                return (
                                    <tr 
                                        key={pos.id} 
                                        onClick={() => setViewState({ type: 'POSITION_DETAIL', positionId: pos.id })}
                                        className="hover:bg-slate-50 group transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-gray-800">{pos.title}</div>
                                            <div className="text-xs text-slate-400">{pos.location}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {client?.logoUrl && 
                                                  <Image 
                                                    src={client.logoUrl} 
                                                    alt={`${client.name} logo`} 
                                                    width={20} 
                                                    height={20} 
                                                    className="rounded-full"
                                                  />
                                                }
                                                <span className="text-sm font-medium text-slate-700">{client?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{pos.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded whitespace-nowrap ${statusConfig.badgeStyle}`}>
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredPositions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No positions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredPositions.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-xs font-medium text-slate-600 flex items-center">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
      </div>
  );
};

export default AllPositionsList;
