// === CONFIG ===
const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ destination.js loaded");

  /* ---------------------------------------------------------
    AUTH HELPERS
  --------------------------------------------------------- */
  function isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  /* ---------------------------------------------------------
    DOM ELEMENTS
  --------------------------------------------------------- */
  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  const btnToStep2 = document.getElementById("toStep2");
  const btnToStep3 = document.getElementById("toStep3");
  const btnToStep4 = document.getElementById("toStep4");

  const btnBackToStep1 = document.getElementById("backToStep1");
  const btnBackToStep2 = document.getElementById("backToStep2");
  const btnBackToStep3 = document.getElementById("backToStep3");

  const deliveryForm = document.getElementById("deliveryForm");

  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryAddress2 = document.getElementById("deliveryAddress2");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCountry = document.getElementById("deliveryCountry");
  const deliveryPhone = document.getElementById("deliveryPhone");

  let deliveryCost = 5;

  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }
/* ---------------------------------------------------------
  VARIABLES GLOBALES
--------------------------------------------------------- */
let isGuestMode = false;
let currentUser = null;

/* ---------------------------------------------------------
  AUTO-SKIP STEP 1 FOR LOGGED-IN USER
--------------------------------------------------------- */
if (isLoggedIn()) {
  console.log("✅ User logged in → skipping Step 1");

  stepOne?.classList.add("hidden");
  stepTwo?.classList.remove("hidden");

  if (btnBackToStep1) btnBackToStep1.classList.add("hidden");

  // Masquer le champ email invité
  const guestEmailField = document.getElementById("guestEmailField");
  if (guestEmailField) {
    guestEmailField.classList.add("hidden");
  }

  const user = userService.getCurrentUser();
  currentUser = user;

  if (user) {
    // Pré-remplir TOUS les champs
    const deliveryFirstName = document.getElementById("deliveryFirstName");
    const deliveryLastName = document.getElementById("deliveryLastName");
    const deliveryAddress = document.getElementById("deliveryAddress");
    const deliveryAddress2 = document.getElementById("deliveryAddress2");
    const deliveryPhone = document.getElementById("deliveryPhone");
    const deliveryPostal = document.getElementById("deliveryPostal");
    const deliveryCity = document.getElementById("deliveryCity");
    const deliveryCountry = document.getElementById("deliveryCountry");

    if (deliveryFirstName) deliveryFirstName.value = user.first_name || "";
    if (deliveryLastName) deliveryLastName.value = user.last_name || "";
    if (deliveryAddress) deliveryAddress.value = user.address_line1 || "";
    if (deliveryAddress2) deliveryAddress2.value = user.address_line2 || "";
    if (deliveryPhone) deliveryPhone.value = user.phone || "";
    if (deliveryPostal) deliveryPostal.value = user.postal_code || "";
    if (deliveryCity) deliveryCity.value = user.city || "";
    if (deliveryCountry) deliveryCountry.value = user.country || "France";
  }
}

/* ---------------------------------------------------------
   ÉCOUTER L'ÉVÉNEMENT DE CONNEXION DEPUIS AuthForm
--------------------------------------------------------- */
window.addEventListener('proceed-to-step2', (e) => {
  const { user, isGuest } = e.detail;

  console.log('📨 Event proceed-to-step2 reçu');
  
  // Sauvegarder l'état
  isGuestMode = isGuest;
  currentUser = user;

  const guestEmailField = document.getElementById("guestEmailField");
  const deliveryEmail = document.getElementById("deliveryEmail");

  if (isGuest) {
    // MODE INVITÉ
    console.log('🎭 Mode invité - Affichage du champ email');
    
    if (guestEmailField) {
      guestEmailField.classList.remove("hidden");
    }
    if (deliveryEmail) {
      deliveryEmail.setAttribute("required", "required");
    }
    
  } else {
    // MODE CONNECTÉ
    console.log('✅ Utilisateur connecté:', user);

    if (guestEmailField) {
      guestEmailField.classList.add("hidden");
    }
    if (deliveryEmail) {
      deliveryEmail.removeAttribute("required");
    }

    // Pré-remplir TOUS les champs
    if (user) {
      const deliveryFirstName = document.getElementById("deliveryFirstName");
      const deliveryLastName = document.getElementById("deliveryLastName");
      const deliveryAddress = document.getElementById("deliveryAddress");
      const deliveryAddress2 = document.getElementById("deliveryAddress2");
      const deliveryPhone = document.getElementById("deliveryPhone");
      const deliveryPostal = document.getElementById("deliveryPostal");
      const deliveryCity = document.getElementById("deliveryCity");
      const deliveryCountry = document.getElementById("deliveryCountry");

      if (deliveryFirstName) deliveryFirstName.value = user.first_name || "";
      if (deliveryLastName) deliveryLastName.value = user.last_name || "";
      if (deliveryAddress) deliveryAddress.value = user.address_line1 || "";
      if (deliveryAddress2) deliveryAddress2.value = user.address_line2 || "";
      if (deliveryPhone) deliveryPhone.value = user.phone || "";
      if (deliveryPostal) deliveryPostal.value = user.postal_code || "";
      if (deliveryCity) deliveryCity.value = user.city || "";
      if (deliveryCountry) deliveryCountry.value = user.country || "France";
    }
  }

  // Masquer le bouton retour pour les utilisateurs connectés
  if (!isGuest && btnBackToStep1) {
    btnBackToStep1.classList.add("hidden");
  }

  // Passer à l'étape 2
  showStep(stepOne, stepTwo);
});

