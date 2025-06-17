import { NextRequest } from 'next/server';
import https from 'https';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith('https://cdnt-preview.dzcdn.net')) {
    return new Response('Invalid or missing URL', { status: 400 });
  }

  return new Promise<Response>((resolve, reject) => {
    https.get(url, (dzRes) => {
      if (dzRes.statusCode !== 200) {
        reject(`Upstream error: ${dzRes.statusCode}`);
        return;
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(dzRes.headers)) {
        if (value) headers.set(key, value as string);
      }

      resolve(
        new Response(dzRes as any, {
          status: 200,
          headers,
        })
      );
    }).on('error', (err) => {
      reject(err);
    });
  });
}
