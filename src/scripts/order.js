import { products, addons } from "../data/menu.js";
import { getFoodIcon } from "../data/food-icons.js";

const cart = new Map();
let selectedMode = "Retiro en local";
let activeFilter = "all";
let modalProduct = null;
let modalQuantity = 1;
let toastTimer;
const productsNode = document.querySelector("#products");
const searchInput = document.querySelector("#menu-search-input");
const resultCount = document.querySelector("#menu-result-count");
const clearSearchButton = document.querySelector("#clear-menu-search");
const noResults = document.querySelector("#menu-no-results");
const countNode = document.querySelector("#order-count");
const mobileCountNode = document.querySelector("#mobile-count");
const cartLinesNode = document.querySelector("#cart-lines");
const emptyNode = document.querySelector("#empty-order");
const totalNode = document.querySelector("#known-total");
const sendNode = document.querySelector("#send-order");
const toastNode = document.querySelector("#toast");
const orderCard = document.querySelector("#order-card");
const mobileCart = document.querySelector("#mobile-cart");
const mobileOrderQuery = window.matchMedia("(max-width: 720px)");
const productDialog = document.querySelector("#product-dialog");
const dialogContent = document.querySelector("#dialog-content");
const deliveryAddressField = document.querySelector("#delivery-address-field");
const deliveryAddress = document.querySelector("#delivery-address");
const orderDetailsForm = document.querySelector("#order-details-form");
const money = (value) => `$${Number(value).toFixed(2)}`;

function getProduct(id) { return products.find((product) => product.id === id); }
function getAddon(id) { return addons.find((addon) => addon.id === id); }
function itemDescription(product) {
  return product.description || "La carta compartida no detalla los ingredientes. Confirma preparación y posibles alérgenos con Joaos antes de pedir.";
}

