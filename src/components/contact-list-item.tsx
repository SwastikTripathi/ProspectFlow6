"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@/lib/types";
import { format, parseISO, isPast } from "date-fns";
import { CalendarDays, CheckCircle2, Edit3, Mail, Sparkles, Trash2, FileText } from "lucide-react";

interface ContactListItemProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onMarkComplete: (contact: Contact) => void;
  onGenerateAISuggestion: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactListItem({
  contact,
  onEdit,
  onMarkComplete,
  onGenerateAISuggestion,
  onDelete,
}: ContactListItemProps) {
  const { name, email, notes, nextFollowUpDate, followUpCount } = contact;

  const formattedFollowUpDate = nextFollowUpDate
    ? format(parseISO(nextFollowUpDate), "PPP") // e.g., Jan 1, 2023
    : "Not set";
  
  const isDatePast = nextFollowUpDate ? isPast(parseISO(nextFollowUpDate)) : false;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{name}</CardTitle>
          <Badge variant={isDatePast && nextFollowUpDate ? "destructive" : "secondary"}>
            Follow-ups: {followUpCount}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-sm pt-1">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes && (
           <div className="flex items-start">
            <FileText className="mr-2 h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic whitespace-pre-wrap break-words">
              {notes}
            </p>
          </div>
        )}
        <div className="flex items-center">
          <CalendarDays className={`mr-2 h-4 w-4 ${isDatePast && nextFollowUpDate ? 'text-destructive' : 'text-muted-foreground'}`} />
          <p className={`text-sm font-medium ${isDatePast && nextFollowUpDate ? 'text-destructive' : 'text-foreground'}`}>
            Next Follow-Up: {formattedFollowUpDate}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onGenerateAISuggestion(contact)}
                aria-label="Get AI Suggestion"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get AI Suggestion</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onMarkComplete(contact)}
                aria-label="Mark as Completed"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as Completed & Reschedule</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => onEdit(contact)} aria-label="Edit Contact">
                <Edit3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Contact</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(contact.id)}
                aria-label="Delete Contact"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Contact</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
