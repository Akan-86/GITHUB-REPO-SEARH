let currentPage = 1;
let reposMap = {};

const exampleSearches = [
  "frontend test",
  "JavaScript Interview questions",
  "responsive design",
  "accessible UI",
  "React hooks",
  "Node.js",
  "GraphQL",
];

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", debounce(handleSearchSuggestions, 500));

  document.getElementById("searchBtn").addEventListener("click", searchRepos);

  document
    .getElementById("loadMoreBtn")
    .addEventListener("click", loadMoreRepos);

  document
    .getElementById("favoritesToggleBtn")
    .addEventListener("click", toggleFavorites);

  const exampleContainer = document.getElementById("exampleSearches");
  exampleSearches.forEach((example) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-secondary m-1";
    btn.textContent = example;
    btn.addEventListener("click", () => {
      searchInput.value = example;
      clearSuggestions();
    });
    exampleContainer.appendChild(btn);
  });
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function fetchRepositories(keyword, sortOption, page) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    keyword
  )}&sort=${sortOption}&order=desc&page=${page}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function searchRepos() {
  currentPage = 1;
  document.getElementById("results").innerHTML = "";
  document.getElementById("loadMoreBtn").style.display = "none";
  hideError();
  clearSuggestions();
  showLoader();

  const keyword = document.getElementById("searchInput").value;
  const sortOption = document.getElementById("sortOption").value;

  try {
    const data = await fetchRepositories(keyword, sortOption, currentPage);
    hideLoader();
    if (data.items && data.items.length > 0) {
      displayResults(data.items);
      document.getElementById("loadMoreBtn").style.display = "block";
    } else {
      displayError("No repositories found. Try a different keyword.");
    }
  } catch (error) {
    console.error("API Error:", error);
    hideLoader();
    displayError(
      "An error occurred while fetching repositories. Please try again later."
    );
  }
}

async function loadMoreRepos() {
  currentPage++;
  showLoader();

  const keyword = document.getElementById("searchInput").value;
  const sortOption = document.getElementById("sortOption").value;

  try {
    const data = await fetchRepositories(keyword, sortOption, currentPage);
    hideLoader();
    if (data.items && data.items.length > 0) {
      displayResults(data.items);
    } else {
      document.getElementById("loadMoreBtn").style.display = "none";
    }
  } catch (error) {
    console.error("API Error:", error);
    hideLoader();
    displayError(
      "An error occurred while fetching repositories. Please try again later."
    );
  }
}

function displayResults(repos) {
  const resultsContainer = document.getElementById("results");
  const fragment = document.createDocumentFragment();

  repos.forEach((repo) => {
    reposMap[repo.id] = repo;

    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    const card = document.createElement("div");
    card.className =
      "card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-100";

    const title = document.createElement("h5");
    title.className = "card-title font-bold";
    title.textContent = repo.name;

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = repo.description || "No description available";

    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.className = "btn btn-dark";
    link.textContent = "View on GitHub";

    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "btn btn-info mt-2";
    detailsBtn.textContent = "Details";
    detailsBtn.addEventListener("click", () => viewDetails(repo.id));

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "btn btn-warning mt-2";
    favBtn.textContent = "⭐ Favorite";
    favBtn.addEventListener("click", () => addFavorite(repo.id));

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(link);
    card.appendChild(detailsBtn);
    card.appendChild(favBtn);

    col.appendChild(card);
    fragment.appendChild(col);
  });

  resultsContainer.appendChild(fragment);
}

function displayError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function handleSearchSuggestions(e) {
  const query = e.target.value.trim();
  clearSuggestions();
  if (!query) return;
  getSearchSuggestions(query).then((suggestions) =>
    displaySuggestions(suggestions)
  );
}

async function getSearchSuggestions(query) {
  return [`${query} tutorial`, `${query} best practices`, `${query} examples`];
}

function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("suggestions");
  suggestions.forEach((sugg) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "list-group-item list-group-item-action suggestion-item";
    item.textContent = sugg;
    item.addEventListener("click", () => {
      document.getElementById("searchInput").value = sugg;
      clearSuggestions();
    });
    suggestionsDiv.appendChild(item);
  });
}

function clearSuggestions() {
  document.getElementById("suggestions").innerHTML = "";
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function setFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function addFavorite(repoId) {
  const repo = reposMap[repoId];
  if (!repo) return;
  let favorites = getFavorites();
  if (favorites.some((f) => f.id === repo.id)) {
    alert("This repository is already in your favorites.");
    return;
  }
  favorites.push(repo);
  setFavorites(favorites);
  alert("Added to favorites!");
}

function removeFavorite(repoId) {
  let favorites = getFavorites();
  favorites = favorites.filter((f) => f.id !== repoId);
  setFavorites(favorites);
  displayFavorites();
}

function toggleFavorites() {
  const container = document.getElementById("favoritesContainer");
  if (container.style.display === "none" || container.style.display === "") {
    displayFavorites();
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

function displayFavorites() {
  const favorites = getFavorites();
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = "";
  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorites yet.</p>";
    return;
  }
  const fragment = document.createDocumentFragment();
  favorites.forEach((repo) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    const card = document.createElement("div");
    card.className =
      "card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-100";

    const title = document.createElement("h5");
    title.className = "card-title font-bold";
    title.textContent = repo.name;

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = repo.description || "No description available";

    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.className = "btn btn-dark";
    link.textContent = "View on GitHub";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger mt-2";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFavorite(repo.id));

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(link);
    card.appendChild(removeBtn);

    col.appendChild(card);
    fragment.appendChild(col);
  });
  favoritesList.appendChild(fragment);
}

function viewDetails(repoId) {
  const repo = reposMap[repoId];
  if (!repo) {
    console.error("Repository not found for id:", repoId);
    return;
  }
  const modalBody = document.getElementById("repoModalBody");
  modalBody.innerHTML = `
    <p><strong>Name:</strong> ${repo.name}</p>
    <p><strong>Description:</strong> ${
      repo.description || "No description available"
    }</p>
    <p><strong>Language:</strong> ${repo.language || "N/A"}</p>
    <p><strong>License:</strong> ${
      repo.license ? repo.license.name : "None"
    }</p>
    <p><strong>Stars:</strong> ${repo.stargazers_count}</p>
    <p><strong>Forks:</strong> ${repo.forks_count}</p>
    <p><strong>Last Updated:</strong> ${new Date(
      repo.updated_at
    ).toLocaleString()}</p>
  `;
  document.getElementById("repoModalLink").href = repo.html_url;
  const repoModal = new bootstrap.Modal(document.getElementById("repoModal"));
  repoModal.show();
}
