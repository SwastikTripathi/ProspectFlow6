
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings, UsagePreference, DefaultFollowUpTemplates, FollowUpTemplateContent } from '@/lib/types';
import { Loader2, UserCircle, Settings as SettingsIcon, SlidersHorizontal, MailQuestion, Edit3, ShieldAlert, Trash2 } from 'lucide-react';
import type { Json } from '@/lib/database.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

const USAGE_PREFERENCES: { value: UsagePreference; label: string }[] = [
  { value: 'job_hunt', label: 'Job Hunting / Career Opportunities' },
  { value: 'sales', label: 'Sales & Lead Generation' },
  { value: 'networking', label: 'Professional Networking' },
  { value: 'other', label: 'Other / General Prospecting' },
];

const defaultIndividualFollowUpTemplate: Omit<FollowUpTemplateContent, 'signature'> = { subject: '', openingLine: '' };
const defaultAllTemplates: DefaultFollowUpTemplates = {
  followUp1: { ...defaultIndividualFollowUpTemplate },
  followUp2: { ...defaultIndividualFollowUpTemplate },
  followUp3: { ...defaultIndividualFollowUpTemplate },
  sharedSignature: '',
};
const defaultCadence: [number, number, number] = [7, 14, 21];
const DELETE_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

const accountSettingsSchema = z.object({
  displayName: z.string().max(100, "Display name cannot exceed 100 characters.").optional(),
  usagePreference: z.enum(['job_hunt', 'sales', 'networking', 'other']),
  cadenceFu1: z.coerce.number().min(1, "Days must be at least 1").max(90, "Days cannot exceed 90"),
  cadenceFu2: z.coerce.number().min(1, "Days must be at least 1").max(90, "Days cannot exceed 90"),
  cadenceFu3: z.coerce.number().min(1, "Days must be at least 1").max(90, "Days cannot exceed 90"),
  defaultEmailTemplates: z.object({
    followUp1: z.object({
      subject: z.string().max(200, "Subject too long").optional(),
      openingLine: z.string().max(500, "Opening line too long").optional(),
    }),
    followUp2: z.object({
      subject: z.string().max(200).optional(),
      openingLine: z.string().max(500).optional(),
    }),
    followUp3: z.object({
      subject: z.string().max(200).optional(),
      openingLine: z.string().max(500).optional(),
    }),
    sharedSignature: z.string().max(500, "Signature too long").optional(),
  }),
}).refine(data => data.cadenceFu2 > data.cadenceFu1 && data.cadenceFu3 > data.cadenceFu2, {
  message: "Follow-up days must be sequential (e.g., FU2 > FU1, FU3 > FU2).",
  path: ["cadenceFu2"], 
});

