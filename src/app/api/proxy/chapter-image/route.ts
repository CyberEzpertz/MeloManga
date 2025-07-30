export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing image URL", { status: 400 });
  }

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
