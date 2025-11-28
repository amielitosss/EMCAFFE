// src/utils/mondialRelay.ts
import crypto from 'crypto';
import { MONDIAL_RELAY_CONFIG } from '../config/mondialRelay';

/**
 * Génère la signature MD5 requise par Mondial Relay
 */
export function generateMondialRelaySignature(params: string): string {
  const stringToHash = params + MONDIAL_RELAY_CONFIG.privateKey;
  return crypto.createHash('md5').update(stringToHash, 'utf8').digest('hex').toUpperCase();
}

/**
 * Prépare les paramètres pour l'API Mondial Relay
 */
export function prepareMondialRelayParams(params: Record<string, any>): string {
  // Trier les paramètres par ordre alphabétique
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map(key => params[key] || '').join('');
}

/**
 * Recherche de points relais
 */
export interface SearchRelayParams {
  pays: string;
  ville?: string;
  cp?: string;
  latitude?: string;
  longitude?: string;
  taille?: string; // Taille du colis (XS, S, M, L, XL)
  poids?: string;  // Poids en grammes
  action?: string; // REL (recherche) ou 24R (24R)
  delaiEnvoi?: string; // Délai d'envoi (0-30 jours)
  rayonRecherche?: string; // Rayon en km (20, 40, 60, 80)
  nombreResultats?: string; // Nombre de résultats (1-10)
}

export async function searchRelayPoints(params: SearchRelayParams) {
  const defaultParams = {
    Enseigne: MONDIAL_RELAY_CONFIG.codeEnseigne,
    Pays: params.pays || 'FR',
    Ville: params.ville || '',
    CP: params.cp || '',
    Latitude: params.latitude || '',
    Longitude: params.longitude || '',
    Taille: params.taille || '',
    Poids: params.poids || '',
    Action: params.action || 'REL',
    DelaiEnvoi: params.delaiEnvoi || '0',
    RayonRecherche: params.rayonRecherche || '20',
    NbResults: params.nombreResultats || '10',
  };

  // Générer la signature
  const paramsString = prepareMondialRelayParams(defaultParams);
  const security = generateMondialRelaySignature(paramsString);

  // Construire la requête SOAP
  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <WSI2_RecherchePointRelais xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${defaultParams.Enseigne}</Enseigne>
      <Pays>${defaultParams.Pays}</Pays>
      <Ville>${defaultParams.Ville}</Ville>
      <CP>${defaultParams.CP}</CP>
      <Latitude>${defaultParams.Latitude}</Latitude>
      <Longitude>${defaultParams.Longitude}</Longitude>
      <Taille>${defaultParams.Taille}</Taille>
      <Poids>${defaultParams.Poids}</Poids>
      <Action>${defaultParams.Action}</Action>
      <DelaiEnvoi>${defaultParams.DelaiEnvoi}</DelaiEnvoi>
      <RayonRecherche>${defaultParams.RayonRecherche}</RayonRecherche>
      <NbResults>${defaultParams.NbResults}</NbResults>
      <Security>${security}</Security>
    </WSI2_RecherchePointRelais>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(MONDIAL_RELAY_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.mondialrelay.fr/webservice/WSI2_RecherchePointRelais',
    },
    body: soapRequest,
  });

  const xmlText = await response.text();
  return parseRelayPointsResponse(xmlText);
}

function parseRelayPointsResponse(xml: string) {
  // Parser XML simple (vous pouvez utiliser une lib comme 'fast-xml-parser')
  // Ici un exemple basique
  const relayPoints: any[] = [];
  
  // TODO: Parser le XML correctement
  // Pour l'instant, retour fictif
  
  return {
    success: true,
    relayPoints,
  };
}

/**
 * Créer une étiquette d'expédition
 */
export interface CreateLabelParams {
  modeLiv: string; // Mode de livraison (24R, 24L, etc.)
  ndExp: string; // Numéro d'expéditeur
  ndDest: string; // Nom destinataire
  adDest1: string; // Adresse ligne 1
  cpDest: string; // Code postal
  villeDest: string; // Ville
  paysDest: string; // Pays (FR)
  telDest?: string; // Téléphone
  mailDest?: string; // Email
  poids: string; // Poids en grammes
  nbColis: string; // Nombre de colis
  crbt: string; // Contre-remboursement (0 si non)
  valeur: string; // Valeur du colis
  codCol: string; // Code du point relais
  instruction?: string; // Instructions
}