type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export default function AccountSettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteStep1Open, setIsDeleteStep1Open] = useState(false);
  const [isDeleteStep2Open, setIsDeleteStep2Open] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      displayName: '',
      usagePreference: 'job_hunt', 
      cadenceFu1: defaultCadence[0],
      cadenceFu2: defaultCadence[1],
      cadenceFu3: defaultCadence[2],
      defaultEmailTemplates: defaultAllTemplates,
    },
  });

  const fetchAccountData = useCallback(async (user: User) => {
    setIsLoading(true);
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError; 
      
      const fetchedSettings = settingsData as UserSettings | null;
      setUserSettings(fetchedSettings);
      
      const currentTemplates = fetchedSettings?.default_email_templates 
        ? (fetchedSettings.default_email_templates as DefaultFollowUpTemplates) 
        : defaultAllTemplates;

      form.reset({
        displayName: user.user_metadata?.full_name || '',
        usagePreference: fetchedSettings?.usage_preference || 'job_hunt',
        cadenceFu1: (fetchedSettings?.follow_up_cadence_days as [number,number,number])?.[0] ?? defaultCadence[0],
        cadenceFu2: (fetchedSettings?.follow_up_cadence_days as [number,number,number])?.[1] ?? defaultCadence[1],
        cadenceFu3: (fetchedSettings?.follow_up_cadence_days as [number,number,number])?.[2] ?? defaultCadence[2],
        defaultEmailTemplates: {
          followUp1: {
            subject: currentTemplates.followUp1?.subject || '',
            openingLine: currentTemplates.followUp1?.openingLine || '',
          },
          followUp2: {
            subject: currentTemplates.followUp2?.subject || '',
            openingLine: currentTemplates.followUp2?.openingLine || '',
          },
          followUp3: {
            subject: currentTemplates.followUp3?.subject || '',
            openingLine: currentTemplates.followUp3?.openingLine || '',
          },
          sharedSignature: currentTemplates.sharedSignature || '',
        },
      });

    } catch (error: any) {
      toast({ title: 'Error Fetching Settings', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, form]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchAccountData(user);
      } else {
        setIsLoading(false);
        form.reset({ 
            displayName: '',
            usagePreference: 'job_hunt',
            cadenceFu1: defaultCadence[0],
            cadenceFu2: defaultCadence[1],
            cadenceFu3: defaultCadence[2],
            defaultEmailTemplates: defaultAllTemplates,
        });
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        fetchAccountData(user);
      } else {
        setIsLoading(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [fetchAccountData, form]);

  const onSubmit = async (values: AccountSettingsFormValues) => {
    if (!currentUser) {
      toast({ title: 'Not Authenticated', description: 'Please log in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (values.displayName !== (currentUser.user_metadata?.full_name || '')) {
        const { error: userUpdateError } = await supabase.auth.updateUser({
          data: { full_name: values.displayName },
        });
        if (userUpdateError) throw userUpdateError;
      }
      
      const settingsDataToUpsert = {
        user_id: currentUser.id,
        usage_preference: values.usagePreference, 
        follow_up_cadence_days: [values.cadenceFu1, values.cadenceFu2, values.cadenceFu3] as unknown as Json,
        default_email_templates: values.defaultEmailTemplates as unknown as Json,
      };
      const { error: settingsUpsertError } = await supabase
        .from('user_settings')
        .upsert(settingsDataToUpsert, { onConflict: 'user_id' });
      if (settingsUpsertError) throw settingsUpsertError;

      toast({ title: 'Settings Updated', description: 'Your account settings have been saved.' });
      await fetchAccountData(currentUser); 
    } catch (error: any) {
      toast({ title: 'Error Saving Settings', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToDeleteStep2 = () => {
    setIsDeleteStep1Open(false);
    setIsDeleteStep2Open(true);
    setDeleteConfirmationInput('');
  };

  const handleConfirmAccountDeletion = async () => {
    if (!currentUser || deleteConfirmationInput !== DELETE_CONFIRMATION_PHRASE) {
      toast({ title: 'Confirmation Failed', description: 'Please type the confirmation phrase correctly.', variant: 'destructive' });
      return;
    }
    setIsDeletingAccount(true);
    try {
      // Order of deletion is important due to foreign key constraints
      const tablesToDeleteFrom = [
        'follow_ups',
        'job_opening_contacts',
        'job_openings',
        'contacts', 
        'companies',
        'user_settings',
        'user_subscriptions',
        'posts', // Assuming posts are directly linked by user_id
      ];

      for (const tableName of tablesToDeleteFrom) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('user_id', currentUser.id);
        if (error) {
          console.error(`Error deleting from ${tableName}:`, error);
          throw new Error(`Failed to delete data from ${tableName}. ${error.message}`);
        }
      }

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        // Non-fatal, proceed to inform user about data deletion
      }

      toast({
        title: 'Account Data Deleted',
        description: 'All your application data has been successfully deleted. You have been signed out. Your authentication record still exists but is no longer associated with any application data.',
        duration: 10000, // Longer duration for this important message
      });
      router.push('/landing'); 
      
    } catch (error: any) {
      toast({ title: 'Account Deletion Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteStep2Open(false);
      setDeleteConfirmationInput('');
    }
  };
  
  if (isLoading && !currentUser && !form.formState.isDirty) { 
    return <AppLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppLayout>;
  }
  if (!currentUser) { 
     return <AppLayout><Card><CardHeader><CardTitle>Access Denied</CardTitle></CardHeader><CardContent><p>Please log in to access account settings.</p></CardContent></Card></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <SettingsIcon className="mr-3 h-7 w-7 text-primary" />
            Account Settings
          </h2>
          <p className="text-muted-foreground">Manage your profile, preferences, and application settings.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/> Profile</CardTitle>
                <CardDescription>Update your display name.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} disabled={isLoading || form.formState.isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary"/> Usage Preference</CardTitle>
                <CardDescription>This feature is coming soon. Your selection here will help tailor your experience in the future.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="usagePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Usage</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={true} 
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your primary goal" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USAGE_PREFERENCES.map(pref => (
                            <SelectItem key={pref.value} value={pref.value}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary"/> Follow-up Cadence</CardTitle>
                <CardDescription>Set the default number of days after the initial email for each follow-up. Must be sequential.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cadenceFu1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up 1 (days after initial)</FormLabel>
                      <FormControl><Input type="number" min="1" max="90" {...field} disabled={isLoading || form.formState.isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cadenceFu2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up 2 (days after initial)</FormLabel>
                      <FormControl><Input type="number" min="1" max="90" {...field} disabled={isLoading || form.formState.isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cadenceFu3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up 3 (days after initial)</FormLabel>
                      <FormControl><Input type="number" min="1" max="90" {...field} disabled={isLoading || form.formState.isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
               {form.formState.errors?.cadenceFu2?.type === 'manual' && (
                  <CardFooter><p className="text-sm font-medium text-destructive">{form.formState.errors.cadenceFu2.message}</p></CardFooter>
                )}
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><MailQuestion className="mr-2 h-5 w-5 text-primary"/> Default Email Templates</CardTitle>
                <CardDescription>Set default content for your follow-up emails. These will pre-fill when creating a new job opening.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full mb-6">
                  {(['followUp1', 'followUp2', 'followUp3'] as const).map((fuKey, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={fuKey}>
                      <AccordionTrigger className="font-semibold">Default Content for Follow-up {index + 1}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name={`defaultEmailTemplates.${fuKey}.subject`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject Line</FormLabel>
                              <FormControl><Input placeholder={`Subject for Follow-up ${index + 1}`} {...field} value={field.value || ''} disabled={isLoading || form.formState.isSubmitting} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`defaultEmailTemplates.${fuKey}.openingLine`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opening Line / Main Content</FormLabel>
                              <FormControl><Textarea placeholder={`Opening line/body for Follow-up ${index + 1}`} {...field} value={field.value || ''} rows={3} disabled={isLoading || form.formState.isSubmitting} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <FormField
                  control={form.control}
                  name="defaultEmailTemplates.sharedSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center"><Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Shared Email Signature</FormLabel>
                       <CardDescription className="text-xs mb-2">This signature will be appended to all default follow-up email templates.</CardDescription>
                      <FormControl><Textarea placeholder="Your default signature (e.g., Best regards, Your Name)" {...field} value={field.value || ''} rows={3} disabled={isLoading || form.formState.isSubmitting}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={isLoading || form.formState.isSubmitting}>
                { (isLoading || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All Settings
              </Button>
            </div>
          </form>
        </Form>

        <Card className="shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-destructive"><ShieldAlert className="mr-2 h-5 w-5"/> Danger Zone</CardTitle>
            <CardDescription className="text-destructive/90">Account deletion is permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting your account will permanently remove all your associated data, including:
              job openings, contacts, companies, follow-up schedules, email templates, user settings, and subscription information. 
              Your authentication record will remain but will no longer be associated with any application data.
            </p>
            <Button variant="destructive" onClick={() => setIsDeleteStep1Open(true)} disabled={isDeletingAccount}>
              {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete My Account
            </Button>
          </CardContent>
        </Card>

        {/* Deletion Dialog Step 1 */}
        <AlertDialog open={isDeleteStep1Open} onOpenChange={setIsDeleteStep1Open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is irreversible. All your data including job openings, contacts, 
                companies, follow-up schedules, email templates, user settings, and 
                subscription information will be <strong>permanently deleted</strong>. Your authentication 
                record will remain, but will be disassociated from all application data.
                <br /><br />
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteStep1Open(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleProceedToDeleteStep2} className="bg-destructive hover:bg-destructive/90">
                I understand, proceed to delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deletion Dialog Step 2 */}
        <AlertDialog open={isDeleteStep2Open} onOpenChange={setIsDeleteStep2Open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Final Confirmation Required</AlertDialogTitle>
              <AlertDialogDescription>
                To confirm permanent deletion of your account and all associated data, please type the following phrase exactly as shown below:
                <br />
                <strong className="text-destructive font-mono my-2 block">{DELETE_CONFIRMATION_PHRASE}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="Type the phrase here"
              className="border-destructive focus-visible:ring-destructive"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteStep2Open(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAccountDeletion}
                disabled={deleteConfirmationInput !== DELETE_CONFIRMATION_PHRASE || isDeletingAccount}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Permanent Deletion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </AppLayout>
  );
}
    
