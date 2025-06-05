
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { TablesInsert } from '@/lib/database.types';

const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(250, 'Slug too long').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  content: z.string().min(10, 'Content is too short'),
  excerpt: z.string().max(300, 'Excerpt too long').optional(),
  cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      cover_image_url: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setIsLoadingAuth(false);
      if (!currentUser) {
        router.replace('/auth'); // Redirect if not logged in
      }
    };
    fetchUser();
  }, [router]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    form.setValue('title', newTitle);
    if (!form.formState.dirtyFields.slug) { // Only auto-update slug if user hasn't manually edited it
      form.setValue('slug', slugify(newTitle), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CreatePostFormValues) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to create a post.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const postToInsert: TablesInsert<'posts'> = {
        user_id: user.id,
        author_name_cache: user.user_metadata?.full_name || user.email || 'Anonymous',
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt || null,
        cover_image_url: values.cover_image_url || null,
        status: 'published', // Publish immediately for simplicity
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(postToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Post Created!', description: `"${data.title}" has been published.` });
      router.push(`/blog/${data.slug}`);
    } catch (error: any) {
      toast({ title: 'Error Creating Post', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <Edit className="mr-3 h-7 w-7 text-primary" />
            Create New Blog Post
          </h1>
          <p className="text-muted-foreground">Share your insights with the world.</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={handleTitleChange} placeholder="Your amazing post title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL Path)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="your-amazing-post-title" />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">E.g., /blog/{form.getValues('slug') || 'your-slug'}</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.png" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="A short summary of your post..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown Supported)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Write your article content here. Use Markdown for formatting." rows={15} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Publish Post
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
