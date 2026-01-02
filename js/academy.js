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

  // ----------------------------
  // OPEN / CLOSE MODAL
  // ----------------------------
  on(openBtn, "click", () => popup.classList.remove("hidden"));
  on(closeBtn, "click", () => popup.classList.add("hidden"));

  // ----------------------------
  // STAR RATING
  // ----------------------------
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);

      stars.forEach(s => {
        s.classList.toggle("text-yellow-400", Number(s.dataset.value) <= selectedRating);
        s.classList.toggle("text-gray-400", Number(s.dataset.value) > selectedRating);
      });
    });
  });

  // ----------------------------
  // LOAD REVIEWS
  // ----------------------------
  async function loadReviews() {
    try {
      const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/reviews");
      const data = await res.json();

      list.innerHTML = "";

      if (!data.length) {
        list.innerHTML = `<p class="text-center text-gray-500">Aucun avis pour le moment.</p>`;
        return;
      }

      data.forEach(r => {
        const starsHtml = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

        const div = document.createElement("div");
        div.className =
          "bg-white p-5 shadow rounded-none border border-pink-100";

        div.innerHTML = `
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-pink-700">${r.name}</h4>
            <span class="text-yellow-400 text-lg">${starsHtml}</span>
          </div>
          <p class="text-gray-700 text-sm">${r.comment}</p>
          <p class="text-xs text-gray-400 mt-2">${new Date(r.created_at).toLocaleDateString()}</p>
        `;

        list.appendChild(div);
      });
    } catch (e) {
      console.error("Erreur chargement avis", e);
    }
  }

  // ----------------------------
  // SUBMIT REVIEW
  // ----------------------------
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.querySelector("input[type='text']").value.trim();
      const comment = form.querySelector("textarea").value.trim();

      if (!name || !comment || selectedRating === 0) {
        alert("Veuillez remplir le nom, le commentaire et la note.");
        return;
      }

      const payload = {
        name,
        comment,
        rating: selectedRating
      };

      try {
        const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erreur");

        form.reset();
        selectedRating = 0;
        stars.forEach(s => s.classList.remove("text-yellow-400"));
        popup.classList.add("hidden");

        loadReviews();
      } catch (err) {
        alert("Erreur lors de l’envoi de l’avis");
      }
    });
  }

  loadReviews();
});
