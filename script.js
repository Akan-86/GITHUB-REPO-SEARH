function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

let currentPage = 1;

async function searchRepos() {
  const keyword = document.getElementById("searchInput").value;
  const sortOption = document.getElementById("sortOption").value;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    keyword
  )}&sort=${sortOption}&order=desc&page=${currentPage}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.items);
  } catch (error) {
    console.error("API Error:", error);
  }
}

async function loadMoreRepos() {
  currentPage++;
  await searchRepos();
}

function displayResults(repos) {
  const resultsContainer = document.getElementById("results");

  repos.forEach((repo) => {
    const repoCard = `
            <div class="col-md-4">
                <div class="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h5 class="font-bold">${repo.name}</h5>
                    <p>${repo.description || "No description available"}</p>
                    <a href="${
                      repo.html_url
                    }" target="_blank" class="btn btn-dark btn-hover">View on GitHub</a>
                </div>
            </div>
        `;
    resultsContainer.innerHTML += repoCard;
  });
}
