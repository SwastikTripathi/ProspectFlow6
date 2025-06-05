"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/types";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
  nextFollowUpDate: z.date().nullable().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  contactToEdit?: Contact | null;
}

export function ContactForm({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToEdit
      ? {
          name: contactToEdit.name,
          email: contactToEdit.email,
          notes: contactToEdit.notes,
          nextFollowUpDate: contactToEdit.nextFollowUpDate
            ? parseISO(contactToEdit.nextFollowUpDate)
            : null,
        }
      : {
          name: "",
          email: "",
          notes: "",
          nextFollowUpDate: null,
        },
  });

  React.useEffect(() => {
    if (contactToEdit) {
      form.reset({
        name: contactToEdit.name,
        email: contactToEdit.email,
        notes: contactToEdit.notes,
        nextFollowUpDate: contactToEdit.nextFollowUpDate
          ? parseISO(contactToEdit.nextFollowUpDate)
          : null,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        notes: "",
        nextFollowUpDate: new Date(), // Default to today for new contacts
      });
    }
  }, [contactToEdit, form, isOpen]);

  const onSubmit = (values: ContactFormValues) => {
    const newOrUpdatedContact: Contact = {
      id: contactToEdit?.id || crypto.randomUUID(),
      ...values,
      nextFollowUpDate: values.nextFollowUpDate
        ? values.nextFollowUpDate.toISOString()
        : null,
      followUpCount: contactToEdit?.followUpCount || 0,
      lastContactedDate: contactToEdit?.lastContactedDate // Preserve last contacted date
    };
    onSave(newOrUpdatedContact);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {contactToEdit ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
          <DialogDescription>
            {contactToEdit
              ? "Update the details for this contact."
              : "Fill in the information for the new contact."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. jane.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any relevant notes about this contact..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextFollowUpDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Follow-Up Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => field.onChange(date || null)}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {contactToEdit ? "Save Changes" : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
