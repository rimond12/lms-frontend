import { SitemapStream, streamToPromise } from 'sitemap';
import { NextResponse } from 'next/server';

export async function GET() {
  const smStream = new SitemapStream({ hostname: 'https://basebd.org' });

  const urls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/join-BASE', changefreq: 'monthly', priority: 0.8 },
    { url: '/events', changefreq: 'weekly', priority: 0.9 },
    { url: '/blog', changefreq: 'weekly', priority: 0.7 },
    { url: '/news', changefreq: 'weekly', priority: 0.7 },
    { url: '/expert-panel', changefreq: 'monthly', priority: 0.6 },
    { url: '/BASE-gallery', changefreq: 'monthly', priority: 0.6 },
  ];
  urls.forEach((item) => smStream.write(item));
  smStream.end();

  const sitemapOutput = await streamToPromise(smStream).then((data) => data.toString());

  return new NextResponse(sitemapOutput, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
