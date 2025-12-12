"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { useAppStore } from '../../../lib/store';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { CLIENT_STATUS_CONFIG } from '../../../lib/config';
import { PlusCircle, ArrowLeft, Edit, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Position, Client } from '../../../lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const statusKey = (s?: string) => (s || "").toLowerCase();
const isOpen = (p: any) => statusKey(p.status) === "open";

const ClientDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const {
    clients,
    clientsInitialized,
    clientsLoading,
    loadClients,
    positionsByClient,
    positionsLoadingByClient,
    loadPositionsForClient,
    addPosition,
    updateClient,
    positions: mockPositions,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"pipeline" | "info">("pipeline");
  const [isNewPositionOpen, setIsNewPositionOpen] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");

  // State for Edit Client Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPointOfContact, setEditPointOfContact] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editBillingAddress, setEditBillingAddress] = useState('');
  const [editBillingEmail, setEditBillingEmail] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState<string>(""); // Logo URL state

  useEffect(() => {
    if (!clientsInitialized) {
      loadClients();
    }
  }, [clientsInitialized, loadClients]);

  const client = clients.find(c => c.id === clientId);

  useEffect(() => {
    if (client && !positionsByClient[clientId] && !positionsLoadingByClient[clientId]) {
      loadPositionsForClient(clientId);
    }
  }, [client, clientId, positionsByClient, positionsLoadingByClient, loadPositionsForClient]);

  // Initialize form fields when client data is available or changes
  useEffect(() => {
    if (client) {
      setEditName(client.name);
      setEditPointOfContact(client.pointOfContact || '');
      setEditContactEmail(client.contactEmail || '');
      setEditWebsite(client.website || '');
      setEditLocation(client.location);
      setEditIndustry(client.industry);
      setEditTaxId(client.taxId || '');
      setEditBillingAddress(client.billingAddress || '');
      setEditBillingEmail(client.billingEmail || '');
      setEditPaymentTerms(client.paymentTerms || '');
      setEditNotes(client.notes || '');
      setEditLogoUrl(client.logoUrl ?? ""); // Initialize logoUrl
    }
  }, [client]);

  if (clientsLoading && !client) {
    return <div className="p-8 text-center">Loading client...</div>;
  }

  if (clientsInitialized && !client) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Client not found</p>
        <Button onClick={() => router.push("/clients")}>Go back to clients</Button>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  const statusConfig =
    CLIENT_STATUS_CONFIG[client.relationshipStatus] ||
    CLIENT_STATUS_CONFIG.client;

  const clientPositions = positionsByClient[clientId] || mockPositions.filter(pos => pos.clientId === client.id);
  const openPositions = clientPositions.filter(isOpen);
  const closedPositions = clientPositions.filter(p => !isOpen(p));

  const handleSaveNewPosition = async () => {
    if (!positionTitle.trim()) return;

    const newPosition: Omit<Position, "id"> = {
      clientId: client.id,
      title: positionTitle,
      description: "",
      requirements: [],
      status: "open", // force lowercase
    };

    await addPosition(newPosition);
    setIsNewPositionOpen(false);
    setPositionTitle("");
  };

  const handleStatusChange = async (newStatus: 'client' | 'churn' | 'prospect') => {
    if (!client) return;
    const updatedClient = { ...client, relationshipStatus: newStatus };
    try {
      await updateClient(updatedClient);
    } catch (error) {
      console.error("Client status update error", error);
    }
  };

  const handleEditInfoClick = () => {
    if (client) {
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    console.log("EditClient save clicked", { editName, editLogoUrl, client });
    if (!client || !editName.trim()) return; // Name is required

    const safeLogoUrl = editLogoUrl && editLogoUrl.startsWith("data:") ? "" : (editLogoUrl || "");

    const updatedClient: Client = {
      ...client,
      name: editName,
      pointOfContact: editPointOfContact,
      contactEmail: editContactEmail,
      website: editWebsite,
      location: editLocation,
      industry: editIndustry,
      taxId: editTaxId,
      billingAddress: editBillingAddress,
      billingEmail: editBillingEmail,
      paymentTerms: editPaymentTerms,
      notes: editNotes,
      logoUrl: safeLogoUrl,
    };

    try {
      await updateClient(updatedClient);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("EditClient update error", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    // Reset form fields to current client values
    if (client) {
      setEditName(client.name);
      setEditPointOfContact(client.pointOfContact || '');
      setEditContactEmail(client.contactEmail || '');
      setEditWebsite(client.website || '');
      setEditLocation(client.location);
      setEditIndustry(client.industry);
      setEditTaxId(client.taxId || '');
      setEditBillingAddress(client.billingAddress || '');
      setEditBillingEmail(client.billingEmail || '');
      setEditPaymentTerms(client.paymentTerms || '');
      setEditNotes(client.notes || '');
      setEditLogoUrl(client.logoUrl ?? ""); // Reset logoUrl
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      {/* Back to Clients link */}
      <div
        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/clients")}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Clients</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {client.logoUrl && !client.logoUrl.startsWith("data:") ? (
            <img src={client.logoUrl} alt="Client Logo" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-500">
              {client.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{client.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{client.location}</span>
              <span className="text-slate-400">&bull;</span>
              <span>{client.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleEditInfoClick}>
            <Edit className="h-4 w-4" />
            Edit Info
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`rounded-full px-3 py-1 text-xs font-medium flex items-center gap-2 ${statusConfig.className}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}></span>
                {statusConfig.label}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['client', 'churn', 'prospect'] as const).map((status) => {
                const itemStatusConfig = CLIENT_STATUS_CONFIG[status] || CLIENT_STATUS_CONFIG.client;
                return (
                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${itemStatusConfig.dotClassName}`}></span>
                      <span>{itemStatusConfig.label}</span>
                      {client.relationshipStatus === status && <Check className="ml-auto h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsNewPositionOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Position
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pipeline" | "info")}>
        <TabsList className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
          <TabsTrigger
            value="pipeline"
            className={`px-4 py-1.5 rounded-md cursor-pointer transition ${activeTab === "pipeline" ? "bg-white shadow-sm text-slate-900 font-medium" : "text-slate-500 hover:text-slate-700"}`}
          >
            Recruitment pipeline
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className={`px-4 py-1.5 rounded-md cursor-pointer transition ${activeTab === "info" ? "bg-white shadow-sm text-slate-900 font-medium" : "text-slate-500 hover:text-slate-700"}`}
          >
            Client info & billing <span className="ml-2 text-[10px] rounded bg-slate-200 px-1.5 py-0.5 uppercase tracking-wide">CRM</span>
          </TabsTrigger>
        </TabsList>
        <div className="border-b border-slate-200 mt-6"></div> {/* Horizontal Rule */}
        <TabsContent value="pipeline" className="mt-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Open positions</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{openPositions.length}</span>
              </div>
              <div className="space-y-4">
                  {positionsLoadingByClient[clientId] ? (
                      <p className="text-slate-600">Loading positions...</p>
                  ) : openPositions.length > 0 ? (
                    <ul className="space-y-4">
                      {openPositions.map(pos => (
                        <li key={pos.id}>
                            <Link href={`/positions/${pos.id}`}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{pos.title}</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                    {pos.status.charAt(0).toUpperCase() + pos.status.slice(1)} {pos.location ? `\u2022 ${pos.location}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs font-medium uppercase">
                                        {pos.status}
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </div>
                            </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No open positions for this client yet.</p>
                  )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Closed positions</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{closedPositions.length}</span>
              </div>
              <div className="space-y-4">
                  {positionsLoadingByClient[clientId] ? (
                      <p className="text-slate-600">Loading positions...</p>
                  ) : closedPositions.length > 0 ? (
                    <ul className="space-y-4">
                      {closedPositions.map(pos => (
                        <li key={pos.id}>
                            <Link href={`/positions/${pos.id}`}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{pos.title}</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                    {pos.status.charAt(0).toUpperCase() + pos.status.slice(1)} {pos.location ? `\u2022 ${pos.location}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs font-medium uppercase">
                                        {pos.status}
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </div>
                            </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No closed positions for this client yet.</p>
                  )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="info" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="text-xs font-semibold tracking-[0.08em] text-slate-500">GENERAL INFORMATION</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Main Contact Name</p>
                    <p className="mt-1 text-sm text-slate-900">{client.pointOfContact || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Contact Email</p>
                    <p className="mt-1 text-sm text-slate-900">{client.contactEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Phone</p>
                    <p className="mt-1 text-sm text-slate-900">N/A</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Website</p>
                    <p className="mt-1 text-sm text-slate-900">{client.website || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Location</p>
                    <p className="mt-1 text-sm text-slate-900">{client.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Industry</p>
                    <p className="mt-1 text-sm text-slate-900">{client.industry || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="text-xs font-semibold tracking-[0.08em] text-slate-500">INTERNAL NOTES</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {client.notes ? (
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {client.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No notes available for this client.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="text-xs font-semibold tracking-[0.08em] text-slate-500">BILLING & ADMIN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Tax ID / VAT / CNPJ</p>
                    <p className="mt-1 text-sm text-slate-900">{client.taxId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Billing Address</p>
                    <p className="mt-1 text-sm text-slate-900">{client.billingAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Finance Email</p>
                    <p className="mt-1 text-sm text-slate-900">{client.billingEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-medium">Payment Terms</p>
                    <p className="mt-1 text-sm text-slate-900">{client.paymentTerms || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Position Modal */}
      <Dialog open={isNewPositionOpen} onOpenChange={setIsNewPositionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Position</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="positionTitle" className="text-right">
                Position Title
              </Label>
              <Input
                id="positionTitle"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPositionOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNewPosition} disabled={!positionTitle.trim()}>Save Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Info Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-50 px-6 py-6">
          <DialogHeader>
            <DialogTitle>Edit Client Info</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Logo</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-500">
                  {editName.charAt(0)}
                </div>
                <div className="flex-1 flex-col gap-2">
                  <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                  <Input
                    id="logoUrl"
                    value={editLogoUrl || ""}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Leave empty to use the initials avatar. Use a small PNG/JPG URL.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Name</Label>
                  <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editIndustry">Industry</Label>
                  <Input id="editIndustry" value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editLocation">Location</Label>
                  <Input id="editLocation" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editPointOfContact">Main Contact</Label>
                  <Input id="editPointOfContact" value={editPointOfContact} onChange={(e) => setEditPointOfContact(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editContactEmail">Contact Email</Label>
                  <Input id="editContactEmail" value={editContactEmail} onChange={(e) => setEditContactEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editWebsite">Website</Label>
                  <Input id="editWebsite" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Billing & Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTaxId">Tax ID / VAT / CNPJ</Label>
                  <Input id="editTaxId" value={editTaxId} onChange={(e) => setEditTaxId(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editBillingAddress">Billing Address</Label>
                  <Input id="editBillingAddress" value={editBillingAddress} onChange={(e) => setEditBillingAddress(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editBillingEmail">Finance Email</Label>
                  <Input id="editBillingEmail" value={editBillingEmail} onChange={(e) => setEditBillingEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editPaymentTerms">Payment Terms</Label>
                  <Input id="editPaymentTerms" value={editPaymentTerms} onChange={(e) => setEditPaymentTerms(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Internal Notes</h3>
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea id="editNotes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="min-h-[100px]" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetailPage;
