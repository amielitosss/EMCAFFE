// src/scripts/checkoutStep3.ts
import { mondialRelayManager } from './livraison';

/**
 * Initialiser l'étape 3 du checkout (mode de livraison)
 */
async function initStep3() {
  // Charger les scripts Mondial Relay
  await mondialRelayManager.loadScripts();
  
  // Récupérer les éléments
  const mondialRelayOption = document.querySelector('input[name="delivery"][value="mondialrelay"]');
  const widgetContainer = document.getElementById('mondialRelayWidget');
  const searchButton = document.getElementById('btn-search-relay');
  const cpInput = document.getElementById('cp-search') as HTMLInputElement;
  const continueBtn = document.getElementById('toStep4');
  
  // Restaurer la sélection précédente
  mondialRelayManager.restorePreviousSelection();
  
  // Pré-remplir le code postal depuis l'étape 2
  const deliveryPostal = document.getElementById('deliveryPostal') as HTMLInputElement;
  if (deliveryPostal?.value && cpInput) {
    cpInput.value = deliveryPostal.value;
  }
  
  // Gérer le changement de mode de livraison
  document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      
      if (target.value === 'mondialrelay') {
        widgetContainer?.classList.remove('hidden');
        mondialRelayManager.resetSelection();
        
        // Auto-recherche si code postal disponible
        if (cpInput?.value && cpInput.value.length === 5) {
          setTimeout(() => {
            mondialRelayManager.initWidget(cpInput.value);
          }, 100);
        }
      } else {
        widgetContainer?.classList.add('hidden');
        mondialRelayManager.updateContinueButton();
      }
    });
  });
  
  // Bouton de recherche
  searchButton?.addEventListener('click', () => {
    const cp = cpInput?.value.trim();
    if (cp && cp.length === 5) {
      mondialRelayManager.initWidget(cp);
    } else {
      alert('Veuillez entrer un code postal valide (5 chiffres)');
    }
  });
  
  // Enter dans le champ de recherche
  cpInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButton?.click();
    }
  });
  
  // Validation avant passage à l'étape 4
  continueBtn?.addEventListener('click', (e) => {
    const deliveryMode = document.querySelector('input[name="delivery"]:checked') as HTMLInputElement;
    
    if (deliveryMode?.value === 'mondialrelay' && !mondialRelayManager.isRelaySelected()) {
      e.preventDefault();
      alert('Veuillez sélectionner un Point Relais Mondial Relay');
      return;
    }
    
    // Sauvegarder le mode de livraison
    if (deliveryMode) {
      localStorage.setItem('deliveryMode', deliveryMode.value);
      
      // Si Mondial Relay, sauvegarder aussi les détails
      if (deliveryMode.value === 'mondialrelay') {
        const relay = mondialRelayManager.getSelectedRelay();
        if (relay) {
          sessionStorage.setItem('checkoutRelay', JSON.stringify(relay));
        }
      }
    }
  });
  
  // Écouter l'événement de sélection de relais
  window.addEventListener('relay-selected', (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Relais sélectionné (event):', customEvent.detail);
    
    // Vous pouvez ajouter d'autres actions ici
    // Par exemple, mettre à jour le récapitulatif de commande
  });
}

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStep3);
} else {
  initStep3();
}
