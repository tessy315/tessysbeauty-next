
const API_REVIEWS = "https://academy-api.tessysbeautyy.workers.dev/reviews";
const ADMIN_TOKEN = localStorage.getItem("admin_token") || null;

let currentPage = 1;
const limit = 6;

function escapeText(text) {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/https?:\/\/\S+/gi, "[lien supprimé]");
}

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("review-popup");
  const openBtn = document.getElementById("open-review-form");
  const closeBtn = document.getElementById("close-popup");
  const form = document.getElementById("review-form");
  const list = document.getElementById("reviews-list");

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const pageLabel = document.getElementById("page-indicator");

  const stars = document.querySelectorAll("#rating-stars span");

  let rating = 0;

  /* ---------------- MODAL ---------------- */
  openBtn?.addEventListener("click", () => popup.classList.remove("hidden"));
  closeBtn?.addEventListener("click", () => popup.classList.add("hidden"));

  /* ---------------- STARS ---------------- */
  stars.forEach(star => {
    star.addEventListener("click", () => {
      rating = Number(star.dataset.value);
      stars.forEach(s => {
        s.classList.toggle("text-yellow-400", Number(s.dataset.value) <= rating);
        s.classList.toggle("text-gray-400", Number(s.dataset.value) > rating);
      });
    });
  });

  /* ---------------- LOAD REVIEWS ---------------- */
  async function loadReviews(page = 1) {
    currentPage = page;

    const res = await fetch(`${API_REVIEWS}?page=${page}&limit=${limit}`);
    const data = await res.json();

    list.innerHTML = "";

    if (!data.items.length) {
      list.innerHTML = `<p class="text-center text-gray-500">Aucun avis.</p>`;
      return;
    }

    data.items.forEach(r => {
      const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

      const card = document.createElement("div");
      card.className =
        "bg-white border border-pink-100 shadow p-5 rounded-none";

      card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-semibold text-pink-700">${escapeText(r.name)}</h4>
          <span class="text-yellow-400 text-lg">${stars}</span>
        </div>

        ${r.image_url ? `
          <img src="${r.image_url}" 
               class="w-full max-h-60 object-cover rounded-none mb-3 border" />
        ` : ""}

        <p class="text-gray-700 text-sm whitespace-pre-line">
          ${escapeText(r.comment)}
        </p>

        <div class="flex justify-between items-center mt-3 text-xs text-gray-400">
          <span>${new Date(r.created_at).toLocaleDateString()}</span>
          ${
            ADMIN_TOKEN
              ? `<button data-id="${r.id}" class="delete-review text-red-500 hover:underline">Supprimer</button>`
              : ""
          }
        </div>
      `;

      list.appendChild(card);
    });

    pageLabel.textContent = `Page ${data.page} / ${data.totalPages}`;

    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= data.totalPages;

    bindDeleteButtons();
  }

  /* ---------------- DELETE (ADMIN) ---------------- */
  function bindDeleteButtons() {
    document.querySelectorAll(".delete-review").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Supprimer cet avis ?")) return;

        const id = btn.dataset.id;

        await fetch(`${API_REVIEWS}/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${ADMIN_TOKEN}`
          }
        });

        loadReviews(currentPage);
      });
    });
  }

  /* ---------------- SUBMIT REVIEW ---------------- */
  form?.addEventListener("submit", async e => {
    e.preventDefault();

    const name = form.querySelector("input[type='text']").value.trim();
    const comment = form.querySelector("textarea").value.trim();
    const image = form.querySelector("input[type='file']").files[0];

    if (!name || !comment || rating === 0) {
      alert("Veuillez remplir le nom, le message et la note.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("comment", comment);
    fd.append("rating", rating);
    if (image) fd.append("image", image);

    const res = await fetch(API_REVIEWS, {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      alert("Erreur lors de l’envoi.");
      return;
    }

    form.reset();
    rating = 0;
    stars.forEach(s => s.classList.remove("text-yellow-400"));
    popup.classList.add("hidden");

    loadReviews(1);
  });

  /* ---------------- PAGINATION ---------------- */
  prevBtn?.addEventListener("click", () => {
    if (currentPage > 1) loadReviews(currentPage - 1);
  });

  nextBtn?.addEventListener("click", () => {
    loadReviews(currentPage + 1);
  });

  loadReviews(1);
});
