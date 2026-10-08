const books = [
  {
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    price: "89.000đ",
    category: "van-hoc",
    cover: "cover-one",
    label: "BÁN CHẠY",
    art: "Nhà\ngiả kim",
    rating: "4.9",
    reviews: "1.2k",
  },
  {
    title: "Đi tìm lẽ sống",
    author: "Viktor E. Frankl",
    price: "105.000đ",
    category: "phat-trien",
    cover: "cover-two",
    label: "ĐÁNG ĐỌC",
    art: "Đi tìm\nlẽ sống",
    rating: "4.8",
    reviews: "986",
  },
  {
    title: "Rừng Na Uy",
    author: "Haruki Murakami",
    price: "128.000đ",
    category: "van-hoc",
    cover: "cover-three",
    label: "",
    art: "Rừng\nNa Uy",
    rating: "4.7",
    reviews: "743",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: "139.000đ",
    category: "phat-trien",
    cover: "cover-four",
    label: "MỚI VỀ",
    art: "Atomic\nHabits",
    rating: "4.9",
    reviews: "2.1k",
  },
  {
    title: "Tâm lý học về tiền",
    author: "Morgan Housel",
    price: "119.000đ",
    category: "kinh-te",
    cover: "cover-two",
    label: "",
    art: "Tâm lý học\nvề tiền",
    rating: "4.8",
    reviews: "532",
  },
  {
    title: "Những ngày thơ ấu",
    author: "Nguyên Hồng",
    price: "72.000đ",
    category: "van-hoc",
    cover: "cover-three",
    label: "",
    art: "Những ngày\nthơ ấu",
    rating: "4.6",
    reviews: "418",
  },
  {
    title: "Khu vườn bí mật",
    author: "Frances Hodgson",
    price: "95.000đ",
    category: "thieu-nhi",
    cover: "cover-one",
    label: "",
    art: "Khu vườn\nbí mật",
    rating: "4.9",
    reviews: "628",
  },
  {
    title: "Nghệ thuật tinh tế",
    author: "Mark Manson",
    price: "115.000đ",
    category: "phat-trien",
    cover: "cover-four",
    label: "",
    art: "Nghệ thuật\ntinh tế",
    rating: "4.7",
    reviews: "903",
  },
];

