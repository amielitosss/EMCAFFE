const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("destination.js loaded");

  const isLoggedIn = () => !!localStorage.getItem("token");
  const getToken = () => localStorage.getItem("token");
  const getUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      console.log("📥 localStorage.user brut:", userStr);
      
      if (!userStr || userStr === "undefined" || userStr === "null") {
        console.warn("⚠️ Pas d'utilisateur en localStorage");
        return null;
      }
      
      const parsed = JSON.parse(userStr);
      console.log("✅ User parsé:", parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Erreur parsing user:", error);
      console.log("Contenu brut:", localStorage.getItem("user"));
      return null;
    }
  };
    const isGuestSession = () => localStorage.getItem("isGuestSession") === "true";

    const clearGuestSession = () => {
    localStorage.removeItem("isGuestSession");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("🧹 Session invité nettoyée");
  };

  let selectedAddressId = null;
  let deliveryCost = parseFloat(localStorage.getItem("deliveryCost") || "5");

 /* ---------------------------------------------------------
      GUEST USER MANAGEMENT
  --------------------------------------------------------- */
  const GUEST_CREDENTIALS = {
    email: "invite@invite.com",
    password: "Passing3-Scuba4-Durably6-Judge6"
  };

  async function loginGuestUser() {
    try {
      console.log("🔐 Tentative de connexion invité...");
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(GUEST_CREDENTIALS),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur connexion invité:", errorText);
        throw new Error("Impossible de se connecter en mode invité");
      }

      const responseData = await response.json();
      console.log("📦 Données reçues:", responseData);

      // ✅ CORRECTION : Extraire data de la réponse
      const data = responseData.data || responseData;

      // Vérifications
      if (!data.token) {
        throw new Error("Token manquant dans la réponse");
      }
      
      if (!data.user || !data.user.id_user_account) {
        console.error("❌ Structure user invalide:", data.user);
        throw new Error("Données utilisateur invalides");
      }

      // Stocker avec logs
      console.log("💾 Stockage dans localStorage...");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isGuestSession", "true");

      // Vérification immédiate
      const stored = localStorage.getItem("user");
      console.log("🔍 Vérification stockage:", stored);
      
      if (!stored || stored === "undefined" || stored === "null") {
        throw new Error("Échec du stockage localStorage");
      }

      console.log("✅ Connexion invité réussie");
      console.log("  - ID:", data.user.id_user_account);
      console.log("  - Email:", data.user.email);
      
      return data.user;
    } catch (error) {
      console.error("❌ Erreur connexion invité:", error);
      throw error;
    }
  }

  async function ensureGuestAuthentication() {
    console.log("🔄 ensureGuestAuthentication appelé");
    console.log("  - isGuestMode:", isGuestMode);
    console.log("  - isGuestSession:", isGuestSession());
    console.log("  - Token présent:", !!getToken());
    
    // Si utilisateur normal déjà connecté
    if (isLoggedIn() && !isGuestSession()) {
      console.log("✅ Utilisateur normal déjà connecté");
      const user = getUser();
      if (user && user.id_user_account) {
        return user;
      }
    }

    // Si session invitée active et valide
    if (isGuestSession() && getToken()) {
      console.log("🔍 Vérification session invitée existante");
      const user = getUser();
      
      if (user && user.id_user_account) {
        console.log("✅ Session invitée valide");
        return user;
      }
      
      console.log("⚠️ Session invitée corrompue, reconnexion...");
    }

    // Connexion invité nécessaire
    if (isGuestMode || isGuestSession() || !getToken()) {
      console.log("🔁 Connexion invité...");
      try {
        const user = await loginGuestUser();
        
        // Double vérification
        if (!user || !user.id_user_account) {
          throw new Error("Utilisateur invité invalide après connexion");
        }
        
        return user;
      } catch (error) {
        console.error("❌ Erreur authentification invité:", error);
        throw error;
      }
    }

    throw new Error("État d'authentification invalide");
  }


  /* ---------------------------------------------------------
      STEP SWITCHER
  --------------------------------------------------------- */
  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });
  }


  /* ---------------------------------------------------------
      ORDER CONFIRMATION POPUP
  --------------------------------------------------------- */
  function showOrderConfirmation(orderData) {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    
    const popup = document.createElement("div");
    popup.className = "bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto";
    
    const { orderId, email, items, total, deliveryCost, deliveryInfo } = orderData;
    
    popup.innerHTML = `
      <div class="p-6 md:p-8">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h2>
          <p class="text-gray-600">
            Numéro de commande : <span class="font-semibold text-gray-900">ORDER-${orderId}</span>
          </p>
        </div>

        <!-- Email Confirmation -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p class="font-semibold text-gray-900 mb-1">
                Un email de confirmation vous a été envoyé
              </p>
              <p class="text-sm text-gray-700">
                ${email}
              </p>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Adresse de livraison
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p class="font-medium">${deliveryInfo.firstName} ${deliveryInfo.lastName}</p>
            <p>${deliveryInfo.address}</p>
            ${deliveryInfo.address2 ? `<p>${deliveryInfo.address2}</p>` : ''}
            <p>${deliveryInfo.postalCode} ${deliveryInfo.city}</p>
            <p>${deliveryInfo.country}</p>
            <p class="mt-2">📞 ${deliveryInfo.phone}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Articles commandés
          </h3>
          <div class="space-y-3">
            ${items.map(item => `
              <div class="flex justify-between items-start bg-gray-50 rounded-lg p-3">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">${item.name}</p>
                  <p class="text-sm text-gray-600">Quantité : ${item.quantity}</p>
                </div>
                <p class="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)} €</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Order Total -->
        <div class="border-t pt-4 mb-6">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-700">
              <span>Sous-total</span>
              <span>${(total - deliveryCost).toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Frais de livraison</span>
              <span>${deliveryCost.toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            onclick="window.location.href='/account'"
            class="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Voir mes commandes
          </button>
          <button
            onclick="window.location.href='/'"
            class="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Empêcher la fermeture par clic extérieur (commande importante)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        e.stopPropagation();
      }
    });
  }


  /* ---------------------------------------------------------
      STEP ELEMENTS
  --------------------------------------------------------- */
  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  const btnToStep3 = document.getElementById("toStep3");
  const btnBackToStep3 = document.getElementById("backToStep3");

  /* ---------------------------------------------------------
      GUEST / LOGGED-IN
  --------------------------------------------------------- */
  let isGuestMode = false;
  let currentUser = null;

  if (isLoggedIn()) {
    stepOne?.classList.add("hidden");
    stepTwo?.classList.remove("hidden");

    const user = getUser();
    currentUser = user;

    // Si c'est une session invité, afficher le champ email
    if (isGuestSession()) {
      document.getElementById("guestEmailField")?.classList.remove("hidden");
      isGuestMode = true;
    } else {
      document.getElementById("guestEmailField")?.classList.add("hidden");
    }

    // Remplir les champs avec les données utilisateur
    document.getElementById("deliveryFirstName").value = user.first_name ?? "";
    document.getElementById("deliveryLastName").value = user.last_name ?? "";
    document.getElementById("deliveryAddress").value = user.address_line1 ?? "";
    document.getElementById("deliveryAddress2").value = user.address_line2 ?? "";
    document.getElementById("deliveryPhone").value = user.phone ?? "";
    document.getElementById("deliveryPostal").value = user.postal_code ?? "";
    document.getElementById("deliveryCity").value = user.city ?? "";
    document.getElementById("deliveryCountry").value = user.country ?? "France";
  }

  window.addEventListener("proceed-to-step2", async (e) => {
    const { user, isGuest } = e.detail;

    isGuestMode = isGuest;

    if (isGuest) {
      // Connexion automatique avec l'utilisateur guest
      try {
        const guestUser = await loginGuestUser();
        currentUser = guestUser;
        
        // Afficher le champ email pour l'invité
        document.getElementById("guestEmailField")?.classList.remove("hidden");
        
        // Afficher un message d'information
        const infoMsg = document.createElement("div");
        infoMsg.className = "bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4";
        infoMsg.innerHTML = `
          <p class="font-bold">Mode Invité</p>
          <p>Vous êtes connecté en tant qu'invité. Veuillez renseigner votre email pour la confirmation de commande.</p>
        `;
        stepTwo.insertBefore(infoMsg, stepTwo.firstChild);
        
      } catch (error) {
        alert("Erreur lors de l'initialisation du mode invité. Veuillez réessayer.");
        return;
      }
    } else {
      currentUser = user;
      document.getElementById("guestEmailField")?.classList.add("hidden");
    }

    showStep(stepOne, stepTwo);
  });

  /* ---------------------------------------------------------
      STEP 2 → STEP 3
  --------------------------------------------------------- */
  btnToStep3?.addEventListener("click", () => {
    const required = [
      "deliveryFirstName",
      "deliveryLastName",
      "deliveryAddress",
      "deliveryPostal",
      "deliveryCity",
      "deliveryPhone",
    ];

    // Validation des champs obligatoires
    for (let field of required) {
      const value = document.getElementById(field)?.value?.trim();
      if (!value) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }
    }

    // Validation email pour les invités
    if (isGuestMode || isGuestSession()) {
      const email = document.getElementById("deliveryEmail")?.value?.trim();
      if (!email || !email.includes("@")) {
        alert("Veuillez entrer un email valide.");
        return;
      }
    }

    showStep(stepTwo, stepThree);
  });

  btnBackToStep3?.addEventListener("click", () => {
    showStep(stepFour, stepThree);
  });

  /* ---------------------------------------------------------
      SUMMARY CARD
  --------------------------------------------------------- */
  function renderSummaryCard() {
    const itemsEl = document.getElementById("summaryItems");
    const delEl = document.getElementById("summaryDelivery");
    const totEl = document.getElementById("summaryTotal");

    if (!itemsEl) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let subtotal = 0;

    itemsEl.innerHTML = "";

    cart.forEach((item) => {
      const total = item.price * item.quantity;
      subtotal += total;

      itemsEl.innerHTML += `
        <div class="flex justify-between border-b pb-2">
          <span>${item.name} x${item.quantity}</span>
          <span>${total.toFixed(2)}€</span>
        </div>`;
    });

    const full = subtotal + deliveryCost;

    document.getElementById("summaryDelivery").textContent =
      deliveryCost.toFixed(2) + "€";
    document.getElementById("summaryTotal").textContent =
      full.toFixed(2) + "€";

    sessionStorage.setItem("cartTotal", full.toFixed(2));
  }

  renderSummaryCard();

  /* ---------------------------------------------------------
      CARD / BANK
  --------------------------------------------------------- */
  const cardRadio = document.querySelector('input[value="card"]');
  const bankRadio = document.querySelector('input[value="bank_transfer"]');

  const bankInfo = document.getElementById("bankInfoSection");
  const cardSection = document.getElementById("cardFormSection");

  let stripeInstance = null;
  let cardElement = null;

  function initStripe() {
    if (stripeInstance) return;

    stripeInstance = Stripe(STRIPE_PUBLIC_KEY);
    const elements = stripeInstance.elements();
    cardElement = elements.create("card");
    cardElement.mount("#card-element");
  }

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

  bankRadio.checked = true;
  updatePaymentUI();

  bankRadio.addEventListener("change", updatePaymentUI);
  cardRadio.addEventListener("change", updatePaymentUI);


 /* ---------------------------------------------------------
      PLACE ORDER
  --------------------------------------------------------- */
  document.getElementById("placeOrder")?.addEventListener("click", async () => {
    const placeOrderBtn = document.getElementById("placeOrder");
    const originalText = placeOrderBtn.textContent;
    
    try {
      console.log("🛒 Début de la commande...");
      
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = "Traitement en cours...";

      // ✅ CORRECTION 1: S'assurer de l'authentification AVANT de récupérer l'user
      if (isGuestMode || isGuestSession()) {
        console.log("🔄 Vérification authentification invité...");
        await ensureGuestAuthentication();
      }

      // ✅ CORRECTION 2: Récupérer l'utilisateur APRÈS l'authentification
      const user = getUser();
      console.log("👤 Utilisateur récupéré:", user);

      // ✅ CORRECTION 3: Vérifier que l'ID est présent
      if (!user || !user.id_user_account) {
        throw new Error("Impossible de récupérer l'ID utilisateur. Veuillez recharger la page.");
      }

      console.log("🔑 ID utilisateur:", user.id_user_account);

      const paymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      )?.value;

      if (!paymentMethod) {
        alert("Veuillez sélectionner un mode de paiement.");
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = originalText;
        return;
      }

      const guestEmail = document.getElementById("deliveryEmail")?.value?.trim() || null;
      const customerEmail = (isGuestMode || isGuestSession()) ? guestEmail : user.email;

      if (!customerEmail || !customerEmail.includes("@")) {
        alert("Veuillez entrer un email valide.");
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = originalText;
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (cart.length === 0) {
        alert("Votre panier est vide.");
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = originalText;
        return;
      }

      const total = parseFloat(sessionStorage.getItem("cartTotal") || "0");

      if (total <= 0) {
        alert("Le montant total doit être supérieur à 0.");
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = originalText;
        return;
      }

      const deliveryInfo = {
        firstName: document.getElementById("deliveryFirstName")?.value?.trim(),
        lastName: document.getElementById("deliveryLastName")?.value?.trim(),
        address: document.getElementById("deliveryAddress")?.value?.trim(),
        address2: document.getElementById("deliveryAddress2")?.value?.trim() || "",
        city: document.getElementById("deliveryCity")?.value?.trim(),
        postalCode: document.getElementById("deliveryPostal")?.value?.trim(),
        country: document.getElementById("deliveryCountry")?.value?.trim() || "France",
        phone: document.getElementById("deliveryPhone")?.value?.trim(),
      };

      // ✅ CORRECTION 4: userId est maintenant garanti d'être présent
      const payload = {
        userId: user.id_user_account,
        email: customerEmail,
        amount: total,
        delivery_first_name: deliveryInfo.firstName,
        delivery_last_name: deliveryInfo.lastName,
        delivery_address: deliveryInfo.address,
        delivery_address2: deliveryInfo.address2,
        delivery_city: deliveryInfo.city,
        delivery_postal_code: deliveryInfo.postalCode,
        delivery_country: deliveryInfo.country,
        delivery_phone: deliveryInfo.phone,
        items: cart,
        isGuestOrder: isGuestMode || isGuestSession(),
        deliveryCost: deliveryCost,
      };

      console.log("📦 Payload complet:", payload);
      console.log("🔑 Token présent:", !!getToken());
      console.log("🆔 userId dans payload:", payload.userId);

      /* ---------------- BANK TRANSFER ---------------- */
      if (paymentMethod === "bank_transfer") {
        console.log("🏦 Traitement virement bancaire...");
        
        const res = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Erreur API:", data);
          throw new Error(data.message || "Erreur lors du traitement du virement bancaire");
        }

        console.log("✅ Commande créée:", data.orderId);

        showOrderConfirmation({
        orderId: data.orderId,
        email: customerEmail,
        items: cart,
        total: total,
        deliveryCost: deliveryCost,
        deliveryInfo: deliveryInfo
      });

        localStorage.removeItem("cart");
        sessionStorage.removeItem("cartTotal");

        // Nettoyer la session invité si nécessaire
        if (isGuestSession()) {
          clearGuestSession();
        }


        return;
      }

      /* ---------------- CARD PAYMENT ---------------- */
      if (paymentMethod === "card") {
        console.log("💳 Traitement paiement carte...");
        
        if (!stripeInstance || !cardElement) {
          console.log("🔄 Initialisation Stripe...");
          initStripe();
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const res = await fetch(`${API_BASE_URL}/payments/card`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Erreur création PaymentIntent:", data);
          throw new Error(data.message || "Erreur lors de la création du paiement");
        }

        if (!data.clientSecret) {
          throw new Error("Client secret manquant dans la réponse du serveur");
        }

        console.log("✅ PaymentIntent créé");

        const confirm = await stripeInstance.confirmCardPayment(data.clientSecret, {
          payment_method: { 
            card: cardElement,
            billing_details: {
              email: customerEmail,
              name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
              phone: deliveryInfo.phone,
              address: {
                line1: deliveryInfo.address,
                line2: deliveryInfo.address2,
                city: deliveryInfo.city,
                postal_code: deliveryInfo.postalCode,
                country: deliveryInfo.country === "France" ? "FR" : deliveryInfo.country,
              }
            }
          },
          receipt_email: customerEmail,
        });

        if (confirm.error) {
          console.error("❌ Erreur Stripe:", confirm.error);
          
          await fetch(`${API_BASE_URL}/payments/card-failed`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              orderId: data.orderId,
              error: confirm.error.message,
            }),
          }).catch(err => console.error("Erreur notification échec:", err));

          throw new Error(confirm.error.message);
        }

        console.log("✅ Paiement confirmé:", confirm.paymentIntent.id);

         await fetch(`${API_BASE_URL}/payments/card-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentIntentId: paymentIntent.id,
        }),
      }).catch(err => console.error("Erreur notification succès:", err));

      // ✅ POPUP DE CONFIRMATION
      showOrderConfirmation({
        orderId: data.orderId,
        email: customerEmail,
        items: cart,
        total: total,
        deliveryCost: deliveryCost,
        deliveryInfo: deliveryInfo
      });

      localStorage.removeItem("cart");
      sessionStorage.removeItem("cartTotal");

      if (isGuestSession()) {
        clearGuestSession();
      }

      return;
    }

  } catch (error) {
    console.error("❌ Erreur lors de la commande:", error);
    alert(`Une erreur est survenue : ${error.message}`);
  } finally {
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = originalText;
    }
  }
});

  /* ---------------------------------------------------------
      CLEANUP ON PAGE UNLOAD
  --------------------------------------------------------- */
  window.addEventListener("beforeunload", () => {
    // Ne pas nettoyer si on est en cours de paiement
    const isProcessing = document.getElementById("placeOrder")?.disabled;
    if (!isProcessing && isGuestSession()) {
      // Garder la session invité active tant que le panier n'est pas vide
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length === 0) {
        clearGuestSession();
      }
    }
  });
});
