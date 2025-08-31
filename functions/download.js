import ytdl from 'ytdl-core';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const headers = { 'Content-Type': 'application/json' };

  if (request.method === 'POST') {
    // Get video info
    try {
      const { videoUrl } = await request.json();
      if (!ytdl.validateURL(videoUrl)) {
        return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
          status: 400,
          headers: headers,
        });
      }
      const info = await ytdl.getInfo(videoUrl);
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
      return new Response(JSON.stringify(formats), {
        headers: headers,
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to get video info' }), {
        status: 500,
        headers: headers,
      });
    }
  } else if (request.method === 'GET') {
    // Download video
    const videoUrl = url.searchParams.get('url');
    const quality = url.searchParams.get('quality');

    if (!videoUrl || !quality || !ytdl.validateURL(videoUrl)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: headers });
    }

    try {
      const stream = ytdl(videoUrl, { quality });
      
      const readableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          stream.on('end', () => {
            controller.close();
          });
          stream.on('error', (err) => {
            controller.error(err);
          });
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Disposition': 'attachment; filename="video.mp4"',
          'Content-Type': 'video/mp4',
        },
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to download video' }), { status: 500, headers: headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: headers });
}