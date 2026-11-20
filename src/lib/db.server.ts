import { createClient } from './supabase/server';
import { dogs as seedDogs } from '@/data/dogs';
import { testimonials as seedTestimonials } from '@/data/testimonials';
import { blogPosts as seedBlogPosts, type BlogPost } from '@/data/blog';
import type { Dog, Testimonial } from '@/types';
import { rowToAdminDog, rowToBlogPost, type DogRow, type BlogPostRow } from './db';
import { publicDogs } from './puppy';

/** Server-side variant of fetchPublicDogs, for use in Server Components. */
export async function fetchPublicDogsServer(): Promise<Dog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error || !data) return publicDogs(seedDogs);
  return publicDogs((data as DogRow[]).map(rowToAdminDog));
}

/** One published puppy by its URL slug (cleaned for display), or undefined. */
export async function fetchPublicDogBySlugServer(slug: string): Promise<Dog | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('dogs').select('*').eq('slug', slug).eq('published', true).maybeSingle();

  if (error || !data) return publicDogs(seedDogs).find((d) => d.id === slug);
  return publicDogs([rowToAdminDog(data as DogRow)])[0];
}

export async function fetchPublicTestimonialsServer(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error || !data) return seedTestimonials;
  return data.map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    dogName: r.dog_name,
    quote: r.quote,
    rating: r.rating,
    photo: r.photo_url,
  }));
}

/** Server-side variant of fetchPublishedBlogPosts, for use in Server Components. */
export async function fetchPublishedBlogPostsServer(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error || !data) return seedBlogPosts.filter((p) => p.published);
  return (data as BlogPostRow[]).map(rowToBlogPost);
}

export async function fetchPublishedBlogPostBySlugServer(slug: string): Promise<BlogPost | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle();

  if (error) return seedBlogPosts.find((p) => p.slug === slug);
  return data ? rowToBlogPost(data as BlogPostRow) : undefined;
}