/* ---------------------------------------------------------
   STEP 2 → STEP 3 (Validation complète)
--------------------------------------------------------- */
btnToStep3?.addEventListener("click", () => {
  const guestEmailField = document.getElementById("guestEmailField");
  const deliveryEmail = document.getElementById("deliveryEmail");
  const deliveryFirstName = document.getElementById("deliveryFirstName");
  const deliveryLastName = document.getElementById("deliveryLastName");
  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPhone = document.getElementById("deliveryPhone");
  const deliveryCountry = document.getElementById("deliveryCountry");

  // Validation email pour les invités
  if (isGuestMode && !guestEmailField?.classList.contains("hidden")) {
    const email = deliveryEmail?.value.trim();
    if (!email) {
      return alert("Veuillez renseigner votre email");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return alert("Veuillez renseigner un email valide");
    }
    console.log("📧 Email invité:", email);
  }

  // Validation des champs obligatoires
  if (!deliveryFirstName?.value.trim()) {
    return alert("Veuillez renseigner votre prénom");
  }
  if (!deliveryLastName?.value.trim()) {
    return alert("Veuillez renseigner votre nom");
  }
  if (!deliveryAddress?.value.trim()) {
    return alert("Veuillez renseigner votre adresse");
  }
  if (!deliveryPostal?.value.trim()) {
    return alert("Veuillez renseigner votre code postal");
  }
  if (!deliveryCity?.value.trim()) {
    return alert("Veuillez renseigner votre ville");
  }
  if (!deliveryPhone?.value.trim()) {
    return alert("Veuillez renseigner votre téléphone");
  }
  if (!deliveryCountry?.value.trim()) {
    return alert("Veuillez sélectionner un pays");
  }

  console.log("✅ Validation Step 2 réussie");
  console.log("📦 Données:", {
    email: isGuestMode ? deliveryEmail?.value : currentUser?.email,
    firstName: deliveryFirstName?.value,
    lastName: deliveryLastName?.value,
    address: deliveryAddress?.value,
    postal: deliveryPostal?.value,
    city: deliveryCity?.value,
    phone: deliveryPhone?.value,
    country: deliveryCountry?.value,
    isGuest: isGuestMode
  });

  showStep(stepTwo, stepThree);
});

/* ---------------------------------------------------------
   NAVIGATION RETOUR
--------------------------------------------------------- */
btnBackToStep1?.addEventListener("click", () => {
  // Empêcher le retour si connecté
  if (isLoggedIn()) {
    console.log("⚠️ Impossible de revenir en arrière (déjà connecté)");
    return;
  }
  
  // Permettre le retour uniquement pour les invités
  if (isGuestMode) {
    showStep(stepTwo, stepOne);
  }
});


 

  /* ---------------------------------------------------------
     STEP 4 ← BACK TO STEP 3
  --------------------------------------------------------- */
  btnBackToStep3?.addEventListener("click", () => {
    showStep(stepFour, stepThree);
  });
/* ---------------------------------------------------------
   DELIVERY COST - VERSION COMPLÈTE
--------------------------------------------------------- */

deliveryForm?.addEventListener("change", (e) => {
const target = e.target;
  
  if (target.name === 'deliverySpeed') {
    // Calculer le coût selon l'option choisie
    if (target.value === "express") {
      deliveryCost = 10;
    } else if (target.value === "relay") {
      deliveryCost = 3.5;
    } else if (target.value === "standard") {
      deliveryCost = 5;
    }
    
    localStorage.setItem("deliveryCost", deliveryCost.toString());
    console.log('💰 Coût de livraison mis à jour:', deliveryCost);
    renderSummaryCard();
  }
});

