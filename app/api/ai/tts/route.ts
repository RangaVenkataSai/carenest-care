import { NextRequest, NextResponse } from 'next/server';

function splitIntoChunks(text: string, maxLen = 130): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  // Split on punctuation or spaces
  const sentences = text.split(/([।!?.,;\n]+)/);
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (!part) continue;

    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) {
        chunks.push(current.trim());
      }
      if (part.length <= maxLen) {
        current = part;
      } else {
        // Break long words by space
        const words = part.split(' ');
        current = '';
        for (const w of words) {
          if ((current + ' ' + w).length <= maxLen) {
            current = current ? current + ' ' + w : w;
          } else {
            if (current.trim()) chunks.push(current.trim());
            current = w;
          }
        }
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  const supportedLangs = ['en', 'hi', 'te'];
  const targetLang = supportedLangs.includes(lang) ? lang : 'en';

  try {
    const chunks = splitIntoChunks(text, 120);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${targetLang}&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        console.warn(`TTS fetch failed for chunk: "${chunk}", status: ${res.status}`);
        continue;
      }

      const arrayBuf = await res.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuf));
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Could not generate speech audio' }, { status: 502 });
    }

    const combined = Buffer.concat(audioBuffers);

    return new Response(combined, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: unknown) {
    console.error('TTS endpoint error:', err);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    const lang = body.lang || 'en';

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const url = new URL(req.url);
    url.searchParams.set('text', text);
    url.searchParams.set('lang', lang);

    return GET(new NextRequest(url));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }
}
