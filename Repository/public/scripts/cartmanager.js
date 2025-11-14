//  CART STORAGE

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

//  ADD TO CART

function addToCart(item) {
  let cart = getCart();
  const existing = cart.find(
    (p) => p.id === item.id && p.format === item.format
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  updateCartBadge();
}

// CART BADGE
 
function updateCartBadge() {
  const badges = [
    document.getElementById("cart-count"),
    document.getElementById("cart-count-desktop"),
  ];

  const cart = getCart();
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  badges.forEach((badge) => {
    if (!badge) return;
    if (totalItems > 0) {
      badge.textContent = totalItems.toString();
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  });
}

function clearCart() {
  localStorage.removeItem("cart");
  updateCartBadge();
}

// EXPORT FUNCTIONS
 
window.addToCart = addToCart;
window.updateCartBadge = updateCartBadge;
window.clearCart = clearCart;

// MODAL POPUP LOGIC (MATCHES LAYOUT)

window.dispatchAddToCartModal = (product) => {
  const modal = document.getElementById("cart-modal");
  if (!modal) return;

  // Select fields
  const img = document.getElementById("popup-image");
  const name = document.getElementById("popup-name");
  const format = document.getElementById("popup-format");
  const qty = document.getElementById("popup-qty");
  const price = document.getElementById("popup-price");

  const subtotal = document.getElementById("popup-subtotal");
  const total = document.getElementById("popup-total");
  const cartCount = document.getElementById("popup-cart-count");

  // Fill product
  img.src = product.image;
  name.textContent = product.name;
  format.textContent = "Format : " + (product.format || "—");
  qty.textContent = "Quantité : " + (product.quantity || 1);

  price.textContent = product.price.toFixed(2) + "€";

  const calcSubtotal = product.price * (product.quantity || 1);
  subtotal.textContent = calcSubtotal.toFixed(2) + "€";
  total.textContent = calcSubtotal.toFixed(2) + "€";

  const totalCartItems = getCart().reduce((sum, p) => sum + p.quantity, 0);
  cartCount.textContent = `Il y a ${totalCartItems} article(s) dans votre panier.`;

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Auto close after 10 seconds
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 10000);
};

//  CLOSE BUTTON + CONTINUE SHOPPING 
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("cart-modal-close");
  const continueBtn = document.getElementById("popup-continue");
  const modal = document.getElementById("cart-modal");

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  closeBtn?.addEventListener("click", closeModal);

  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });
});
