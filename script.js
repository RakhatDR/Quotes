// QuoteSpace: генерация, поиск, избранное и хранение цитат.
"use strict";

const STORAGE_KEY = "quotespace_data_v1";

const starterQuotes = [
  { id: "q1", text: "Большие перемены начинаются с маленького шага.", author: "Неизвестный автор", category: "Вдохновение", favorite: false, custom: false },
  { id: "q2", text: "Единственный способ делать великие дела — любить то, что вы делаете.", author: "Стив Джобс", category: "Саморазвитие", favorite: false, custom: false },
  { id: "q3", text: "Успех — это сумма небольших усилий, повторяемых изо дня в день.", author: "Роберт Кольер", category: "Успех", favorite: false, custom: false },
  { id: "q4", text: "Мудрость начинается с удивления.", author: "Сократ", category: "Мудрость", favorite: false, custom: false },
  { id: "q5", text: "Не ждите. Время никогда не будет подходящим.", author: "Наполеон Хилл", category: "Саморазвитие", favorite: false, custom: false },
  { id: "q6", text: "Жизнь — это то, что происходит, пока вы строите другие планы.", author: "Джон Леннон", category: "Жизнь", favorite: false, custom: false },
  { id: "q7", text: "Если вы можете мечтать об этом, вы можете это сделать.", author: "Уолт Дисней", category: "Вдохновение", favorite: false, custom: false },
  { id: "q8", text: "Неудача — это возможность начать снова, но уже более мудро.", author: "Генри Форд", category: "Успех", favorite: false, custom: false },
  { id: "q9", text: "Самое важное — не переставать задавать вопросы.", author: "Альберт Эйнштейн", category: "Мудрость", favorite: false, custom: false },
  { id: "q10", text: "Путь в тысячу миль начинается с первого шага.", author: "Лао-цзы", category: "Саморазвитие", favorite: false, custom: false },
  { id: "q11", text: "Будьте собой; все остальные роли уже заняты.", author: "Оскар Уайльд", category: "Жизнь", favorite: false, custom: false },
  { id: "q12", text: "Лучший способ предсказать будущее — создать его.", author: "Питер Друкер", category: "Вдохновение", favorite: false, custom: false }
];

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  favoriteCount: document.getElementById("favoriteCount"),
  breadcrumb: document.getElementById("breadcrumbCurrent"),
  homeHero: document.getElementById("homeHero"),
  quoteSectionTitle: document.getElementById("quoteSectionTitle"),
  featuredCategory: document.getElementById("featuredCategory"),
  featuredText: document.getElementById("featuredText"),
  featuredAuthor: document.getElementById("featuredAuthor"),
  authorAvatar: document.getElementById("authorAvatar"),
  quoteNumber: document.getElementById("quoteNumber"),
  favoriteButton: document.getElementById("favoriteButton"),
  copyButton: document.getElementById("copyButton"),
  randomButton: document.getElementById("randomButton"),
  nextQuoteButton: document.getElementById("nextQuoteButton"),
  toast: document.getElementById("toast"),
  libraryTitle: document.getElementById("libraryTitle"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  resultsLabel: document.getElementById("resultsLabel"),
  resultsCount: document.getElementById("resultsCount"),
  quoteGrid: document.getElementById("quoteGrid"),
  emptyState: document.getElementById("emptyState"),
  quoteForm: document.getElementById("quoteForm"),
  quoteInput: document.getElementById("quoteInput"),
  authorInput: document.getElementById("authorInput"),
  newCategory: document.getElementById("newCategory"),
  charCount: document.getElementById("charCount"),
  addSection: document.getElementById("addSection"),
  librarySection: document.getElementById("librarySection"),
  confirmModal: document.getElementById("confirmModal"),
  cancelDelete: document.getElementById("cancelDelete"),
  confirmDelete: document.getElementById("confirmDelete"),
  resetSearchButton: document.getElementById("resetSearchButton")
};

let quotes = loadQuotes();
let currentQuoteId = quotes.length ? quotes[0].id : null;
let currentView = "home";
let deleteTargetId = null;
let toastTimeout = null;

function loadQuotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item.text === "string" && typeof item.author === "string")
          .map(item => ({
            id: String(item.id || makeId()),
            text: item.text,
            author: item.author,
            category: item.category || "Другое",
            favorite: Boolean(item.favorite),
            custom: Boolean(item.custom)
          }));
      }
    }
  } catch (error) {
    console.warn("Не удалось прочитать сохранённые цитаты:", error);
  }
  return starterQuotes.map(quote => ({ ...quote }));
}

function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    updateFavoriteCount();
  } catch (error) {
    showToast("Не удалось сохранить данные. Проверьте настройки браузера.");
    console.error("Ошибка сохранения:", error);
  }
}

function makeId() {
  return "q-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function getCurrentQuote() {
  return quotes.find(quote => quote.id === currentQuoteId) || quotes[0] || null;
}

