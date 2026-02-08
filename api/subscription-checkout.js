/**
 * Proxy para subscription-checkout: evita CORS chamando o n8n pelo servidor.
 * O front chama /api/subscription-checkout (mesma origem) e esta função encaminha para o n8n.
 */

const N8N_WEBHOOK_URL = 'https://n8n-agente-n8n.vugtol.easypanel.host/webhook/subscription-checkout';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://finleve.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(text || '{}');
  } catch (err) {
    console.error('subscription-checkout proxy error:', err);
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
}
