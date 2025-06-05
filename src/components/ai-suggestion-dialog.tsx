"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface AISuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string | null;
  isLoading: boolean;
  contactName?: string;
}

export function AISuggestionDialog({
  isOpen,
  onClose,
  suggestion,
  isLoading,
  contactName,
}: AISuggestionDialogProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
      toast({
        title: "Copied to clipboard!",
        description: "The follow-up message suggestion has been copied.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Follow-Up Suggestion</DialogTitle>
          <DialogDescription>
            {contactName ? `Here's a suggestion for following up with ${contactName}:` : "Here's an AI-generated follow-up suggestion:"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : suggestion ? (
            <Textarea value={suggestion} readOnly rows={5} className="text-sm" />
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not generate a suggestion at this time. Please try again.
            </p>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {suggestion && !isLoading && (
            <Button type="button" onClick={handleCopyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Suggestion
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
