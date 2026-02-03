/* =====================================================
   Courses.js — Public Courses (FIXED VERSION)
===================================================== */

import { COURSES_CATALOG } from "./courses-catalog.js";

const API = "https://academy-api.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("academy_user_id");

/* =========================
   Languages
========================= */
function renderLanguages(languages = []) {
  return languages.map(l => `
    <span class="text-xs px-2 py-1 rounded-none ${
      l.primary ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700"
    }">
      ${l.code.toUpperCase()}
    </span>
  `).join("");
}

/* =========================
   Formats (SAFE FALLBACK)
========================= */
function renderFormats(course) {
  const formats = course.formats || {
    online: { label: "En ligne", price: 0 }
  };

  return Object.entries(formats).map(([key, f]) => `
    <label class="flex items-center justify-between border px-3 py-2 text-sm cursor-pointer">
      <span>${f.label}</span>
      <span class="font-semibold">${f.price ? `$${f.price}` : "Gratuit"}</span>
      <input type="radio" name="format-${course.course_id}" value="${key}">
    </label>
  `).join("");
}

/* =========================
   Public Courses Render
========================= */
function renderPublicCourses() {
  const grid = document.getElementById("publicCoursesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  COURSES_CATALOG.forEach(course => {
    const card = document.createElement("div");
    card.className = "bg-white shadow-sm p-6 relative rounded-none";

    card.innerHTML = `
      <span class="absolute top-4 right-4 text-xs 
        bg-${course.level_color}-100 
        text-${course.level_color}-700 
        px-3 py-1">
        ${course.level}
      </span>

      ${course.preview_image ? `
        <img src="${course.preview_image}"
             class="w-full h-40 object-cover mb-4"
             alt="${course.title}">
      ` : ""}

      <div class="flex gap-2 mb-3">
        ${renderLanguages(course.languages)}
      </div>

      <h3 class="text-lg font-semibold text-gray-800 mb-2">
        ${course.title}
      </h3>

      <p class="text-sm text-gray-600 mb-3">
        ${course.description}
      </p>

      <ul class="text-sm text-gray-600 mb-4 space-y-1">
        ${course.features.map(f => `<li>✔️ ${f}</li>`).join("")}
      </ul>

      ${
        course.location
          ? `<div class="mb-4 text-sm bg-yellow-50 border border-yellow-200 p-3">
               📍 <strong>Lieu :</strong> ${course.location}<br>
               <span class="text-xs text-red-600">
                 ⚠️ Assurez-vous de pouvoir vous déplacer avant paiement.
               </span>
             </div>`
          : ""
      }

      <div class="space-y-2 mb-4">
        ${renderFormats(course)}
      </div>

      <button
        class="enroll-btn w-full px-4 py-2 bg-pink-600 text-white hover:bg-pink-700"
        data-course-id="${course.course_id}">
        S’inscrire
      </button>
    `;

    grid.appendChild(card);
  });

  bindEnrollButtons();
}

/* =========================
   Enrollment
========================= */
async function handleEnroll(courseId) {
  const selectedFormat = document.querySelector(
    `input[name="format-${courseId}"]:checked`
  )?.value;

  if (!selectedFormat) {
    alert("Veuillez choisir un format avant de continuer.");
    return;
  }

  localStorage.setItem("selected_format", selectedFormat);

  if (!userId) {
    localStorage.setItem("pending_course_id", courseId);
    window.location.href = "/courses/signup.html";
    return;
  }

  const res = await fetch(`${API}/enroll`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + userId,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ course_id: courseId, format: selectedFormat })
  });

  if (res.ok) {
    window.location.href = `/api/checkout.html?course=${courseId}`;
  } else {
    alert("Erreur lors de l'inscription.");
  }
}

/* =========================
   Bind
========================= */
function bindEnrollButtons() {
  document.querySelectorAll(".enroll-btn").forEach(btn => {
    btn.onclick = () => handleEnroll(btn.dataset.courseId);
  });
}

/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", renderPublicCourses);
