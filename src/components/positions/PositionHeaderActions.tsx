"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, Settings, FileText, Loader2 } from 'lucide-react';
import { Position as PositionType } from '@/lib/types';
import AddCandidateModal from '@/components/positions/add-candidate-modal';
import { FunnelSettingsModal } from '@/components/positions/funnel-settings-modal';
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/lib/store';
import { exportPositionReportPdfByPositionId } from '@/lib/pdf/export-position-report-pdf';
import * as positionsRepository from '@/lib/repositories/positions';

const POSITION_STATUS_CONFIG: { [key: string]: { label: string; className: string; dotClassName: string } } = {
  "open": { label: "OPEN", className: "bg-green-100 text-green-700", dotClassName: "bg-green-500" },
  "onhold": { label: "ON HOLD", className: "bg-blue-100 text-blue-700", dotClassName: "bg-blue-500" },
  "closed": { label: "CLOSED", className: "bg-gray-100 text-gray-700", dotClassName: "bg-gray-500" },
};

interface PositionHeaderActionsProps {
    positionId: string;
    clientId: string | null;
    currentStatus: PositionType['status'];
    initialFunnelMetrics: any;
}

const PositionHeaderActions: React.FC<PositionHeaderActionsProps> = ({
    positionId,
    clientId,
    currentStatus,
    initialFunnelMetrics
}) => {
    const { toast } = useToast();
    const { updatePositionInStore } = useAppStore();

    const [status, setStatus] = useState(currentStatus);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
    const [isFunnelSettingsModalOpen, setIsFunnelSettingsModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleUpdatePositionStatus = async (newStatus: PositionType['status']) => {
        if (newStatus === status || isSavingStatus) return;

        const previousStatus = status;
        setIsSavingStatus(true);
        setStatus(newStatus); // Optimistic UI update
        updatePositionInStore({ id: positionId, status: newStatus }); // Optimistic store update

        try {
            await positionsRepository.updatePosition(positionId, { status: newStatus });
            toast({
                title: "Status updated",
                description: `Position status changed to ${POSITION_STATUS_CONFIG[newStatus].label}.`,
            });
        } catch (error) {
            console.error("Failed to update position status:", error);
            // Revert on error
            setStatus(previousStatus);
            updatePositionInStore({ id: positionId, status: previousStatus });
            toast({
                title: "Error",
                description: "Failed to update position status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSavingStatus(false);
        }
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            await exportPositionReportPdfByPositionId(positionId);
            toast({
                title: "Success",
                description: "Position report downloaded successfully.",
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Error",
                description: "Failed to export position report.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const statusConfig = POSITION_STATUS_CONFIG[status] || POSITION_STATUS_CONFIG["open"];

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className={`h-8 rounded-full text-xs font-medium flex items-center gap-2 ${statusConfig.className}`}
                            disabled={isSavingStatus}
                        >
                            {isSavingStatus ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <span className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}></span>
                                    {statusConfig.label}
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {Object.keys(POSITION_STATUS_CONFIG).map((statusKey) => {
                            const config = POSITION_STATUS_CONFIG[statusKey];
                            return (
                                <DropdownMenuItem
                                    key={statusKey}
                                    onClick={() => handleUpdatePositionStatus(statusKey as PositionType['status'])}
                                    disabled={isSavingStatus}
                                >
                                    <span className={`w-2 h-2 rounded-full ${config.dotClassName} mr-2`}></span>
                                    {config.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    className="h-8 text-sm px-3"
                    onClick={() => setIsFunnelSettingsModalOpen(true)}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Funnel settings
                </Button>
                <Button
                    variant="secondary"
                    className="h-8 text-sm px-3"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    {isExporting ? "Exporting..." : "Export PDF report"}
                </Button>
                <Button onClick={() => setIsAddCandidateModalOpen(true)} className="h-8 text-sm px-3 bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add candidate
                </Button>
            </div>

            {isAddCandidateModalOpen && (
                <AddCandidateModal
                    isOpen={isAddCandidateModalOpen}
                    onClose={() => setIsAddCandidateModalOpen(false)}
                    clientId={clientId || ''}
                    positionId={positionId}
                />
            )}

            {isFunnelSettingsModalOpen && (
                <FunnelSettingsModal
                    isOpen={isFunnelSettingsModalOpen}
                    onClose={() => setIsFunnelSettingsModalOpen(false)}
                    positionId={positionId}
                    initialMetrics={initialFunnelMetrics}
                />
            )}
        </>
    );
};

export { PositionHeaderActions };
export default PositionHeaderActions;