export async function createShippingLabel(params: CreateLabelParams) {
  const defaultParams = {
    Enseigne: MONDIAL_RELAY_CONFIG.codeEnseigne,
    ModeCol: 'CCC', // Collecte en agence
    ModeLiv: params.modeLiv || '24R',
    NDossier: '',
    NClient: '',
    Expe_Langage: 'FR',
    Expe_Ad1: '',
    Expe_Ad2: '',
    Expe_Ad3: '',
    Expe_Ad4: '',
    Expe_Ville: '',
    Expe_CP: '',
    Expe_Pays: 'FR',
    Expe_Tel1: '',
    Expe_Tel2: '',
    Expe_Mail: '',
    Dest_Langage: 'FR',
    Dest_Ad1: params.adDest1,
    Dest_Ad2: '',
    Dest_Ad3: params.ndDest,
    Dest_Ad4: '',
    Dest_Ville: params.villeDest,
    Dest_CP: params.cpDest,
    Dest_Pays: params.paysDest,
    Dest_Tel1: params.telDest || '',
    Dest_Tel2: '',
    Dest_Mail: params.mailDest || '',
    Poids: params.poids,
    Longueur: '',
    Taille: '',
    NbColis: params.nbColis || '1',
    CRT_Valeur: params.crbt || '0',
    CRT_Devise: 'EUR',
    Exp_Valeur: params.valeur || '0',
    Exp_Devise: 'EUR',
    COL_Rel_Pays: 'FR',
    COL_Rel: '',
    LIV_Rel_Pays: params.paysDest,
    LIV_Rel: params.codCol,
    TAvisage: '',
    TReprise: '',
    Montage: '0',
    TRDV: '',
    Assurance: '0',
    Instructions: params.instruction || '',
  };

  // Générer la signature
  const paramsString = prepareMondialRelayParams(defaultParams);
  const security = generateMondialRelaySignature(paramsString);

  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${defaultParams.Enseigne}</Enseigne>
      <ModeCol>${defaultParams.ModeCol}</ModeCol>
      <ModeLiv>${defaultParams.ModeLiv}</ModeLiv>
      <NDossier>${defaultParams.NDossier}</NDossier>
      <NClient>${defaultParams.NClient}</NClient>
      <Expe_Langage>${defaultParams.Expe_Langage}</Expe_Langage>
      <Expe_Ad1>${defaultParams.Expe_Ad1}</Expe_Ad1>
      <Expe_Ad3>${defaultParams.Expe_Ad3}</Expe_Ad3>
      <Expe_Ville>${defaultParams.Expe_Ville}</Expe_Ville>
      <Expe_CP>${defaultParams.Expe_CP}</Expe_CP>
      <Expe_Pays>${defaultParams.Expe_Pays}</Expe_Pays>
      <Expe_Tel1>${defaultParams.Expe_Tel1}</Expe_Tel1>
      <Expe_Mail>${defaultParams.Expe_Mail}</Expe_Mail>
      <Dest_Langage>${defaultParams.Dest_Langage}</Dest_Langage>
      <Dest_Ad1>${defaultParams.Dest_Ad1}</Dest_Ad1>
      <Dest_Ad3>${defaultParams.Dest_Ad3}</Dest_Ad3>
      <Dest_Ville>${defaultParams.Dest_Ville}</Dest_Ville>
      <Dest_CP>${defaultParams.Dest_CP}</Dest_CP>
      <Dest_Pays>${defaultParams.Dest_Pays}</Dest_Pays>
      <Dest_Tel1>${defaultParams.Dest_Tel1}</Dest_Tel1>
      <Dest_Mail>${defaultParams.Dest_Mail}</Dest_Mail>
      <Poids>${defaultParams.Poids}</Poids>
      <NbColis>${defaultParams.NbColis}</NbColis>
      <CRT_Valeur>${defaultParams.CRT_Valeur}</CRT_Valeur>
      <Exp_Valeur>${defaultParams.Exp_Valeur}</Exp_Valeur>
      <LIV_Rel_Pays>${defaultParams.LIV_Rel_Pays}</LIV_Rel_Pays>
      <LIV_Rel>${defaultParams.LIV_Rel}</LIV_Rel>
      <Security>${security}</Security>
    </WSI2_CreationEtiquette>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(MONDIAL_RELAY_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.mondialrelay.fr/webservice/WSI2_CreationEtiquette',
    },
    body: soapRequest,
  });

  const xmlText = await response.text();
  return parseLabelResponse(xmlText);
}

function parseLabelResponse(xml: string) {
  // Parser la réponse XML
  return {
    success: true,
    expeditionNum: '',
    urlEtiquette: '',
  };
}
