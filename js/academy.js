function $(id) {
  return document.getElementById(id);
}

function on(el, event, fn) {
  if (el) el.addEventListener(event, fn);
}

document.addEventListener("DOMContentLoaded", () => {
  const popup = $("review-popup");
  const openBtn = $("open-review-form");
  const closeBtn = $("close-popup");
  const form = $("review-form");
  const list = $("reviews-list");
  const stars = document.querySelectorAll("#rating-stars span");

  let selectedRating = 0;
  let currentPage = 1;
  const PAGE_SIZE = 6;
  let loading = false;
  let hasMore = true;

  /* ===============================
     UTILS
  =============================== */

  function escapeHTML(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderStars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  /* ===============================
     MODAL
  =============================== */
  on(openBtn, "click", () => popup.classList.remove("hidden"));
  on(closeBtn, "click", () => popup.classList.add("hidden"));

  /* ===============================
     STAR SELECT
  =============================== */
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);

      stars.forEach(s => {
        s.classList.toggle("text-yellow-400", Number(s.dataset.value) <= selectedRating);
        s.classList.toggle("text-gray-400", Number(s.dataset.value) > selectedRating);
      });
    });
  });

  /* ===============================
     LOAD REVIEWS (PAGINATED)
  =============================== */
  async function loadReviews(reset = false) {
    if (loading || !hasMore) return;
    loading = true;

    if (reset) {
      list.innerHTML = "";
      currentPage = 1;
      hasMore = true;
    }

    try {
      const res = await fetch(
        `https://academy-api.tessysbeautyy.workers.dev/reviews?page=${currentPage}&limit=${PAGE_SIZE}`
      );

      const data = await res.json();

      if (!Array.isArray(data.items)) return;

      if (data.items.length < PAGE_SIZE) {
        hasMore = false;
      }

      data.items.forEach(r => {
        const div = document.createElement("div");
        div.className =
          "bg-white p-5 shadow border border-pink-100 rounded-none";

        const safeName = escapeHTML(r.name);
        const safeComment = escapeHTML(r.comment);

        div.innerHTML = `
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-pink-700">${safeName}</h4>
            <span class="text-yellow-400 text-lg">${renderStars(r.rating)}</span>
          </div>

          <p class="text-gray-700 text-sm whitespace-pre-line">${safeComment}</p>

          ${
            r.image_url
              ? `<div class="mt-3">
                   <img src="${r.image_url}"
                        class="w-full max-h-64 object-cover border rounded-none"
                        loading="lazy" />
                 </div>`
              : ""
          }

          <p class="text-xs text-gray-400 mt-2">
            ${new Date(r.created_at).toLocaleDateString()}
          </p>
        `;

        list.appendChild(div);
      });

      currentPage++;
    } catch (err) {
      console.error("Erreur chargement avis", err);
    }

    loading = false;
  }

  /* ===============================
     LOAD MORE BUTTON
  =============================== */
  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.textContent = "Voir plus";
  loadMoreBtn.className =
    "mx-auto mt-8 block bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-none shadow";

  loadMoreBtn.onclick = () => loadReviews();

  list.after(loadMoreBtn);

  /* ===============================
     SUBMIT REVIEW (WITH IMAGE)
  =============================== */
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.querySelector("input[type='text']").value.trim();
      const comment = form.querySelector("textarea").value.trim();
      const fileInput = form.querySelector("input[type='file']");
      const file = fileInput?.files?.[0];

      if (!name || !comment || selectedRating === 0) {
        alert("Veuillez remplir le nom, le message et la note.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("comment", comment);
      formData.append("rating", selectedRating);

      if (file) formData.append("image", file);

      try {
        const res = await fetch(
          "https://academy-api.tessysbeautyy.workers.dev/reviews",
          {
            method: "POST",
            body: formData
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");

        form.reset();
        selectedRating = 0;
        stars.forEach(s => s.classList.remove("text-yellow-400"));

        popup.classList.add("hidden");

        await loadReviews(true);
      } catch (err) {
        alert("Erreur lors de l’envoi de l’avis.");
      }
    });
  }

  // INIT
  loadReviews();
});
