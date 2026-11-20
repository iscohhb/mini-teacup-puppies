import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { fetchPublicDogsServer, fetchPublishedBlogPostsServer } from '@/lib/db.server';
import { dogUrl } from '@/lib/puppy';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, dogs] = await Promise.all([fetchPublishedBlogPostsServer(), fetchPublicDogsServer()]);

  const staticRoutes = [
    '',
    '/about',
    '/dogs',
    '/reserve',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
    '/faq',
    '/puppy-delivery',
    '/testimonials',
    '/puppy-contract',
    '/return-refund-policy',
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const dogRoutes = dogs.map((dog) => ({
    url: dogUrl(dog),
    changeFrequency: 'daily' as const,
    priority: dog.status === 'Sold' ? 0.3 : 0.8,
  }));

  return [...staticRoutes, ...dogRoutes, ...blogRoutes];
}
