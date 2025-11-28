export const MONDIAL_RELAY_CONFIG = {
  // Vos identifiants réels
  codeEnseigne: import.meta.env.MR_CODE_ENSEIGNE || ' CC23PUML ',
  privateKey: import.meta.env.MR_PRIVATE_KEY || 'hzu09m5B',
  codeBrand: import.meta.env.PUBLIC_MR_CODE_BRAND || 'CC',
  
  // URLs API
  apiUrl: 'https://api.mondialrelay.com/WebService.asmx',
  widgetUrl: 'https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js',
  
  // Configuration
  defaultCountry: 'FR',
  allowedCountries: 'FR,BE,LU,ES',
};
