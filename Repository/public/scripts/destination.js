const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("destination.js loaded");

  const isLoggedIn = () => !!localStorage.getItem("token");
  const getToken = () => localStorage.getItem("token");
  const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

  let selectedAddressId = null;
  let deliveryCost = parseFloat(localStorage.getItem("deliveryCost") || "5");

  /* ---------------------------------------------------------
      STEP SWITCHER
  --------------------------------------------------------- */
  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });
  }

  /* ---------------------------------------------------------
      POPUP
  --------------------------------------------------------- */
  function showPaymentPopup(message) {
    const popup = document.getElementById("paymentSuccessPopup");
    const messageEl = document.getElementById("popupMessage");
    const closeBtn = document.getElementById("popupCloseBtn");

    if (popup && messageEl) {
      messageEl.textContent = message;
      popup.classList.remove("hidden");

      if (closeBtn && !closeBtn.dataset.bound) {
        closeBtn.dataset.bound = "true";

        closeBtn.addEventListener("click", () => {
          popup.classList.add("hidden");

          const lang = window.location.pathname.split("/")[1] || "fr";
          window.location.href = `/${lang}/cart`;
        });
      }
    } else {
      alert(message);
    }
  }

  function getBaseSuccessMessage() {
    const el = document.getElementById("paymentSuccessMessage");
    return (el && el.textContent.trim()) || "Votre commande a été enregistrée.";
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

    document.getElementById("guestEmailField")?.classList.add("hidden");

    document.getElementById("deliveryFirstName").value = user.first_name ?? "";
    document.getElementById("deliveryLastName").value = user.last_name ?? "";
    document.getElementById("deliveryAddress").value = user.address_line1 ?? "";
    document.getElementById("deliveryAddress2").value = user.address_line2 ?? ""; // FIX 1
    document.getElementById("deliveryPhone").value = user.phone ?? "";
    document.getElementById("deliveryPostal").value = user.postal_code ?? "";
    document.getElementById("deliveryCity").value = user.city ?? "";
    document.getElementById("deliveryCountry").value = user.country ?? "France";
  }

  window.addEventListener("proceed-to-step2", (e) => {
    const { user, isGuest } = e.detail;

    isGuestMode = isGuest;
    currentUser = user;

    const guestEmailField = document.getElementById("guestEmailField");
    if (isGuest) guestEmailField.classList.remove("hidden");
    else guestEmailField.classList.add("hidden");

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

    for (let field of required) {
      if (!document.getElementById(field).value.trim()) {
        alert("Veuillez remplir tous les champs obligatoires.");
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
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    ).value;

    const user = getUser();
    const guestEmail = document.getElementById("deliveryEmail")?.value || null;
    const customerEmail = user.email || guestEmail || null;

    if (!customerEmail) {
      alert("Veuillez entrer un email.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = parseFloat(sessionStorage.getItem("cartTotal") || "0");

    const payload = {
      userId: user.id_user_account,
      email: customerEmail,
      amount: total,
      delivery_address: document.getElementById("deliveryAddress").value,
      delivery_city: document.getElementById("deliveryCity").value,
      delivery_postal_code: document.getElementById("deliveryPostal").value,
      delivery_country: document.getElementById("deliveryCountry").value,
      delivery_phone: document.getElementById("deliveryPhone").value,
      items: cart,
    };

    /* ---------------- BANK TRANSFER ---------------- */
    if (paymentMethod === "bank_transfer") {
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
        alert("Erreur virement : " + (data.message || "Erreur serveur"));
        return;
      }

      const baseMsg = getBaseSuccessMessage();
      showPaymentPopup(`${baseMsg} (ORDER-${data.orderId})`);
      return;
    }

    /* ---------------- CARD PAYMENT ---------------- */
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
      alert("Erreur carte : " + (data.message || "Erreur serveur"));
      return;
    }

    initStripe();

    const confirm = await stripeInstance.confirmCardPayment(data.clientSecret, {
      payment_method: { card: cardElement },
      receipt_email: customerEmail, // FIX 2
    });

    if (confirm.error) {
      alert(confirm.error.message);
      return;
    }

    const baseMsg = getBaseSuccessMessage();
    showPaymentPopup(`${baseMsg} (ORDER-${data.orderId})`);
  });
});