const bookGrid = document.querySelector("#book-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const cartCount = document.querySelector("#cart-count");
const cartItemsElement = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartModal = document.querySelector("#cart-modal");
const checkoutView = document.querySelector("#checkout-view");
const checkoutSuccess = document.querySelector("#checkout-success");
const checkoutButton = document.querySelector("#checkout-button");
const checkoutForm = document.querySelector("#checkout-form");
const orderNumber = document.querySelector("#order-number");
const chatWindow = document.querySelector("#chat-window");
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");
const toast = document.querySelector("#toast");
let cartTotal = 0;
const cartItems = [];
const chatHistory = [];

function renderBooks(filter = "all", query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBooks = books.filter((book) => {
    const matchesCategory = filter === "all" || book.category === filter;
    const matchesQuery =
      !normalizedQuery ||
      `${book.title} ${book.author}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  bookGrid.innerHTML = visibleBooks
    .map(
      (book) => `
    <article class="book-card" data-title="${book.title}">
      ${book.label ? `<span class="book-badge">${book.label}</span>` : ""}
      <div class="book-cover-wrap"><div class="book-cover ${book.cover}"><span>${book.art.replace("\n", "<br>")}</span><small>${book.author.toUpperCase()}</small></div></div>
      <div class="book-meta"><div><h3>${book.title}</h3><p>${book.author}</p></div><strong class="book-price">${book.price}</strong></div>
      <div class="book-rating">★★★★★ <span>${book.rating} (${book.reviews})</span></div>
    </article>`,
    )
    .join("");
  emptyState.hidden = visibleBooks.length > 0;
  document
    .querySelectorAll(".book-card")
    .forEach((card) =>
      card.addEventListener("click", () => addToCart(card.dataset.title)),
    );
}

function addToCart(title) {
  const book = books.find((item) => item.title === title);
  if (!book) return;
  const existingItem = cartItems.find((item) => item.title === title);
  if (existingItem) existingItem.quantity += 1;
  else cartItems.push({ ...book, quantity: 1 });
  renderCart();
  showToast(`Đã thêm “${title}” vào giỏ hàng`);
}
function priceToNumber(price) {
  return Number(price.replace(/\D/g, ""));
}
function formatPrice(value) {
  return `${value.toLocaleString("vi-VN")}đ`;
}
function renderCart() {
  cartTotal = cartItems.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = cartTotal;
  const subtotal = cartItems.reduce(
    (total, item) => total + priceToNumber(item.price) * item.quantity,
    0,
  );
  cartSubtotal.textContent = formatPrice(subtotal);
  cartEmpty.hidden = cartItems.length > 0;
  cartItemsElement.innerHTML = cartItems
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item-cover ${item.cover}">${item.art.split("\n")[0]}</div>
        <div class="cart-item-info"><strong>${item.title}</strong><span>${item.author}</span><b>${item.price}</b></div>
        <div class="cart-item-actions"><span>x${item.quantity}</span><button type="button" data-remove-cart="${item.title}" aria-label="Xóa ${item.title}">×</button></div>
      </div>`,
    )
    .join("");
  cartItemsElement
    .querySelectorAll("[data-remove-cart]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        removeFromCart(button.dataset.removeCart),
      ),
    );
}
function removeFromCart(title) {
  const itemIndex = cartItems.findIndex((item) => item.title === title);
  if (itemIndex < 0) return;
  cartItems[itemIndex].quantity -= 1;
  if (cartItems[itemIndex].quantity === 0) cartItems.splice(itemIndex, 1);
  renderCart();
}
function openCart() {
  renderCart();
  resetCheckoutView();
  cartModal.hidden = false;
}
function closeCart() {
  cartModal.hidden = true;
}
function resetCheckoutView() {
  checkoutView.hidden = true;
  checkoutSuccess.hidden = true;
  checkoutButton.hidden = false;
  cartItemsElement.hidden = false;
  cartEmpty.hidden = cartItems.length > 0;
  document.querySelector(".cart-summary").hidden = false;
}
function openCheckout() {
  if (!cartTotal) return showToast("Hãy thêm ít nhất một cuốn sách vào giỏ");
  checkoutView.hidden = false;
  cartItemsElement.hidden = true;
  cartEmpty.hidden = true;
  checkoutButton.hidden = true;
  document.querySelector(".cart-summary").hidden = true;
}
function completeCheckout(event) {
  event.preventDefault();
  const newOrderNumber = `MM-${Date.now().toString().slice(-6)}`;
  orderNumber.textContent = newOrderNumber;
  checkoutForm.reset();
  cartItems.length = 0;
  renderCart();
  checkoutView.hidden = true;
  checkoutSuccess.hidden = false;
  checkoutButton.hidden = true;
  cartItemsElement.hidden = true;
  cartEmpty.hidden = true;
  document.querySelector(".cart-summary").hidden = true;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openChat() {
  chatWindow.hidden = false;
  document.querySelector("#open-chat").style.display = "none";
  if (!chatMessages.children.length)
    addMessage(
      "bot",
      "Chào bạn, mình là Mộc Miên AI. Bạn đang tìm một cuốn sách cho mình hay làm quà?",
    );
  chatInput.focus();
}
function closeChat() {
  chatWindow.hidden = true;
  document.querySelector("#open-chat").style.display = "flex";
}
function addMessage(type, text) {
  const message = document.createElement("div");
  message.className = `message ${type === "user" ? "user" : ""}`;
  message.innerHTML = `${text}<span class="message-time">Vừa xong</span>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function addLoadingMessage() {
  const message = document.createElement("div");
  message.className = "message loading-message";
  message.innerHTML =
    'Mộc Miên AI đang suy nghĩ<span class="loading-dots">...</span>';
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}
async function sendMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;
  addMessage("user", cleanText);
  chatInput.value = "";
  chatHistory.push({ role: "user", content: cleanText });
  const loadingMessage = addLoadingMessage();
  chatInput.disabled = true;
  document.querySelector(".chat-form button").disabled = true;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không thể kết nối AI");
    loadingMessage.remove();
    chatHistory.push({ role: "assistant", content: result.message });
    addMessage("bot", result.message);
  } catch (error) {
    loadingMessage.remove();
    addMessage(
      "bot",
      `Mình chưa kết nối được với AI lúc này. ${error.message || "Bạn thử lại sau nhé."}`,
    );
  } finally {
    chatInput.disabled = false;
    document.querySelector(".chat-form button").disabled = false;
    chatInput.focus();
  }
}

renderBooks();
renderCart();
document.querySelectorAll(".category-pill").forEach((pill) =>
  pill.addEventListener("click", () => {
    document.querySelector(".category-pill.active").classList.remove("active");
    pill.classList.add("active");
    renderBooks(pill.dataset.category, searchInput.value);
  }),
);
searchInput.addEventListener("input", () =>
  renderBooks(
    document.querySelector(".category-pill.active").dataset.category,
    searchInput.value,
  ),
);
document.querySelector("#search-button").addEventListener("click", () => {
  document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#view-all-books").addEventListener("click", (event) => {
  event.preventDefault();
  searchInput.value = "";
  document.querySelector(".category-pill.active").classList.remove("active");
  document.querySelector('[data-category="all"]').classList.add("active");
  renderBooks();
  document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#open-chat").addEventListener("click", openChat);
document.querySelector("#close-chat").addEventListener("click", closeChat);
document.querySelector("#hero-chat-button").addEventListener("click", openChat);
document
  .querySelector("#banner-chat-button")
  .addEventListener("click", openChat);
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(chatInput.value);
});
document
  .querySelectorAll(".suggestions button")
  .forEach((button) =>
    button.addEventListener("click", () => sendMessage(button.dataset.message)),
  );
document.querySelector(".cart-button").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document
  .querySelector("[data-close-cart]")
  .addEventListener("click", closeCart);
checkoutButton.addEventListener("click", openCheckout);
checkoutForm.addEventListener("submit", completeCheckout);
document
  .querySelector("#back-to-cart")
  .addEventListener("click", resetCheckoutView);
document.querySelector("#continue-shopping").addEventListener("click", () => {
  closeCart();
  document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
});
