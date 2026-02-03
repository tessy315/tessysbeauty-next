import { COURSES_CATALOG } from "./courses-catalog.js";

const API = "https://academy-api.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("academy_user_id");

/* =========================
   Render Languages Badges
========================= */
function renderLanguages(languages = []) {
  return languages
    .map(
      l => `<span class="text-xs px-2 py-1 rounded-none ${
        l.primary ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700"
      }">
        ${l.code.toUpperCase()}
      </span>`
    )
    .join("");
}

/* =========================
   Render Capacity Badge
========================= */
function renderCapacity(format) {
  if (!format.capacity) return "";
  const remaining = format.capacity - format.booked;
  if (remaining <= 0) return `<span class="text-xs text-red-700 bg-red-100 px-2 py-1">Complet</span>`;
  return `<span class="text-xs text-green-700 bg-green-100 px-2 py-1">${remaining} places restantes</span>`;
}

/* =========================
   Render Formats Dropdown
========================= */
function renderFormats(course) {
  if (!course.formats) return "";

  return `
    <select id="format-${course.course_id}" class="w-full border border-gray-300 p-2 text-sm mb-2">
      <option value="">-- Choisissez un format --</option>
      ${Object.entries(course.formats)
        .map(([key, f]) => {
          const full = f.capacity && f.booked >= f.capacity;
          return `<option value="${key}" ${full ? "disabled" : ""}>
            ${f.label} - $${f.price} ${f.capacity ? `(${f.capacity - f.booked} places restantes)` : ""}
          </option>`;
        })
        .join("")}
    </select>
  `;
}

/* =========================
   Render Public Courses
========================= */
function renderPublicCourses() {
  const grid = document.getElementById("publicCoursesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  COURSES_CATALOG.forEach(course => {
    const card = document.createElement("div");
    card.className = "bg-white shadow-sm p-6 relative rounded-none";

    card.innerHTML = `
      <!-- Level badge -->
      <span class="absolute top-4 right-4 text-xs 
        bg-${course.level_color}-100 text-${course.level_color}-700 px-3 py-1 rounded-none">
        ${course.level}
      </span>

      <!-- Preview Image -->
      ${course.preview_image
        ? `<img src="${course.preview_image}" alt="${course.title}" class="w-full h-48 object-cover mb-4 rounded-sm">`
        : ""}

      <!-- Languages -->
      <div class="flex gap-2 mb-3">${renderLanguages(course.languages)}</div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-800 mb-2">${course.title}</h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-4">${course.description}</p>

      <!-- Location warning placeholder -->
      <div id="location-warning-${course.course_id}"></div>

      <!-- Formats Dropdown -->
      ${renderFormats(course)}

      <!-- Features -->
      <ul class="text-sm text-gray-600 mb-4 space-y-1">
        ${course.features.map(f => `<li>✔️ ${f}</li>`).join("")}
      </ul>

      <!-- Preview video -->
      ${
        course.preview_video
          ? `<button class="text-sm text-pink-600 underline mb-3" data-video="${course.preview_video}">
               ▶️ Aperçu vidéo
             </button>`
          : ""
      }

      <!-- Enroll Button -->
      <button class="enroll-btn w-full px-4 py-2 rounded-none bg-pink-600 text-white hover:bg-pink-700"
        data-course-id="${course.course_id}">
        S’inscrire
      </button>
    `;

    grid.appendChild(card);
  });

  bindFormatChange();
  bindEnrollButtons();
  bindPreviewVideos();
}

/* =========================
   Show Location Warning if format presentiel/combo
========================= */
function bindFormatChange() {
  COURSES_CATALOG.forEach(course => {
    const select = document.getElementById(`format-${course.course_id}`);
    if (!select) return;

    select.onchange = () => {
      const warningDiv = document.getElementById(`location-warning-${course.course_id}`);
      warningDiv.innerHTML = "";

      const value = select.value;
      if ((value === "presentiel" || value === "combo") && course.location) {
        warningDiv.innerHTML = `
          <div class="mb-4 text-sm bg-yellow-50 border border-yellow-200 p-3">
            📍 <strong>Lieu :</strong> ${course.location}<br>
            <span class="text-xs text-red-600">
              ⚠️ Assurez-vous de pouvoir vous déplacer avant paiement.
            </span>
          </div>
        `;
      }
    };
  });
}

/* =========================
   Enrollment Logic
========================= */
async function handleEnroll(courseId) {
  const selectedFormat = document.querySelector(`select#format-${courseId}`)?.value;
  if (!selectedFormat) {
    alert("Veuillez choisir un format (En ligne / Présentiel / Combo)");
    return;
  }

  localStorage.setItem("selected_format", selectedFormat);

  if (!userId) {
    localStorage.setItem("pending_course_id", courseId);
    alert("Veuillez créer un compte ou vous connecter pour vous inscrire.");
    window.location.href = "/courses/signup.html";
    return;
  }

  try {
    const res = await fetch(`${API}/enroll`, {
      method: "POST",
      headers: { Authorization: "Bearer " + userId, "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId, format: selectedFormat })
    });

    const data = await res.json();

    if (res.status === 409) {
      if (data.status === "active") {
        alert("Vous êtes déjà inscrit. Redirection vers le cours.");
        window.location.href = `/courses/lesson.html?course=${courseId}`;
        return;
      }
      if (data.status === "pending") {
        alert("Paiement en attente.");
        window.location.href = `/api/checkout.html?course=${courseId}`;
        return;
      }
    }

    if (!res.ok) {
      alert(data.error || "Erreur d'inscription");
      return;
    }

    window.location.href = `/api/checkout.html?course=${courseId}`;
  } catch (err) {
    console.error(err);
    alert("Erreur réseau, veuillez réessayer.");
  }
}

/* =========================
   Bind Enroll Buttons
========================= */
function bindEnrollButtons() {
  document.querySelectorAll(".enroll-btn").forEach(btn => {
    btn.onclick = () => handleEnroll(btn.dataset.courseId);
  });
}

/* =========================
   Auto Enroll Pending
========================= */
function autoEnrollPendingCourse() {
  const pending = localStorage.getItem("pending_course_id");
  if (pending && userId) {
    localStorage.removeItem("pending_course_id");
    handleEnroll(pending);
  }
}

/* =========================
   Preview Video Modal
========================= */
function bindPreviewVideos() {
  document.querySelectorAll("[data-video]").forEach(btn => {
    btn.onclick = () => openVideo(btn.dataset.video);
  });
}

function openVideo(src) {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("previewVideo");
  if (!modal || !video) return;

  video.src = src;
  modal.classList.remove("hidden");
}

const closeBtn = document.getElementById("closeVideo");
if (closeBtn) {
  closeBtn.onclick = () => {
    const modal = document.getElementById("videoModal");
    const video = document.getElementById("previewVideo");
    video.pause();
    video.src = "";
    modal.classList.add("hidden");
  };
}

/* =========================
   Init Page
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderPublicCourses();
  autoEnrollPendingCourse();
});
