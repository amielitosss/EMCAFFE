import type { APIRoute } from 'astro';
import { createShippingLabel } from '../livraison/utils/mondialRelay';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    const labelParams = {
      modeLiv: '24R', // Point Relais
      ndExp: data.orderId,
      ndDest: data.customer.name,
      adDest1: data.customer.email, // Email dans Ad1 pour notification
      cpDest: data.relay.codePostal,
      villeDest: data.relay.ville,
      paysDest: data.relay.pays || 'FR',
      telDest: data.customer.phone,
      mailDest: data.customer.email,
      poids: (data.weight || 1000).toString(), // Poids en grammes
      nbColis: '1',
      crbt: '0', // Pas de contre-remboursement
      valeur: data.orderTotal?.toString() || '0',
      codCol: data.relay.id,
    };

    const result = await createShippingLabel(labelParams);

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        trackingNumber: result.expeditionNum,
        labelUrl: result.urlEtiquette,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Échec de la création de l\'étiquette');
    }

  } catch (error) {
    console.error('Erreur création étiquette:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur lors de la création de l\'étiquette',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
