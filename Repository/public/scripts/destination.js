document.addEventListener("DOMContentLoaded", () => {
  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  // Next buttons
  const btnToStep2 = document.getElementById("toStep2");
  const btnToStep3 = document.getElementById("toStep3");
  const btnToStep4 = document.getElementById("toStep4");

  // Back buttons
  const btnBackToStep1 = document.getElementById("backToStep1");
  const btnBackToStep2 = document.getElementById("backToStep2");
  const btnBackToStep3 = document.getElementById("backToStep3");

  // Delivery form
  const deliveryForm = document.getElementById("deliveryForm");
  let deliveryCost = null;

  function showStep(hideEl, showEl) {
    if (!hideEl || !showEl) return;
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  /* ----------------------------------------------------------
      STEP 1 VALIDATION
  ---------------------------------------------------------- */
  btnToStep2?.addEventListener("click", () => {
    const email = document.querySelector('input[type="email"]');
    const password = document.querySelector('input[type="password"]');

    if (!email || !password) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim() || !emailRegex.test(email.value)) {
      alert("Please enter a valid email.");
      return;
    }

    if (password.value.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    showStep(stepOne, stepTwo);
  });

  /* ----------------------------------------------------------
      STEP 2 VALIDATION
  ---------------------------------------------------------- */
  btnToStep3?.addEventListener("click", () => {
    if (!stepTwo) return;
    const inputs = stepTwo.querySelectorAll("input");

    const firstName = inputs[0];
    const lastName = inputs[1];
    const postalCode = inputs[2];
    const city = inputs[3];

    if (!firstName.value.trim()) {
      alert("Please enter your first name.");
      return;
    }

    if (!lastName.value.trim()) {
      alert("Please enter your last name.");
      return;
    }

    if (!/^\d{4,6}$/.test(postalCode.value.trim())) {
      alert("Please enter a valid postal code.");
      return;
    }

    if (!city.value.trim()) {
      alert("Please enter your city.");
      return;
    }

    showStep(stepTwo, stepThree);
  });

  /* ----------------------------------------------------------
      STEP 3 → STEP 4
  ---------------------------------------------------------- */
  btnToStep4?.addEventListener("click", () => {
    showStep(stepThree, stepFour);
    renderSummaryCard();
    generateBankReference();
  });

  // Back navigation
  btnBackToStep1?.addEventListener("click", () => showStep(stepTwo, stepOne));
  btnBackToStep2?.addEventListener("click", () => showStep(stepThree, stepTwo));
  btnBackToStep3?.addEventListener("click", () => showStep(stepFour, stepThree));

  /* DELIVERY COST */
  deliveryForm?.addEventListener("change", (e) => {
    const target = e.target;
    if (target && target.name === "delivery") {
      deliveryCost = target.value === "express" ? 10 : 5;
      localStorage.setItem("deliveryCost", deliveryCost.toString());
      renderSummaryCard();
    }
  });

  /* ----------------------------------------------------------
      SUMMARY CARD
  ---------------------------------------------------------- */
  function renderSummaryCard() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const summaryItems = document.getElementById("summaryItems");
    const summaryDelivery = document.getElementById("summaryDelivery");
    const summaryTotal = document.getElementById("summaryTotal");

    if (!summaryItems || !summaryDelivery || !summaryTotal) return;

    summaryItems.innerHTML = "";
    let totalPrice = 0;

    cart.forEach((item) => {
      const itemPrice = parseFloat(item.price) * (item.quantity || 1);
      totalPrice += itemPrice;

      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between border-b border-[#A47343]/30 pb-2";

      div.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${item.image}" 
               alt="${item.name}" 
               class="w-16 h-16 object-contain rounded-md border border-[#A47343]/20 bg-white" />
          <div>
            <p class="font-medium text-sm">${item.name}</p>
            <p class="text-xs text-[#A47343]">x${item.quantity}</p>
          </div>
        </div>
        <span class="text-sm font-semibold">${itemPrice.toFixed(2)}€</span>
      `;

      summaryItems.appendChild(div);
    });

    const savedDelivery = localStorage.getItem("deliveryCost");

    if (!savedDelivery) {
      summaryDelivery.textContent = "—";
      summaryTotal.textContent = totalPrice.toFixed(2) + "€";
    } else {
      const deliveryValue = parseFloat(savedDelivery);
      summaryDelivery.textContent = deliveryValue.toFixed(2) + "€";
      summaryTotal.textContent = (totalPrice + deliveryValue).toFixed(2) + "€";
    }
  }

  const savedDelivery2 = localStorage.getItem("deliveryCost");
  if (savedDelivery2) deliveryCost = parseFloat(savedDelivery2);
  renderSummaryCard();

  /* ----------------------------------------------------------
      PAYMENT LOGIC TOGGLE (Card / Bank)
  ---------------------------------------------------------- */

  const cardRadio = document.querySelector('input[name="payment"][value="card"]');
  const bankRadio = document.querySelector(
    'input[name="payment"][value="bank_transfer"]'
  );

  const cardFormSection = document.getElementById("cardFormSection");
  const bankInfoSection = document.getElementById("bankInfoSection");

  function updatePaymentView() {
    if (cardRadio?.checked) {
      cardFormSection?.classList.remove("hidden");
      bankInfoSection?.classList.add("hidden");
      initStripe(); // initialize Stripe when card is selected
    } else {
      bankInfoSection?.classList.remove("hidden");
      cardFormSection?.classList.add("hidden");
    }
  }

  cardRadio?.addEventListener("change", updatePaymentView);
  bankRadio?.addEventListener("change", updatePaymentView);
  updatePaymentView();

  /* ----------------------------------------------------------
      AUTO-GENERATE BANK REFERENCE
  ---------------------------------------------------------- */
  function generateBankReference() {
    const ref = "EMC-" + Math.floor(100000 + Math.random() * 900000);
    const refSpan = document.getElementById("bankReference");
    if (refSpan) refSpan.textContent = ref;
  }

  /* ----------------------------------------------------------
      BANK TRANSFER BACKEND CALL
  ---------------------------------------------------------- */
  async function createBankTransferOrder(totalAmount) {
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch("http://localhost:3000/api/payments/bank-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          amount: totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la creation du virement.");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la creation du virement.");
    }
  }

  /* ----------------------------------------------------------
      STRIPE ELEMENTS INITIALISATION
  ---------------------------------------------------------- */
  let stripe = null;
  let elements = null;
  let cardElement = null;

  function initStripe() {
    if (stripe) return; // already initialized

    if (!window.Stripe) {
      console.error("Stripe.js is not loaded");
      return;
    }

    
    stripe = window.Stripe("pk_live_51SVYsz0ACSKi9caRRtdl5X8HZFKW6A1kIeHrChu1LRKTsukIDsWmrdu3sKLQxAGJz8AWUfiGH5YjwsGwvZ6dUHpW00lG4upFGX");

    elements = stripe.elements();
    cardElement = elements.create("card", {
      hidePostalCode: true,
    });

    const cardElementDiv = document.getElementById("card-element");
    if (cardElementDiv) {
      cardElement.mount("#card-element");
    }
  }

  /* ----------------------------------------------------------
      PLACE ORDER (BANK OR CARD)
  ---------------------------------------------------------- */
  const placeOrderBtn = document.getElementById("placeOrder");

  placeOrderBtn?.addEventListener("click", async () => {
    const selectedPayment = document.querySelector(
      'input[name="payment"]:checked'
    );

    if (!selectedPayment) {
      alert("Veuillez choisir un mode de paiement.");
      return;
    }

    const summaryTotalEl = document.getElementById("summaryTotal");
    if (!summaryTotalEl) {
      alert("Montant introuvable.");
      return;
    }

    const totalAmount = parseFloat(
      summaryTotalEl.textContent.replace("€", "").trim()
    );

    // ---------------------------
    // BANK TRANSFER FLOW
    // ---------------------------
    if (selectedPayment.value === "bank_transfer") {
      const result = await createBankTransferOrder(totalAmount);

      if (result && result.orderId) {
        const refSpan = document.getElementById("bankReference");
        if (refSpan) {
          refSpan.textContent = `ORDER-${result.orderId}`;
        }

        alert(
          "Votre commande a été enregistrée.\nVeuillez procéder au virement bancaire en utilisant la référence affichée."
        );
      }
      return;
    }

    // ---------------------------
    // CARD PAYMENT FLOW (STRIPE)
    // ---------------------------
    if (selectedPayment.value === "card") {
      if (!stripe || !cardElement) {
        alert(
          "Le paiement par carte n'est pas prêt. Veuillez sélectionner le mode carte pour initialiser le paiement, puis réessayer."
        );
        return;
      }

      try {
        // 1) Call backend to create PaymentIntent
        const res = await fetch("http://localhost:3000/api/payments/card", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: totalAmount }),
        });

        if (!res.ok) {
          console.error("Erreur API /payments/card", await res.text());
          alert("Erreur lors de la création du paiement.");
          return;
        }

        const { clientSecret } = await res.json();
        if (!clientSecret) {
          alert("Erreur: clientSecret manquant.");
          return;
        }

        // 2) Confirm card payment with Stripe.js
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (result.error) {
          console.error(result.error);
          const cardErrors = document.getElementById("card-errors");
          if (cardErrors) {
            cardErrors.textContent =
              result.error.message || "Erreur de paiement.";
          } else {
            alert(result.error.message || "Erreur de paiement.");
          }
          return;
        }

        if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          alert("Paiement par carte réussi ! Merci pour votre commande.");
          // TODO: redirect to a confirmation page if desired
        } else {
          alert("Le paiement n'a pas pu être confirmé.");
        }
      } catch (err) {
        console.error(err);
        alert("Une erreur est survenue lors du paiement.");
      }
    }
  });
});
