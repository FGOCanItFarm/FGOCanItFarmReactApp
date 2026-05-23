const AA_BASE = 'https://api.atlasacademy.io';

export async function onRequestGet({ params }) {
  const { id } = params;
  if (!id || !/^\d+$/.test(id)) {
    return new Response('Bad Request', { status: 400 });
  }
  const res = await fetch(`${AA_BASE}/nice/JP/servant/${id}?lang=en`);
  if (!res.ok) {
    return new Response('Not Found', { status: res.status });
  }
  const data = await res.json();
  return Response.json(data, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
