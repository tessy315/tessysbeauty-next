
const openBtn = document.getElementById("open-review-form");
const closeBtn = document.getElementById("close-popup");
const popup = document.getElementById("review-popup");
const form = document.getElementById("review-form");
const stars = document.querySelectorAll("#rating-stars span");
let selectedRating = 0;

// Open popup
openBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
  popup.classList.add("flex");
});

// Close popup
closeBtn.addEventListener("click", () => {
  popup.classList.remove("flex");
  popup.classList.add("hidden");
});

// Star rating
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    stars.forEach(s => s.classList.toggle("text-yellow-500", Number(s.dataset.value) <= selectedRating));
  });
});

// Submit review
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.querySelector("input[type=text]").value.trim();
  const comment = form.querySelector("textarea").value.trim();
  const fileInput = form.querySelector("input[type=file]");
  const file = fileInput.files[0];

  if (!name || !comment || selectedRating === 0) {
    alert("Veuillez remplir tous les champs et sélectionner une note.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("comment", comment);
  formData.append("rating", selectedRating);
  if (file) formData.append("image", file);

  try {
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/reviews", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert("Merci pour votre avis !");
      form.reset();
      selectedRating = 0;
      stars.forEach(s => s.classList.remove("text-yellow-500"));
      popup.classList.add("hidden");
      loadReviews(); // refresh review list
    } else {
      alert(data.error || "Erreur lors de l'envoi de l'avis");
    }
  } catch (err) {
    console.error(err);
    alert("Erreur serveur");
  }
});

// ================= REVIEWS LIST & PAGINATION =================
const API_BASE = "https://academy-api.tessysbeautyy.workers.dev/reviews"; 
const R2_BASE = "https://pub-21ee2076b2774a0ea376336500b6f999.r2.dev/";
let currentPage = 1;
const limit = 6; // reviews per page

function sanitizeText(text) {
  if (!text) return "";
  return text.replace(/https?:\/\/\S+/gi, "").replace(/<[^>]*>/g, "").trim();
}

function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
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
    container.innerHTML = "<p>Aucun avis pour le moment.</p>";
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