function updateFavoriteCount() {
  const count = quotes.filter(quote => quote.favorite).length;
  elements.favoriteCount.textContent = count;
}

function showToast(message) {
  elements.toast.textContent = message;
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    elements.toast.textContent = "";
  }, 2600);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    showToast("В коллекции пока нет цитат.");
    return;
  }
  const current = getCurrentQuote();
  let candidates = quotes.filter(quote => quote.id !== (current ? current.id : null));
  if (candidates.length === 0) candidates = quotes;
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  currentQuoteId = selected.id;
  renderFeaturedQuote();
}

function renderFeaturedQuote() {
  const quote = getCurrentQuote();
  if (!quote) {
    elements.featuredCategory.textContent = "Пусто";
    elements.featuredText.textContent = "Добавьте первую цитату в свою коллекцию.";
    elements.featuredAuthor.textContent = "Ваша библиотека";
    elements.authorAvatar.textContent = "Q";
    elements.quoteNumber.textContent = "ЦИТАТА —";
    elements.favoriteButton.classList.remove("is-favorite");
    elements.favoriteButton.textContent = "♡";
    elements.favoriteButton.disabled = true;
    elements.copyButton.disabled = true;
    return;
  }
  elements.featuredCategory.textContent = quote.category;
  elements.featuredText.textContent = quote.text;
  elements.featuredAuthor.textContent = quote.author;
  elements.authorAvatar.textContent = firstLetter(quote.author);
  elements.quoteNumber.textContent = "ЦИТАТА " + String(quotes.findIndex(item => item.id === quote.id) + 1).padStart(2, "0");
  elements.favoriteButton.disabled = false;
  elements.copyButton.disabled = false;
  elements.favoriteButton.classList.toggle("is-favorite", quote.favorite);
  elements.favoriteButton.textContent = quote.favorite ? "♥" : "♡";
  elements.favoriteButton.setAttribute("aria-label", quote.favorite ? "Убрать из избранного" : "Добавить в избранное");
  elements.favoriteButton.title = quote.favorite ? "Убрать из избранного" : "Добавить в избранное";
}

function firstLetter(value) {
  const trimmed = String(value || "").trim();
  return trimmed ? trimmed.charAt(0).toLocaleUpperCase("ru-RU") : "?";
}

function toggleFavorite(id) {
  const quote = quotes.find(item => item.id === id);
  if (!quote) return;
  quote.favorite = !quote.favorite;
  saveQuotes();
  renderFeaturedQuote();
  renderGrid();
  showToast(quote.favorite ? "Цитата добавлена в избранное." : "Цитата удалена из избранного.");
}

async function copyQuote(id) {
  const quote = quotes.find(item => item.id === id);
  if (!quote) return;
  const text = "«" + quote.text + "» — " + quote.author;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Цитата скопирована в буфер обмена.");
  } catch (error) {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    showToast(copied ? "Цитата скопирована в буфер обмена." : "Не удалось скопировать. Выделите текст вручную.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function getVisibleQuotes() {
  const query = elements.searchInput.value.trim().toLocaleLowerCase("ru-RU");
  const category = elements.categoryFilter.value;
  return quotes.filter(quote => {
    const matchesView = currentView !== "favorites" || quote.favorite;
    const matchesQuery = (quote.text + " " + quote.author + " " + quote.category).toLocaleLowerCase("ru-RU").includes(query);
    const matchesCategory = category === "all" || quote.category === category;
    return matchesView && matchesQuery && matchesCategory;
  });
}

function renderGrid() {
  const visibleQuotes = getVisibleQuotes();
  elements.quoteGrid.replaceChildren();
  elements.resultsCount.textContent = visibleQuotes.length + " " + pluralize(visibleQuotes.length, "цитата", "цитаты", "цитат");
  elements.resultsLabel.textContent = currentView === "favorites" ? "Ваши сохранённые цитаты" : "Подборка для вас";
  elements.emptyState.classList.toggle("hidden", visibleQuotes.length !== 0);
  elements.quoteGrid.classList.toggle("hidden", visibleQuotes.length === 0);

  visibleQuotes.forEach(quote => {
    const card = document.createElement("article");
    card.className = "quote-card";
    card.innerHTML = `
      <div class="card-top">
        <span class="card-category">${escapeHtml(quote.category)}</span>
        <div class="card-actions">
          <button class="card-icon ${quote.favorite ? "is-favorite" : ""}" data-action="favorite" data-id="${escapeHtml(quote.id)}" aria-label="${quote.favorite ? "Убрать из избранного" : "Добавить в избранное"}" title="${quote.favorite ? "Убрать из избранного" : "Добавить в избранное"}">${quote.favorite ? "♥" : "♡"}</button>
          <button class="card-icon" data-action="copy" data-id="${escapeHtml(quote.id)}" aria-label="Копировать цитату" title="Копировать цитату">▢</button>
          ${quote.custom ? `<button class="card-icon" data-action="delete" data-id="${escapeHtml(quote.id)}" aria-label="Удалить цитату" title="Удалить цитату">×</button>` : ""}
        </div>
      </div>
      <p class="card-quote">“${escapeHtml(quote.text)}”</p>
      <div class="card-footer">
        <div class="card-author-dot">${escapeHtml(firstLetter(quote.author))}</div>
        <div><div class="card-author">${escapeHtml(quote.author)}</div><div class="card-origin">${quote.custom ? "Добавлено вами" : "Коллекция QuoteSpace"}</div></div>
      </div>`;
    card.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === "favorite") toggleFavorite(id);
      if (action === "copy") copyQuote(id);
      if (action === "delete") openDeleteModal(id);
    });
    elements.quoteGrid.appendChild(card);
  });
}

