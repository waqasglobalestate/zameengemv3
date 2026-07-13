import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zameengem.com';

  // In a real application, you would fetch all dynamic property IDs and blog slugs from your database here.
  // For now, we add the core static routes.
  const staticRoutes = [
    '',
    '/properties',
    '/compare',
    '/calculators',
    '/blog',
    '/contact',
    '/dashboard',
    '/agents',
    '/sitemap',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/properties') ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  })) as MetadataRoute.Sitemap;

  return [...staticRoutes];
}
