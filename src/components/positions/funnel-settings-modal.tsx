"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FunnelMetrics, DEFAULT_FUNNEL_METRICS } from "@/lib/types";
import { updatePositionFunnelMetrics } from "@/lib/repositories/positions";
import { useAppStore } from '@/lib/store';
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FunnelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  positionId: string;
  initialMetrics?: FunnelMetrics;
}

const METRIC_LABELS: { key: keyof FunnelMetrics; label: string }[] = [
  { key: 'sourced', label: 'SOURCED' },
  { key: 'approached', label: 'APPROACHED' },
  { key: 'notInterested', label: 'NOT INTERESTED' },
  { key: 'noResponse', label: 'NO RESPONSE' },
  { key: 'activePipeline', label: 'ACTIVE PIPELINE' },
  { key: 'shortlisted', label: 'SHORTLISTED' },
  { key: 'finalInterviews', label: 'FINAL INTERVIEWS' },
];

export const FunnelSettingsModal: React.FC<FunnelSettingsModalProps> = ({
  isOpen,
  onClose,
  positionId,
  initialMetrics,
}) => {
  const [metrics, setMetrics] = useState<FunnelMetrics>(DEFAULT_FUNNEL_METRICS);
  const [isSaving, setIsSaving] = useState(false);
  const { positions, updatePositionInStore } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (initialMetrics) {
      setMetrics(initialMetrics);
    } else {
      setMetrics(DEFAULT_FUNNEL_METRICS);
    }
  }, [initialMetrics, isOpen]);

  const handleChange = (key: keyof FunnelMetrics, value: string) => {
    // Allow empty string to clear the input, otherwise parse as number
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    // Ensure non-negative
    const safeValue = isNaN(numValue) ? 0 : Math.max(0, numValue);

    setMetrics((prev) => ({
      ...prev,
      [key]: safeValue,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Coerce any potential bad values before saving (though input handler handles most)
      const cleanMetrics: FunnelMetrics = { ...DEFAULT_FUNNEL_METRICS };
      (Object.keys(metrics) as Array<keyof FunnelMetrics>).forEach((key) => {
          cleanMetrics[key] = Math.floor(Math.max(0, Number(metrics[key]) || 0));
      });

      await updatePositionFunnelMetrics(positionId, cleanMetrics);

      // Update local store to reflect changes immediately
      const position = positions.find(p => p.id === positionId);
      if (position) {
          updatePositionInStore({
              ...position,
              funnelMetrics: cleanMetrics
          });
      }

      toast({
        title: "Success",
        description: "Funnel metrics updated successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save funnel metrics:", error);
      toast({
        title: "Error",
        description: "Failed to save funnel metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Funnel Settings</DialogTitle>
           {/* Close button is automatically added by DialogContent usually, but spec asked for explicit close icon top right if not present. 
               Shadcn Dialog usually has a close X. We will rely on default or check if we need to hide it. 
               The default Close is absolutely positioned. */}
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {METRIC_LABELS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-2 items-center gap-4">
              <span className="text-sm font-medium text-slate-700 uppercase">
                {label}
              </span>
              <Input
                type="number"
                value={metrics[key] === 0 && !isOpen ? 0 : metrics[key].toString()} 
                // Display 0 normally. If we wanted to allow clearing to empty string for typing comfort, 
                // we would need a separate local state for string values or a more complex handler.
                // Current requirement: "On change, coerce empty to 0" -> this implies aggressive 0 setting or standard number input behavior.
                // But standard number inputs show "0".
                // Let's stick to standard controlled input.
                onChange={(e) => handleChange(key, e.target.value)}
                className="text-right h-8"
                min={0}
                step={1}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
