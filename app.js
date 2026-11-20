// ==========================================
// 1. APPLICATION STATE (Single Source of Truth)
// ==========================================
const state = {
  items: [],        // Array of items fetched from the API
  favorites: [],    // Array of bookmarked items
  loading: false,   // Boolean: true while network request is in flight
  error: null       // String | null: holds any error message
};

const STORAGE_KEY = "my_app_favorites_v1";

// ==========================================
// 2. DOM REFERENCES
// ==========================================
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const resetBtn = document.querySelector("#reset-btn");
const statusMsg = document.querySelector("#status-msg");
const resultsGrid = document.querySelector("#results-grid");
const resultsCount = document.querySelector("#results-count");
const favsList = document.querySelector("#favs-list");
const favsCount = document.querySelector("#favs-count");

// ==========================================
// 3. RENDER FUNCTION (Milestone 2)
// ==========================================
function render() {
  // A. Update Status Messages (Loading / Error)
  if (state.loading) {
    statusMsg.textContent = "⏳ Fetching live records from API...";
    statusMsg.style.color = "var(--primary)";
  } else if (state.error) {
    statusMsg.textContent = `⚠️ ${state.error}`;
    statusMsg.style.color = "var(--accent)";
  } else {
    statusMsg.textContent = "";
  }

  // B. Update Count Badges
  resultsCount.textContent = `${state.items.length} items`;
  favsCount.textContent = `${state.favorites.length} saved`;

  // C. Render Search Results List
  if (state.items.length === 0 && !state.loading) {
    resultsGrid.innerHTML = '<div class="empty-state">No items found. Click Search or Show All.</div>';
  } else {
    resultsGrid.innerHTML = state.items.map(item => `
      <div class="item-card">
        <div>
          <h4>${item.title}</h4>
          <small>ID: #${item.id}</small>
        </div>
        <button class="btn-save" data-id="${item.id}">Save</button>
      </div>
    `).join("");
  }

  // D. Render Favorites List
  if (state.favorites.length === 0) {
    favsList.innerHTML = '<div class="empty-state">No favorites saved yet. Click "Save" on any card.</div>';
  } else {
    favsList.innerHTML = state.favorites.map(fav => `
      <div class="item-card">
        <div>
          <h4>${fav.title}</h4>
          <small>ID: #${fav.id}</small>
        </div>
        <button class="btn-remove" data-id="${fav.id}">Remove</button>
      </div>
    `).join("");
  }
}

// ==========================================
// 4. FETCH DATA FROM REST API (Milestone 1)
// ==========================================
async function fetchItems(filterText = "") {
  state.loading = true;
  state.error = null;
  render();

  try {
    const url = "[suspicious link removed]";
    
    // Step 1: Send request
    const response = await fetch(url);

    // Step 2: Validate response.ok status
    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    // Step 3: Parse JSON stream
    const data = await response.json();

    // Filter or slice first 6-8 records
    const filtered = filterText
      ? data.filter(item => item.title.toLowerCase().includes(filterText.toLowerCase())).slice(0, 8)
      : data.slice(0, 6);

    state.items = filtered;
    state.loading = false;
    render();
  } catch (err) {
    state.loading = false;
    state.error = err.message || "Failed to load data from server.";
    render();
  }
}

// ==========================================
// 5. LOCALSTORAGE PERSISTENCE (Milestone 4)
// ==========================================
function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.favorites));
  } catch (err) {
    console.error("Storage save failed:", err);
  }
}

function loadFavorites() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    state.favorites = rawData ? JSON.parse(rawData) : [];
  } catch (err) {
    console.warn("Could not parse saved storage data:", err);
    state.favorites = [];
  }
}

// ==========================================
// 6. ACTION HANDLERS (Milestone 3)
// ==========================================
function addFavorite(id) {
  const itemToAdd = state.items.find(item => String(item.id) === String(id));
  if (itemToAdd && !state.favorites.some(fav => String(fav.id) === String(id))) {
    state.favorites.push(itemToAdd);
    saveFavorites();
    render();
  }
}

function removeFavorite(id) {
  state.favorites = state.favorites.filter(fav => String(fav.id) !== String(id));
  saveFavorites();
  render();
}

// ==========================================
// 7. EVENT LISTENERS & DELEGATION
// ==========================================
searchBtn.addEventListener("click", () => {
  fetchItems(searchInput.value.trim());
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  fetchItems("");
});

// Event Delegation for dynamically generated buttons
resultsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-save")) {
    addFavorite(e.target.dataset.id);
  }
});

favsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove")) {
    removeFavorite(e.target.dataset.id);
  }
});

// ==========================================
// 8. INITIAL STARTUP
// ==========================================
loadFavorites();
render();
fetchItems();