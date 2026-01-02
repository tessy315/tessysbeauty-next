
const API_BASE = "https://academy-api.tessysbeautyy.workers.dev/reviews"; 
const R2_BASE = "https://pub-21ee2076b2774a0ea376336500b6f999.r2.dev"; 
let currentPage = 1;
const limit = 5; // reviews per page

function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/https?:\/\/\S+/gi, "")  // remove URLs
    .replace(/<[^>]*>/g, "")         // strip HTML
    .trim();
}

function renderStars(rating) {
  const fullStar = "★";
  const emptyStar = "☆";
  return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

async function fetchReviews(page = 1) {
  const url = `${API_BASE}?page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const reviews = await res.json();
  return reviews.map(r => ({
    ...r,
    comment: sanitizeText(r.comment),
    imageUrl: r.image_key ? `${R2_BASE}${r.image_key}` : null
  }));
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");
  container.innerHTML = "";

  if (reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "border rounded-none p-3 mb-3 shadow-sm";

    div.innerHTML = `
      <div class="flex items-center mb-2">
        <strong class="mr-2">${r.name}</strong>
        <span class="text-yellow-500">${renderStars(r.rating)}</span>
      </div>
      <p class="mb-2">${r.comment}</p>
      ${r.imageUrl ? `<img src="${r.imageUrl}" alt="Review image" class="max-w-xs rounded-none shadow mb-2">` : ""}
      <small class="text-gray-500">${new Date(r.created_at).toLocaleDateString()}</small>
    `;

    container.appendChild(div);
  });
}

async function loadReviews() {
  const reviews = await fetchReviews(currentPage);
  renderReviews(reviews);

  document.getElementById("page-info").textContent = `Page ${currentPage}`;
  document.getElementById("prev-page").disabled = currentPage <= 1;
  document.getElementById("next-page").disabled = reviews.length < limit;
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) currentPage--;
  loadReviews();
});

document.getElementById("next-page").addEventListener("click", () => {
  currentPage++;
  loadReviews();
});

// Initial load
loadReviews();