function pluralize(number, one, few, many) {
  const lastTwo = number % 100;
  const last = number % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

function setView(view) {
  currentView = view;
  const labels = { home: "Главная", favorites: "Избранное", all: "Все цитаты" };
  elements.breadcrumb.textContent = labels[view];
  elements.navItems.forEach(item => item.classList.toggle("active", item.dataset.view === view));
  elements.homeHero.classList.toggle("hidden", view !== "home");
  document.querySelector(".quote-section").classList.toggle("hidden", view !== "home");
  elements.libraryTitle.textContent = view === "favorites" ? "Цитаты, которые вы выбрали" : view === "all" ? "Вся коллекция цитат" : "Найдите нужные слова";
  if (view === "favorites") {
    elements.librarySection.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (view === "all") {
    elements.librarySection.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  renderGrid();
}

function addQuote(event) {
  event.preventDefault();
  const text = elements.quoteInput.value.trim();
  const author = elements.authorInput.value.trim();
  if (!text || !author) {
    showToast("Заполните текст цитаты и имя автора.");
    return;
  }
  if (quotes.some(quote => quote.text.toLocaleLowerCase("ru-RU") === text.toLocaleLowerCase("ru-RU") &&
                           quote.author.toLocaleLowerCase("ru-RU") === author.toLocaleLowerCase("ru-RU"))) {
    showToast("Такая цитата этого автора уже есть в коллекции.");
    return;
  }
  const quote = {
    id: makeId(),
    text,
    author,
    category: elements.newCategory.value,
    favorite: false,
    custom: true
  };
  quotes.unshift(quote);
  currentQuoteId = quote.id;
  saveQuotes();
  elements.quoteForm.reset();
  elements.charCount.textContent = "0 / 500";
  elements.searchInput.value = "";
  elements.categoryFilter.value = "all";
  setView("all");
  renderFeaturedQuote();
  renderGrid();
  showToast("Цитата успешно добавлена и сохранена.");
  document.querySelector(".quote-section").classList.remove("hidden");
}

function openDeleteModal(id) {
  deleteTargetId = id;
  elements.confirmModal.classList.remove("hidden");
  elements.confirmDelete.focus();
}

function closeDeleteModal() {
  elements.confirmModal.classList.add("hidden");
  deleteTargetId = null;
}

function deleteQuote() {
  if (!deleteTargetId) return;
  const removedId = deleteTargetId;
  quotes = quotes.filter(quote => quote.id !== removedId);
  if (currentQuoteId === removedId) currentQuoteId = quotes.length ? quotes[0].id : null;
  saveQuotes();
  closeDeleteModal();
  renderFeaturedQuote();
  renderGrid();
  showToast("Цитата удалена.");
}

elements.randomButton.addEventListener("click", showRandomQuote);
elements.nextQuoteButton.addEventListener("click", showRandomQuote);
elements.favoriteButton.addEventListener("click", () => {
  const quote = getCurrentQuote();
  if (quote) toggleFavorite(quote.id);
});
elements.copyButton.addEventListener("click", () => {
  const quote = getCurrentQuote();
  if (quote) copyQuote(quote.id);
});
elements.navItems.forEach(item => item.addEventListener("click", () => setView(item.dataset.view)));
elements.searchInput.addEventListener("input", renderGrid);
elements.categoryFilter.addEventListener("change", renderGrid);
elements.quoteForm.addEventListener("submit", addQuote);
elements.quoteInput.addEventListener("input", () => {
  elements.charCount.textContent = elements.quoteInput.value.length + " / 500";
});
document.getElementById("scrollAddButton").addEventListener("click", () => elements.addSection.scrollIntoView({ behavior: "smooth", block: "start" }));
document.getElementById("addTopButton").addEventListener("click", () => elements.addSection.scrollIntoView({ behavior: "smooth", block: "start" }));
elements.cancelDelete.addEventListener("click", closeDeleteModal);
elements.confirmDelete.addEventListener("click", deleteQuote);
elements.confirmModal.addEventListener("click", event => {
  if (event.target === elements.confirmModal) closeDeleteModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !elements.confirmModal.classList.contains("hidden")) closeDeleteModal();
});
elements.resetSearchButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.categoryFilter.value = "all";
  renderGrid();
});

updateFavoriteCount();
renderFeaturedQuote();
renderGrid();
