
const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("destination.js loaded");

  const isLoggedIn = () => !!localStorage.getItem("token");
  const getToken = () => localStorage.getItem("token");
  const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

  let addresses = [];
  let selectedAddressId = null;
  let editingAddressId = null;

  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  const addressList = document.getElementById("addressList");
  const addressForm = document.getElementById("addressForm");
  const showAddressFormBtn = document.getElementById("showAddressForm");


  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryAddress2 = document.getElementById("deliveryAddress2");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCountry = document.getElementById("deliveryCountry");
  const deliveryPhone = document.getElementById("deliveryPhone");

  const btnToStep2 = document.getElementById("toStep2");
  const btnToStep3 = document.getElementById("toStep3");
  const btnToStep4 = document.getElementById("toStep4");
  const backToStep1 = document.getElementById("backToStep1");
  const backToStep2 = document.getElementById("backToStep2");
  const backToStep3 = document.getElementById("backToStep3");

  const saveAddressBtn = document.getElementById("saveAddressBtn");
  const cancelAddressForm = document.getElementById("cancelAddressForm");

  // ================================================
  // STEP NAVIGATION
  // ================================================
  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });
  }

  // Auto-skip Step 1 if logged in
  if (isLoggedIn()) {
    stepOne.classList.add("hidden");
    stepTwo.classList.remove("hidden");
    backToStep1?.classList.add("hidden");
    loadAddressesFromBackend();
  }

  // Step 1 → Step 2
  btnToStep2?.addEventListener("click", () => {
    if (!isLoggedIn()) {
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value.trim();

      if (!email || !password || password.length < 6) {
        return alert("Veuillez remplir vos identifiants.");
      }
    }

    showStep(stepOne, stepTwo);
    loadAddressesFromBackend();
  });

  // Step 2 → Step 3
  btnToStep3?.addEventListener("click", () => {
    if (!selectedAddressId) return alert("Veuillez sélectionner une adresse.");
    showStep(stepTwo, stepThree);
  });

  backToStep1?.addEventListener("click", () => showStep(stepTwo, stepOne));

  // Step 3 → Step 4
  btnToStep4?.addEventListener("click", () => {
    showStep(stepThree, stepFour);
    renderSummaryCard();
  });

  backToStep2?.addEventListener("click", () => showStep(stepThree, stepTwo));
  backToStep3?.addEventListener("click", () => showStep(stepFour, stepThree));

  // ================================================
  // BACKEND – LOAD ADDRESSES
  // ================================================
  async function loadAddressesFromBackend() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/addresses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.warn("Failed to load addresses");
        return;
      }

      addresses = await res.json();
      console.log("Loaded addresses:", addresses);

      renderAddressList();
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  }

  // ================================================
  // RENDER ADDRESS LIST
  // ================================================
  function renderAddressList() {
    addressList.innerHTML = "";

    if (addresses.length === 0) {
      addressForm.classList.remove("hidden");
      return;
    }

    addressForm.classList.add("hidden");

    addresses.forEach((addr) => {
      const card = document.createElement("div");
      card.className =
        "border border-[#A47343] rounded-md p-4 hover:bg-[#f9f4ee] transition";

      card.innerHTML = `
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="addressChoice" 
            value="${addr.id_user_address}" 
            ${selectedAddressId === addr.id_user_address ? "checked" : ""} />

          <div>
            <p class="font-semibold">${addr.address_line1}</p>
            ${addr.address_line2 ? `<p>${addr.address_line2}</p>` : ""}
            <p>${addr.postal_code} ${addr.city}</p>
            <p>${addr.country}</p>
            <p>${addr.phone}</p>
          </div>
        </label>

        <div class="flex gap-4 mt-3 text-sm">
          <button class="editAddress text-[#A47343]">✏️ Modifier</button>
          <button class="deleteAddress text-[#A47343]">🗑 Supprimer</button>
        </div>
      `;

      // Select address
      card.querySelector("input").addEventListener("change", () => {
        selectedAddressId = addr.id_user_address;
      });

      // Edit address
      card.querySelector(".editAddress").addEventListener("click", () => {
        editingAddressId = addr.id_user_address;
        fillForm(addr);
        addressForm.classList.remove("hidden");
      });

      // Delete address
      card.querySelector(".deleteAddress").addEventListener("click", async () => {
        if (confirm("Supprimer cette adresse ?")) {
          await deleteAddress(addr.id_user_address);
        }
      });

      addressList.appendChild(card);
    });
  }

  // ================================================
  // FORM HELPERS
  // ================================================
  function fillForm(addr) {
    deliveryAddress.value = addr.address_line1;
    deliveryAddress2.value = addr.address_line2 || "";
    deliveryPostal.value = addr.postal_code;
    deliveryCity.value = addr.city;
    deliveryCountry.value = addr.country;
    deliveryPhone.value = addr.phone;
  }

  cancelAddressForm?.addEventListener("click", () => {
    addressForm.classList.add("hidden");
    editingAddressId = null;
  });

  showAddressFormBtn?.addEventListener("click", () => {
    editingAddressId = null;
    addressForm.classList.remove("hidden");
  });

  // ================================================
  // CREATE / UPDATE ADDRESS
  // ================================================
  async function createAddress(data) {
    const res = await fetch(`${API_BASE_URL}/users/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to create address");
    return res.json();
  }

  async function updateAddress(id, data) {
    const res = await fetch(`${API_BASE_URL}/users/addresses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update address");
    return res.json();
  }

  async function deleteAddress(id) {
    const res = await fetch(`${API_BASE_URL}/users/addresses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!res.ok) throw new Error("Failed to delete address");

    loadAddressesFromBackend();
  }

  saveAddressBtn?.addEventListener("click", async () => {
    const data = {
      first_name: firstNameInput.value,
      last_name: lastNameInput.value,
      address_line1: deliveryAddress.value,
      address_line2: deliveryAddress2.value,
      city: deliveryCity.value,
      postal_code: deliveryPostal.value,
      country: deliveryCountry.value,
      phone: deliveryPhone.value
    };

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, data);
      } else {
        await createAddress(data);
      }

      addressForm.classList.add("hidden");
      editingAddressId = null;

      await loadAddressesFromBackend();
    } catch (err) {
      alert("Erreur lors de l’enregistrement de l’adresse.");
    }
  });

  // ================================================
  // SUMMARY CARD
  // ================================================
  function renderSummaryCard() {
    const itemsEl = document.getElementById("summaryItems");
    const delEl = document.getElementById("summaryDelivery");
    const totEl = document.getElementById("summaryTotal");

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    itemsEl.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      total += item.price * item.quantity;
      itemsEl.innerHTML += `
        <div class="flex justify-between border-b pb-1">
          <span>${item.name} ×${item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}€</span>
        </div>`;
    });

    const deliveryCost =
      document.querySelector("input[name='delivery']:checked").value ===
      "express"
        ? 10
        : 5;

    delEl.textContent = deliveryCost.toFixed(2) + "€";
    totEl.textContent = (total + deliveryCost).toFixed(2) + "€";
  }

  // ================================================
  // PAYMENT LOGIC
  // ================================================
  const bankRadio = document.querySelector(`input[value="bank_transfer"]`);
  const cardRadio = document.querySelector(`input[value="card"]`);
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

  bankRadio.checked = true;
  updatePaymentUI();

  bankRadio.addEventListener("change", updatePaymentUI);
  cardRadio.addEventListener("change", updatePaymentUI);

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

  // ================================================
  // PLACE ORDER
  // ================================================
  document.getElementById("placeOrder")?.addEventListener("click", async () => {
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    ).value;

    const amount = parseFloat(
      document.getElementById("summaryTotal").textContent.replace("€", "")
    );

    const user = getUser();

    const data = {
      userId: user.id_user_account,
      addressId: selectedAddressId,
      amount
    };

    if (paymentMethod === "bank_transfer") {
      alert("Virement enregistré.");
      return;
    }

    // CARD
    const res = await fetch(`${API_BASE_URL}/payments/card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    const { clientSecret } = await res.json();

    const confirm = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    if (confirm.error) return alert(confirm.error.message);

    alert("Paiement effectué !");
  });

  // Load addresses immediately if logged in
  if (isLoggedIn()) loadAddressesFromBackend();
});
