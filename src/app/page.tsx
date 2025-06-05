"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { ContactListItem } from "@/components/contact-list-item";
import { AISuggestionDialog } from "@/components/ai-suggestion-dialog";
import type { Contact } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { generateFollowUpMessage } from "@/ai/flows/generate-follow-up-message";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function HomePage() {
  const [contacts, setContacts] = useLocalStorage<Contact[]>("contacts", []);
  const [isContactFormOpen, setIsContactFormOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  
  const [isAiSuggestionDialogOpen, setIsAiSuggestionDialogOpen] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState<string | null>(null);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = React.useState(false);
  const [currentContactForAISuggestion, setCurrentContactForAISuggestion] = React.useState<Contact | null>(null);

  const [contactToDeleteId, setContactToDeleteId] = React.useState<string | null>(null);


  const { toast } = useToast();

  const sortedContacts = React.useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.nextFollowUpDate && b.nextFollowUpDate) {
        return new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime();
      }
      if (a.nextFollowUpDate) return -1; // a has date, b doesn't, a comes first
      if (b.nextFollowUpDate) return 1;  // b has date, a doesn't, b comes first
      return 0; // neither have dates
    });
  }, [contacts]);

  const handleAddContactClick = () => {
    setEditingContact(null);
    setIsContactFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactFormOpen(true);
  };

  const handleSaveContact = (contact: Contact) => {
    setContacts((prevContacts) => {
      const existingIndex = prevContacts.findIndex((c) => c.id === contact.id);
      if (existingIndex > -1) {
        const updatedContacts = [...prevContacts];
        updatedContacts[existingIndex] = contact;
        return updatedContacts;
      }
      return [...prevContacts, contact];
    });
    toast({
      title: contactToEdit ? "Contact Updated" : "Contact Added",
      description: `${contact.name} has been successfully ${contactToEdit ? 'updated' : 'added'}.`,
    });
    setEditingContact(null);
  };
  
  const handleMarkComplete = (contact: Contact) => {
    const updatedContact = {
      ...contact,
      followUpCount: contact.followUpCount + 1,
      lastContactedDate: new Date().toISOString(),
    };
    setEditingContact(updatedContact); // Pre-fill form with incremented count
    setIsContactFormOpen(true); // Open form to set new follow-up date
    toast({
      title: "Follow-up Logged",
      description: `Marked follow-up with ${contact.name} as complete. Please set a new follow-up date.`,
    });
  };

  const handleGenerateAISuggestion = async (contact: Contact) => {
    setCurrentContactForAISuggestion(contact);
    setIsAiSuggestionDialogOpen(true);
    setIsLoadingAiSuggestion(true);
    setAiSuggestion(null);
    try {
      const result = await generateFollowUpMessage({
        contactName: contact.name,
        contactDetails: contact.email,
        notes: contact.notes,
        followUpCount: contact.followUpCount,
      });
      setAiSuggestion(result.followUpMessage);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      setAiSuggestion("Failed to generate suggestion. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate AI suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAiSuggestion(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prevContacts) => prevContacts.filter((c) => c.id !== contactId));
    toast({
      title: "Contact Deleted",
      description: "The contact has been removed.",
    });
    setContactToDeleteId(null); // Close confirmation dialog
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-headline font-semibold text-primary">
            FollowUp Ninja
          </h1>
          <Button onClick={handleAddContactClick} className="font-medium">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Contact
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedContacts.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline font-semibold text-foreground mb-2">
              No Contacts Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Add your first contact to start tracking your follow-ups.
            </p>
            <Button onClick={handleAddContactClick} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onEdit={handleEditContact}
                onMarkComplete={handleMarkComplete}
                onGenerateAISuggestion={handleGenerateAISuggestion}
                onDelete={() => setContactToDeleteId(contact.id)}
              />
            ))}
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} FollowUp Ninja. Stay Sharp!
        </div>
      </footer>

      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={editingContact}
      />
      
      <AISuggestionDialog
        isOpen={isAiSuggestionDialogOpen}
        onClose={() => setIsAiSuggestionDialogOpen(false)}
        suggestion={aiSuggestion}
        isLoading={isLoadingAiSuggestion}
        contactName={currentContactForAISuggestion?.name}
      />

      {contactToDeleteId && (
        <AlertDialog open={!!contactToDeleteId} onOpenChange={() => setContactToDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the contact
                "{contacts.find(c => c.id === contactToDeleteId)?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setContactToDeleteId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteContact(contactToDeleteId)}
                className={buttonVariants({ variant: "destructive" })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}

// Helper for AlertDialogAction styling with destructive variant
const buttonVariants = ({ variant }: { variant: "destructive" | "default" }) => {
  if (variant === "destructive") {
    return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  }
  return "";
};