/* ---------------------------------------------------------
   RENDER SUMMARY CARD - VERSION AMÉLIORÉE
--------------------------------------------------------- */
function renderSummaryCard() {
  const itemsEl = document.getElementById("summaryItems");
  const delEl = document.getElementById("summaryDelivery");
  const totEl = document.getElementById("summaryTotal");

  if (!itemsEl || !delEl || !totEl) {
    console.warn('⚠️ Éléments du summary non trouvés');
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  itemsEl.innerHTML = "";
  let subtotal = 0;

  // Afficher chaque article
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    itemsEl.innerHTML += `
      <div class="flex justify-between border-b border-[#5C3F32]/20 pb-2 mb-2">
        <span class="text-sm">${item.name} <span class="text-[#A47343]">x${item.quantity}</span></span>
        <span class="text-sm font-medium">${itemTotal.toFixed(2)}€</span>
      </div>
    `;
  });

  // Si le panier est vide
  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <p class="text-center text-[#A47343] text-sm italic">Votre panier est vide</p>
    `;
  }

  // Calculer le total final
  const total = subtotal + deliveryCost;

  // Mettre à jour l'affichage
  delEl.textContent = deliveryCost.toFixed(2) + "€";
  totEl.textContent = total.toFixed(2) + "€";

  // Sauvegarder pour d'autres parties de l'application
  sessionStorage.setItem('cartSubtotal', subtotal.toFixed(2));
  sessionStorage.setItem('deliveryCost', deliveryCost.toFixed(2));
  sessionStorage.setItem('cartTotal', total.toFixed(2));

  console.log('📊 Summary Card:', { subtotal, deliveryCost, total });
}

// Initialiser le rendu
renderSummaryCard();

  /* ---------------------------------------------------------
     PAYMENT UI
  --------------------------------------------------------- */
  const cardRadio = document.querySelector('input[value="card"]');
  const bankRadio = document.querySelector('input[value="bank_transfer"]');

  const bankInfo = document.getElementById("bankInfoSection");
  const cardSection = document.getElementById("cardFormSection");

  function updatePaymentUI() {
    if (bankRadio.checked) {
      bankInfo.classList.remove("hidden");
      cardSection.classList.add("hidden");
    } else {
      bankInfo.classList.add("hidden");
      cardSection.classList.remove("hidden");
      initStripe();
    }
  }

  cardRadio?.addEventListener("change", updatePaymentUI);
  bankRadio?.addEventListener("change", updatePaymentUI);

  bankRadio.checked = true;
  updatePaymentUI();

  /* ---------------------------------------------------------
     STRIPE SETUP
  --------------------------------------------------------- */
  let stripe = null;
  let elements = null;
  let cardElement = null;

  function initStripe() {
    if (stripe) return;

    stripe = Stripe(STRIPE_PUBLIC_KEY);
    elements = stripe.elements();
    cardElement = elements.create("card");
    cardElement.mount("#card-element");
  }

  /* ---------------------------------------------------------
     SAVE ADDRESS TO BACKEND
  --------------------------------------------------------- */
 async function saveAddressToBackend() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const body = {
  address_line1: deliveryAddress.value,
  address_line2: deliveryAddress2.value,
  city: deliveryCity.value,
  postal_code: deliveryPostal.value,
  country: deliveryCountry.value,
  phone: deliveryPhone.value,
};


  try {
    const res = await fetch(`${API_BASE_URL}/users/address`, {
      method: "PUT",   
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to update address");

    const updated = await res.json();

    localStorage.setItem("user", JSON.stringify(updated.data));

    console.log("📦 Address saved!");
  } catch (err) {
    console.error("❌ Failed to save address:", err);
  }
}

  /* ---------------------------------------------------------
     PLACE ORDER
  --------------------------------------------------------- */
  document.getElementById("placeOrder")?.addEventListener("click", async () => {
    const total = parseFloat(
      document.getElementById("summaryTotal").textContent.replace("€", "")
    );

    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    )?.value;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.id_user_account) {
      return alert("Vous devez être connecté.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const data = {
      userId: user.id_user_account,
      amount: total,
      delivery_address: deliveryAddress.value,
      delivery_address2: deliveryAddress2.value,
      delivery_city: deliveryCity.value,
      delivery_postal_code: deliveryPostal.value,
      delivery_country: deliveryCountry.value,
      delivery_phone: deliveryPhone.value,
    };

    /* -------------------- BANK TRANSFER -------------------- */
    if (paymentMethod === "bank_transfer") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error();

        const json = await res.json();

        await saveAddressToBackend(); // SAVE ADDRESS

        document.getElementById("bankReference").textContent =
          `ORDER-${json.orderId}`;
        document.getElementById("bankReferenceTwo").textContent =
          `ORDER-${json.orderId}`;
        document.getElementById("bankAmount").textContent =
          total.toFixed(2);
        document
          .getElementById("bankConfirmation")
          .classList.remove("hidden");

        alert("Commande enregistrée. Veuillez effectuer le virement bancaire.");
      } catch (err) {
        alert("Erreur pendant le paiement par virement.");
      }

      return;
    }

    /* -------------------- CARD PAYMENT -------------------- */
    if (paymentMethod === "card") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/card`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error();

        const { clientSecret } = await res.json();

        const confirm = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (confirm.error) return alert(confirm.error.message);

        await saveAddressToBackend();

        alert("Paiement par carte réussi !");
      } catch (err) {
        alert("Erreur Stripe.");
      }
    }
  });
});
