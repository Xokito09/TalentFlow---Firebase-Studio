"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { Client } from '../../lib/types';
import { Search, Plus, Users, Trophy, Target, ChevronDown, Check } from 'lucide-react';
// import { Security } from '../services/security';
// import { Validators } from '../services/validators';
import { Modal } from '../../components/ui/modal';
import { ClientCard } from '../../components/clients/client-card';
import { FilterDropdown } from '../../components/ui/filter-dropdown';
import { CLIENT_STATUS_CONFIG } from '../../lib/config';

const ClientList: React.FC = () => {
  const { clients, setViewState, addClient, updateClient, viewState } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  // Default to partner (Clients) if no tab specified
  const [activeTab, setActiveTab] = useState<'partner' | 'prospect'>('partner');
  
  // Local Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'churn' | 'open' | 'lost'>('all');
  const [activeDropdown, setActiveDropdown] = useState<'status' | null>(null);

  // Sync internal state with Global ViewState from Sidebar
  useEffect(() => {
    if (viewState.type === 'CLIENT_LIST' && viewState.activeTab) {
        setActiveTab(viewState.activeTab);
        // Reset filter when switching main tabs
        setStatusFilter('all'); 
    }
  }, [viewState]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  
  // -- Form Fields --
  // Identity
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [clientWebsite, setClientWebsite] = useState('');
  const [clientLogo, setClientLogo] = useState('');
  const [clientStatus, setClientStatus] = useState<'client' | 'prospect' | 'churn' | 'lost'>('prospect');
  // Contact
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  // Billing & Admin
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientBillingAddress, setClientBillingAddress] = useState('');
  const [clientBillingEmail, setClientBillingEmail] = useState('');
  const [clientPaymentTerms, setClientPaymentTerms] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // OPTIMIZATION: Memoize filter logic
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
        // 1. Filter by Tab
        if (activeTab === 'partner') {
            // "Clients" tab shows 'client' AND 'churn'
            if (c.relationshipStatus !== 'client' && c.relationshipStatus !== 'churn') return false;
            
            // Apply Sub-Filter for Clients
            if (statusFilter === 'active' && c.relationshipStatus !== 'client') return false;
            if (statusFilter === 'churn' && c.relationshipStatus !== 'churn') return false;

        } else {
            // "Prospects" tab shows 'prospect' AND 'lost'
            if (c.relationshipStatus !== 'prospect' && c.relationshipStatus !== 'lost') return false;

            // Apply Sub-Filter for Prospects
            if (statusFilter === 'open' && c.relationshipStatus !== 'prospect') return false;
            if (statusFilter === 'lost' && c.relationshipStatus !== 'lost') return false;
        }
        
        // 2. Filter by Search
        const search = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(search) || c.industry.toLowerCase().includes(search);
    });
  }, [clients, activeTab, statusFilter, searchTerm]);

  const openNewClientModal = () => {
      setEditingClientId(null);
      // Reset
      setClientName('');
      setClientIndustry('');
      setClientLocation('');
      setClientWebsite('');
      setClientContact('');
      setClientEmail('');
      setClientLogo('');
      setClientTaxId('');
      setClientBillingAddress('');
      setClientBillingEmail('');
      setClientPaymentTerms('');
      setClientNotes('');
      setClientStatus(activeTab === 'partner' ? 'client' : 'prospect'); 
      setIsModalOpen(true);
  };

  const openEditClientModal = (e: React.MouseEvent, client: Client) => {
      e.stopPropagation(); 
      setEditingClientId(client.id);
      // Populate
      setClientName(client.name);
      setClientIndustry(client.industry);
      setClientLocation(client.location);
      setClientWebsite(client.website || '');
      setClientContact(client.pointOfContact);
      setClientEmail(client.contactEmail);
      setClientLogo(client.logoUrl);
      setClientStatus(client.relationshipStatus);
      // Billing
      setClientTaxId(client.taxId || '');
      setClientBillingAddress(client.billingAddress || '');
      setClientBillingEmail(client.billingEmail || '');
      setClientPaymentTerms(client.paymentTerms || '');
      setClientNotes(client.notes || '');
      setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
    //   const validation = Security.validateFile(file);
    //   if (!validation.valid) {
    //       alert(validation.error);
    //       return;
    //   }
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClient = () => {
    //   if (!Validators.required(clientName)) return;

      const baseClient = {
          name: clientName,
          industry: clientIndustry || 'Technology',
          location: clientLocation || 'Remote',
          website: clientWebsite,
          pointOfContact: clientContact || 'Admin',
          contactEmail: clientEmail || 'admin@example.com',
          logoUrl: clientLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=0B1120&color=fff&size=100`,
          relationshipStatus: clientStatus,
          // CRM Fields
          taxId: clientTaxId,
          billingAddress: clientBillingAddress,
          billingEmail: clientBillingEmail,
          paymentTerms: clientPaymentTerms,
          notes: clientNotes
      };

      if (editingClientId) {
          updateClient({
              ...baseClient,
              id: editingClientId,
          });
      } else {
          addClient({
              ...base-client,
              id: `client-${Math.random()}`
          });
      }
      
      setIsModalOpen(false);
  };

  const getStatusFilterLabel = () => {
      if (statusFilter === 'all') return activeTab === 'partner' ? 'All Clients' : 'All Prospects';
      // Use the config labels, mapped to local filter keys
      if (statusFilter === 'active') return CLIENT_STATUS_CONFIG.client.label + 's';
      if (statusFilter === 'churn') return CLIENT_STATUS_CONFIG.churn.label + 's';
      if (statusFilter === 'open') return CLIENT_STATUS_CONFIG.prospect.label + 's';
      if (statusFilter === 'lost') return CLIENT_STATUS_CONFIG.lost.label + 's';
      return 'Status';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative">
      
      {/* New/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClientId ? 'Edit Account' : activeTab === 'partner' ? 'New Client' : 'New Prospect'}
        maxWidth="max-w-2xl"
      >
         <div className="space-y-6 mb-8">
             
             {/* Section 1: Identity */}
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company Identity</h4>
                <div className="flex gap-4 mb-4">
                     <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {clientLogo ? (
                            <img src={clientLogo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name *</label>
                            <input 
                                type="text" 
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                placeholder="e.g. Acme Corp"
                                autoFocus
                            />
                        </div>
                         <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:border-purple-500 hover:text-purple-500 transition-colors shadow-sm">
                             <Plus className="w-3 h-3" /> Upload Logo
                             <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                         </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</label>
                        <input 
                            type="text" 
                            value={clientIndustry}
                            onChange={(e) => setClientIndustry(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="e.g. Fintech"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</label>
                        <input 
                            type="text" 
                            value={clientLocation}
                            onChange={(e) => setClientLocation(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="e.g. New York, NY"
                        />
                    </div>
                </div>

                 {editingClientId && (
                    <div className="mt-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Status</label>
                        <div className="relative">
                            <select
                                value={clientStatus}
                                onChange={(e) => setClientStatus(e.target.value as any)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="prospect">{CLIENT_STATUS_CONFIG.prospect.label}</option>
                                <option value="client">{CLIENT_STATUS_CONFIG.client.label}</option>
                                <option value="churn">{CLIENT_STATUS_CONFIG.churn.label}</option>
                                <option value="lost">{CLIENT_STATUS_CONFIG.lost.label}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                )}
             </div>

             {/* Section 2: Contact Info */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Contact Name</label>
                    <input 
                        type="text" 
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Email</label>
                    <input 
                        type="email" 
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                        placeholder="john@example.com"
                    />
                </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website</label>
                    <input 
                        type="text" 
                        value={clientWebsite}
                        onChange={(e) => setClientWebsite(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                        placeholder="www.example.com"
                    />
                </div>
             </div>

             {/* Section 3: Billing & Admin (Collapsible logic implied by visual separation) */}
             <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    Billing & Administration 
                    <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 rounded">CRM</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tax ID / VAT / CNPJ</label>
                        <input 
                            type="text" 
                            value={clientTaxId}
                            onChange={(e) => setClientTaxId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="e.g. US-12345678"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Terms</label>
                        <input 
                            type="text" 
                            value={clientPaymentTerms}
                            onChange={(e) => setClientPaymentTerms(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="e.g. Net 30"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Email (Invoices)</label>
                        <input 
                            type="email" 
                            value={clientBillingEmail}
                            onChange={(e) => setClientBillingEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="accounts@example.com"
                        />
                    </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Address</label>
                        <input 
                            type="text" 
                            value={clientBillingAddress}
                            onChange={(e) => setClientBillingAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                            placeholder="Full Address"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Internal Notes</label>
                    <textarea 
                        rows={3}
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                        placeholder="Internal notes about billing, decision makers, or processes..."
                    />
                </div>
             </div>

         </div>
         
         <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
                Cancel
             </button>
             <button 
                onClick={handleSaveClient}
                disabled={!clientName.trim()}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {editingClientId ? 'Save Changes' : activeTab === 'partner' ? 'Add Client' : 'Add Prospect'}
            </button>
         </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
           {/* Dynamic Title based on Active Tab */}
           <h1 className="text-3xl font-bold text-gray-800">
               {activeTab === 'partner' ? 'Clients' : 'Prospects'}
           </h1>
           <p className="text-slate-500 mt-1">
               {activeTab === 'partner' 
                    ? 'Manage your active client portfolio and key accounts' 
                    : 'Track potential opportunities and sales pipeline'}
           </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={openNewClientModal}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
            >
                <Plus className="w-4 h-4" /> {activeTab === 'partner' ? 'New Client' : 'New Prospect'}
            </button>
        </div>
      </div>

      {/* Toolbar (Filters & Search) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Left: Filters */}
        <div className="w-full md:w-auto z-10">
            <FilterDropdown
                label={getStatusFilterLabel()}
                isOpen={activeDropdown === 'status'}
                onToggle={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                onClose={() => setActiveDropdown(null)}
                isActive={statusFilter !== 'all'}
                className="w-full md:min-w-[200px]"
            >
                <button onClick={() => { setStatusFilter('all'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 border-b border-slate-50 flex justify-between items-center">
                    <span>{activeTab === 'partner' ? 'All Clients' : 'All Prospects'}</span>
                    {statusFilter === 'all' && <Check className="w-4 h-4 text-purple-500" />}
                </button>
                
                {activeTab === 'partner' ? (
                    <>
                        <button onClick={() => { setStatusFilter('active'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-emerald-700 font-medium flex justify-between items-center">
                            <span>{CLIENT_STATUS_CONFIG.client.label}s</span>
                            {statusFilter === 'active' && <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setStatusFilter('churn'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-red-600 font-medium flex justify-between items-center">
                            <span>{CLIENT_STATUS_CONFIG.churn.label}s</span>
                            {statusFilter === 'churn' && <Check className="w-4 h-4" />}
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => { setStatusFilter('open'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-blue-700 font-medium flex justify-between items-center">
                            <span>{CLIENT_STATUS_CONFIG.prospect.label}s</span>
                            {statusFilter === 'open' && <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setStatusFilter('lost'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-500 font-medium flex justify-between items-center">
                            <span>{CLIENT_STATUS_CONFIG.lost.label}s</span>
                            {statusFilter === 'lost' && <Check className="w-4 h-4" />}
                        </button>
                    </>
                )}
            </FilterDropdown>
        </div>

        {/* Right: Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder={`Search ${activeTab === 'partner' ? 'clients' : 'prospects'}...`} 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredClients.map(client => (
            <ClientCard 
                key={client.id}
                client={client}
                onClick={() => setViewState({ type: 'CLIENT_DETAIL', clientId: client.id, previousView: { type: 'CLIENT_LIST', activeTab: activeTab } })}
                onEdit={(e) => openEditClientModal(e, client)}
            />
        ))}

        {filteredClients.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    {activeTab === 'partner' ? <Trophy className="w-8 h-8" /> : <Target className="w-8 h-8" />}
                </div>
                <h3 className="text-slate-900 font-bold mb-1">
                    No {activeTab === 'partner' ? 'Clients' : 'Prospects'} found
                </h3>
                <p className="text-slate-500 text-sm max-w-xs">
                    {activeTab === 'partner' 
                        ? (statusFilter === 'churn' ? "No churned clients found." : "Clients are automatically promoted from Prospects when you make a successful hire.") 
                        : (statusFilter === 'lost' ? "No lost prospects found." : "Add a new prospect to start tracking potential opportunities.")}
                </p>
                {activeTab === 'prospect' && statusFilter !== 'lost' && (
                     <button 
                        onClick={openNewClientModal}
                        className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Create New Prospect
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
