import * as cheerio from 'cheerio';

export interface ScrapedMetadata {
  title: string;
  description: string | null;
  ogImage: string | null;
  favicon: string | null;
}

function resolveUrl(relativeOrAbsolute: string | null | undefined, baseUrl: string): string | null {
  if (!relativeOrAbsolute || !relativeOrAbsolute.trim()) {
    return null;
  }
  const cleanStr = relativeOrAbsolute.trim();
  try {
    return new URL(cleanStr, baseUrl).href;
  } catch {
    return null;
  }
}

export async function scrapeMetadata(targetUrl: string): Promise<ScrapedMetadata> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return {
      title: targetUrl,
      description: null,
      ogImage: null,
      favicon: null,
    };
  }

  const defaultFavicon = `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;
  const defaultTitle = parsedUrl.hostname;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: defaultTitle,
        description: null,
        ogImage: null,
        favicon: defaultFavicon,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const rawTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').first().text();

    const title = rawTitle && rawTitle.trim() ? rawTitle.trim() : defaultTitle;

    const rawDescription =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content');

    const description = rawDescription && rawDescription.trim() ? rawDescription.trim() : null;

    const rawOgImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('link[rel="image_src"]').attr('href');

    const ogImage = resolveUrl(rawOgImage, targetUrl);

    const rawFavicon =
      $('link[rel~="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="mask-icon"]').attr('href');

    const favicon = resolveUrl(rawFavicon, targetUrl) || defaultFavicon;

    return {
      title,
      description,
      ogImage,
      favicon,
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      title: defaultTitle,
      description: null,
      ogImage: null,
      favicon: defaultFavicon,
    };
  }
}
