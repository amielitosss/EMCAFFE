import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { zip, country = "FR" } = await request.json();

    const BRAND_CODE = import.meta.env.MR_BRAND_CODE;
    const PRIVATE_KEY = import.meta.env.MR_PRIVATE_KEY;
    const API_URL = import.meta.env.MR_API_URL;

    if (!BRAND_CODE || !PRIVATE_KEY || !API_URL) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
    }

    const security = crypto
      .createHash('md5')
      .update(`${BRAND_CODE}${country}${zip}${PRIVATE_KEY}`)
      .digest('hex')
      .toUpperCase();

    const xml = `
      <soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
            <Enseigne>${BRAND_CODE}</Enseigne>
            <Pays>${country}</Pays>
            <CP>${zip}</CP>
            <NbResult>10</NbResult>
            <Security>${security}</Security>
          </WSI4_PointRelais_Recherche>
        </soap12:Body>
      </soap12:Envelope>
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/soap+xml" },
      body: xml,
    });

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/xml" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
