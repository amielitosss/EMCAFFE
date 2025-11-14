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
      STEP 3 → STEP 4 (same)
  ---------------------------------------------------------- */
  btnToStep4?.addEventListener("click", () => {
    showStep(stepThree, stepFour);
    renderSummaryCard();
  });

  // Back navigation
  btnBackToStep1?.addEventListener("click", () => showStep(stepTwo, stepOne));
  btnBackToStep2?.addEventListener("click", () => showStep(stepThree, stepTwo));
  btnBackToStep3?.addEventListener("click", () => showStep(stepFour, stepThree));

  /* DELIVERY COST */
  deliveryForm?.addEventListener("change", (e) => {
    const target = e.target;
    if (target.name === "delivery") {
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

    if (!summaryItems) return;

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
      PAYMENT LOGIC
  ---------------------------------------------------------- */
  const paypalRadio = document.querySelector('input[name="payment"][value="paypal"]');
  const cardRadio = document.querySelector('input[name="payment"][value="card"]');
  const cardFormSection = document.getElementById("cardFormSection");

  function updatePaymentView() {
    if (cardRadio?.checked) cardFormSection?.classList.remove("hidden");
    else cardFormSection?.classList.add("hidden");
  }

  paypalRadio?.addEventListener("change", updatePaymentView);
  cardRadio?.addEventListener("change", updatePaymentView);
  updatePaymentView();

  /* CARD PREVIEW */
  const cardNumberInput = document.getElementById("cardNumberInput");
  const cardNameInput = document.getElementById("cardNameInput");
  const cardExpiryInput = document.getElementById("cardExpiryInput");
  const cardCvcInput = document.getElementById("cardCvcInput");

  const cardNumberDisplay = document.getElementById("cardNumberDisplay");
  const cardNameDisplay = document.getElementById("cardNameDisplay");
  const cardExpiryDisplay = document.getElementById("cardExpiryDisplay");
  const cardCvcDisplay = document.getElementById("cardCvcDisplay");

  function formatCardNumber(value) {
    return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  }

  cardNumberInput?.addEventListener("input", () => {
    const formatted = formatCardNumber(cardNumberInput.value);
    cardNumberInput.value = formatted;
    cardNumberDisplay.textContent = formatted || "•••• •••• •••• ••••";
  });

  cardNameInput?.addEventListener("input", () => {
    const value = cardNameInput.value.trim();
    cardNameDisplay.textContent = value ? value.toUpperCase() : "NOM PRÉNOM";
  });

  cardExpiryInput?.addEventListener("input", () => {
    let value = cardExpiryInput.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    cardExpiryInput.value = value;
    cardExpiryDisplay.textContent = value || "MM/AA";
  });

  cardCvcInput?.addEventListener("input", () => {
    let value = cardCvcInput.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    cardCvcInput.value = value;
    cardCvcDisplay.textContent = value || "•••";
  });

  /* PLACE ORDER */
  const placeOrderBtn = document.getElementById("placeOrder");

  placeOrderBtn?.addEventListener("click", () => {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {
      alert("Please choose a payment method.");
      return;
    }

    if (selectedPayment.value === "paypal") {
      alert("Simulation: redirecting to PayPal...");
    } else {
      if (
        !cardNumberInput.value.trim() ||
        !cardNameInput.value.trim() ||
        !cardExpiryInput.value.trim() ||
        !cardCvcInput.value.trim()
      ) {
        alert("Please fill in all card fields.");
        return;
      }

      alert("Simulation: Card payment complete!");
    }
  });
});