function normalizeSearch(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

function renderProducts() {
  const query = normalizeSearch(searchInput.value);
  let visibleCount = 0;
  productsNode.querySelectorAll(".product-card").forEach((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !query || normalizeSearch(card.dataset.search || "").includes(query);
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) visibleCount += 1;
  });
  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "producto" : "productos"}`;
  clearSearchButton.hidden = searchInput.value.length === 0;
  noResults.hidden = visibleCount > 0;
}

searchInput.addEventListener("input", renderProducts);

function announce(message) {
  toastNode.textContent = message;
  toastNode.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastNode.classList.remove("show"), 2400);
}

function openProductModal(id) {
  modalProduct = getProduct(id);
  if (!modalProduct) return;
  modalQuantity = 1;
  const priceText = modalProduct.price === null ? "Precio por confirmar" : money(modalProduct.price);
  const priceLabel = modalProduct.priceLabel || "Precio según carta compartida";
  const eligibleAddons = addons.filter((addon) => !(modalProduct.includesDrink && addon.id === "drink") && !(addon.id === "upsize" && !modalProduct.includesFries));
  const pendingOptions = eligibleAddons.filter((addon) => addon.section === "pending");
  const pricedOptions = eligibleAddons.filter((addon) => addon.section === "priced");
  const optionRows = (options) => options.map((addon) => `
    <label class="option-row">
      <input type="checkbox" data-addon="${addon.id}" />
      <span class="option-name">${addon.name}<small class="option-note">${addon.note}</small></span>
      <span class="option-price ${addon.price === null ? "pending" : ""}">${addon.price === null ? "Por confirmar" : `+${money(addon.price)}`}</span>
    </label>`).join("");
  dialogContent.innerHTML = `
    <div class="dialog-head">
      <div>
        <div class="dialog-heading"><span class="dialog-art">${getFoodIcon(modalProduct.category)}</span><div><p class="dialog-eyebrow">${modalProduct.group}</p><h2 id="dialog-title">${modalProduct.name}</h2></div></div>
        <p class="dialog-description">${itemDescription(modalProduct)}</p>
      </div>
      <button class="dialog-close" type="button" data-dialog-close aria-label="Cerrar detalle">×</button>
    </div>
    <div class="dialog-body">
      <div class="dialog-column">
        ${pendingOptions.length ? `<section class="dialog-section"><h3>Opciones por confirmar</h3><p>El equipo confirma presentación y precio por WhatsApp.</p><div class="option-list">${optionRows(pendingOptions)}</div></section>` : ""}
        ${pricedOptions.length ? `<section class="dialog-section"><h3>Porciones adicionales</h3><p>Raciones completas con precio en la carta.</p><div class="option-list">${optionRows(pricedOptions)}</div></section>` : ""}
      </div>
      <div class="dialog-column">
        <section class="dialog-section"><div class="dialog-quantity"><div class="dialog-quantity-copy"><b>¿Cuántos quieres?</b><small>${priceLabel}</small></div><div class="stepper"><button type="button" data-modal-quantity="-1" aria-label="Quitar una unidad">−</button><strong id="modal-quantity">1</strong><button type="button" data-modal-quantity="1" aria-label="Agregar una unidad">+</button></div></div>
          <p class="dialog-product-price-hint">${priceText}${modalProduct.price === null ? ". Joaos confirmará el monto." : " por unidad, transcrito de la carta compartida."}</p>
        </section>
        <div class="dialog-summary" aria-live="polite"><div class="dialog-summary-row"><span>Subtotal conocido</span><strong id="modal-estimate">${modalProduct.price === null ? "Por confirmar" : money(modalProduct.price)}</strong></div><p class="dialog-summary-note" id="modal-summary-note">${modalProduct.price === null ? "Este producto no tiene precio legible en la carta compartida." : "Los precios de carta deben validarse con Joaos antes de publicar."}</p></div>
        <section class="dialog-section"><h3>Al confirmar por WhatsApp</h3><p>El equipo valida vigencia de precios, disponibilidad y los importes pendientes que hayas seleccionado.</p></section>
      </div>
      <div class="dialog-actions"><button class="dialog-cancel" type="button" data-dialog-close>Seguir mirando</button><button class="button" id="modal-add" type="button">Agregar al pedido <span aria-hidden="true">＋</span></button></div>
    </div>`;
  productDialog.showModal();
  productDialog.querySelector("[data-dialog-close]").focus();
  productDialog.querySelectorAll("[data-addon]").forEach((checkbox) => checkbox.addEventListener("change", updateModalEstimate));
  updateModalEstimate();
}

function selectedAddonIds() {
  return [...productDialog.querySelectorAll("[data-addon]:checked")].map((checkbox) => checkbox.dataset.addon);
}

function updateModalEstimate() {
  if (!modalProduct) return;
  const selected = selectedAddonIds().map(getAddon);
  const knownUnit = (modalProduct.price || 0) + selected.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const estimate = document.querySelector("#modal-estimate");
  const note = document.querySelector("#modal-summary-note");
  document.querySelector("#modal-quantity").textContent = String(modalQuantity);
  estimate.textContent = knownUnit > 0 ? money(knownUnit * modalQuantity) : "Por confirmar";
  const hasPending = modalProduct.price === null || selected.some((addon) => addon.price === null);
  note.textContent = hasPending
    ? "El subtotal suma solo conceptos con precio legible. Hay valores por confirmar y el total final puede cambiar."
    : "Estimado con precios de la carta compartida. Joaos confirma vigencia y disponibilidad por WhatsApp.";
}

function addModalProduct() {
  if (!modalProduct) return;
  const addonIds = selectedAddonIds();
  const key = [modalProduct.id, ...addonIds].join("::");
  const current = cart.get(key);
  cart.set(key, { productId: modalProduct.id, addonIds, quantity: (current?.quantity || 0) + modalQuantity });
  renderCart();
  const productName = modalProduct.name;
  productDialog.close();
  announce(`${productName} agregado al pedido`);
}

function setQuantity(lineKey, delta) {
  const line = cart.get(lineKey);
  if (!line) return;
  const next = line.quantity + delta;
  if (next <= 0) cart.delete(lineKey);
  else cart.set(lineKey, { ...line, quantity: next });
  renderCart();
}

function lineAmounts(line) {
  const product = getProduct(line.productId);
  const chosen = line.addonIds.map(getAddon);
  const knownUnit = (product.price || 0) + chosen.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const hasPending = product.price === null || chosen.some((addon) => addon.price === null);
  return { product, chosen, knownTotal: knownUnit * line.quantity, hasPending };
}

function renderCart() {
  const entries = [...cart.entries()];
  const totalItems = entries.reduce((sum, [, line]) => sum + line.quantity, 0);
  const knownTotal = entries.reduce((sum, [, line]) => sum + lineAmounts(line).knownTotal, 0);
  const hasPending = entries.some(([, line]) => lineAmounts(line).hasPending);
  countNode.textContent = String(totalItems);
  mobileCountNode.textContent = String(totalItems);
  totalNode.textContent = money(knownTotal);
  emptyNode.hidden = totalItems > 0;
  sendNode.disabled = totalItems === 0;
  document.querySelector("#order-disclaimer").textContent = hasPending
    ? "El subtotal suma solo productos y adicionales con precio legible. Los importes pendientes se confirmarán por WhatsApp."
    : "Importes estimados a partir de las cartas compartidas; Joaos confirma vigencia y total final por WhatsApp.";
  cartLinesNode.innerHTML = entries.map(([key, line]) => {
    const { product, chosen, knownTotal: lineTotal, hasPending: linePending } = lineAmounts(line);
    const details = chosen.map((addon) => `${addon.name}${addon.price === null ? " · precio por confirmar" : ` · ${money(addon.price)} c/u`}`).join("; ");
    const priceLabel = lineTotal > 0 ? `Monto conocido: ${money(lineTotal)}` : "Precio por confirmar";
    return `<div class="cart-line"><div><b>${line.quantity} × ${product.name}</b><small>${priceLabel}${linePending ? " · hay adicionales o precios por confirmar" : ""}${details ? `<br />Adicionales: ${details}` : ""}</small></div><div class="quantity"><button type="button" data-qty="${key}" data-delta="-1" aria-label="Quitar una unidad de ${product.name}">−</button><span>${line.quantity}</span><button type="button" data-qty="${key}" data-delta="1" aria-label="Agregar una unidad de ${product.name}">+</button></div></div>`;
  }).join("");
  syncOrderSheet();
}

function syncOrderSheet() {
  const open = orderCard.classList.contains("open");
  orderCard.inert = mobileOrderQuery.matches && !open;
  mobileCart.setAttribute("aria-expanded", String(open));
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add], [data-detail]");
  if (add) openProductModal(add.dataset.add || add.dataset.detail);
  const addFromModal = event.target.closest("#modal-add");
  if (addFromModal) addModalProduct();
  const close = event.target.closest("[data-dialog-close]");
  if (close) productDialog.close();
  const modalDelta = event.target.closest("[data-modal-quantity]");
  if (modalDelta) {
    modalQuantity = Math.max(1, modalQuantity + Number(modalDelta.dataset.modalQuantity));
    updateModalEstimate();
  }
  const qty = event.target.closest("[data-qty]");
  if (qty) setQuantity(qty.dataset.qty, Number(qty.dataset.delta));
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => {
      const active = button === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  }
  const clearSearch = event.target.closest("#clear-menu-search");
  if (clearSearch) {
    searchInput.value = "";
    renderProducts();
    searchInput.focus();
  }
  const resetMenu = event.target.closest("[data-reset-menu]");
  if (resetMenu) {
    searchInput.value = "";
    activeFilter = "all";
    document.querySelectorAll(".filter").forEach((button) => {
      const active = button.dataset.filter === "all";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
    searchInput.focus();
  }
  const mode = event.target.closest("[data-mode]");
  if (mode) {
    selectedMode = mode.dataset.mode;
    document.querySelectorAll(".mode-btn").forEach((button) => {
      const active = button === mode;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const isDelivery = selectedMode === "Consultar delivery";
    deliveryAddressField.hidden = !isDelivery;
    deliveryAddress.required = isDelivery;
  }
  const closeCart = event.target.closest("[data-cart-close]");
  if (closeCart) {
    orderCard.classList.remove("open");
    syncOrderSheet();
    mobileCart.focus({ preventScroll: true });
  }
});

productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});

mobileCart.addEventListener("click", () => {
  orderCard.classList.toggle("open");
  syncOrderSheet();
});

function syncOrderSheetForViewport() {
  if (!mobileOrderQuery.matches) orderCard.classList.remove("open");
  syncOrderSheet();
}

mobileOrderQuery.addEventListener("change", syncOrderSheetForViewport);
window.addEventListener("resize", syncOrderSheetForViewport);

sendNode.addEventListener("click", () => {
  if (!orderDetailsForm.reportValidity()) return;
  const entries = [...cart.values()];
  const knownTotal = entries.reduce((sum, line) => sum + lineAmounts(line).knownTotal, 0);
  const lines = entries.flatMap((line) => {
    const { product, chosen, knownTotal: lineTotal } = lineAmounts(line);
    const productPrice = product.price === null ? "precio por confirmar" : `${money(product.price * line.quantity)} por ${line.quantity}`;
    const result = [`• ${line.quantity} × ${product.name} — ${productPrice}`];
    chosen.forEach((addon) => {
      const addonPrice = addon.price === null ? "precio por confirmar" : `${money(addon.price * line.quantity)} por ${line.quantity}`;
      result.push(`   ↳ ${line.quantity} × ${addon.name} — ${addonPrice}`);
    });
    if (lineTotal > 0 && product.price === null) result.push(`   ↳ Importe conocido de esta línea: ${money(lineTotal)} (sin el precio del producto)`);
    return result;
  });
  const name = document.querySelector("#customer-name").value.trim();
  const customerId = document.querySelector("#customer-id").value.trim();
  const customerPhone = document.querySelector("#customer-phone").value.trim();
  const address = deliveryAddress.value.trim();
  const paymentMethod = document.querySelector("#payment-method").value;
  const note = document.querySelector("#order-note").value.trim();
  const pendingAddons = [...new Set(entries.flatMap((line) => line.addonIds.map(getAddon).filter((addon) => addon.price === null).map((addon) => addon.name)))];
  const message = [
    "Joaos Fast Food · La Trocha, Nueva Casarapa 🛵💨",
    "Para ordenar, estos son los datos de mi pedido:",
    "",
    `👤 NOMBRE: ${name}`,
    `🪪 CÉDULA: ${customerId}`,
    `📞 NRO. DE TELÉFONO: ${customerPhone}`,
    `📍 DIRECCIÓN DE ENTREGA: ${selectedMode === "Consultar delivery" ? address : "Retiro en local"}`,
    "",
    "🍔 PEDIDO:",
    ...lines,
    note ? `Nota: ${note}` : "",
    "",
    `💳 MÉTODO DE PAGO: ${paymentMethod}`,
    `Modalidad: ${selectedMode}`,
    `Subtotal conocido (no incluye importes por confirmar): ${money(knownTotal)}`,
    `¿Me confirman vigencia de precios, disponibilidad y total final?${pendingAddons.length ? ` También quisiera confirmar: ${pendingAddons.join(", ")}.` : ""}`,
    "Referencia: landing Joaos"
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/584241353049?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

renderProducts();
renderCart();
