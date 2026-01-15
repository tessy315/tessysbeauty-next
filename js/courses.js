/******************************************
 * Tessy’s Beauty Academy — courses.js
 * Enrollment + Signup Redirect Flow
 ******************************************/

// ------------------------------------------
// API BASE
// ------------------------------------------
const API = "https://academy-api.tessysbeautyy.workers.dev";

/* =========================
   SESSION HELPERS
========================= */
function getUserId() {
  const id = localStorage.getItem("academy_user_id");
  return id && id !== "null" ? id : null;
}

function getUserStatus() {
  return localStorage.getItem("academy_status");
}

function notify(message) {
  alert(message); // ou ka ranplase ak yon snackbar pita
}

/* =========================
   ENROLL FLOW
========================= */
function goToCheckout(courseId) {
  window.location.href = `/courses/checkout.html?course=${courseId}`;
}

/**
 * Main handler when a user clicks "S’inscrire"
 */
function handleEnrollClick(courseId) {
  const userId = getUserId();

  // 🧑‍🎓 Not logged in → save intention + redirect to signup
  if (!userId) {
    localStorage.setItem("pending_course_id", courseId);

    notify("Vous devez vous connecter ou créer un compte pour continuer.");

    setTimeout(() => {
      window.location.href = "/courses/signup.html";
    }, 300);

    return;
  }

  // ✔ Logged in → go to checkout
  goToCheckout(courseId);
}

/* =========================
   ATTACH EVENTS (STATIC HTML)
========================= */
function attachEnrollButtons() {
  const buttons = document.querySelectorAll(".enroll-btn");

  buttons.forEach(btn => {
    if (btn.dataset.bound === "true") return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
      const courseId = btn.dataset.courseId;
      if (!courseId) return;

      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = "Chargement...";

      handleEnrollClick(courseId);

      // restore button
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = oldText;
      }, 3000);
    });
  });
}

/* =========================
   (OPTIONAL) LOAD COURSES FROM API
   If you later want to generate cards dynamically.
========================= */
async function loadCoursesFromAPI() {
  try {
    const res = await fetch(`${API}/courses/index`);
    if (!res.ok) return;

    const courses = await res.json();
    const container = document.getElementById("coursesGrid") || document.getElementById("coursesContainer");
    if (!container) return;

    container.innerHTML = "";

    courses.forEach(c => {
      const card = document.createElement("div");
      card.className = "bg-white p-6 shadow-sm mb-6";

      card.innerHTML = `
        <h3 class="font-semibold text-lg text-gray-800">${c.title}</h3>
        <p class="text-sm text-gray-600 mt-2">${c.description || ""}</p>
        <p class="mt-2 font-semibold text-pink-600">$${c.price}</p>
        <button 
          class="enroll-btn w-full py-2 bg-pink-600 text-white hover:bg-pink-700 transition"
          data-course-id="${c.id}">
          S'inscrire
        </button>
      `;

      container.appendChild(card);
    });

    attachEnrollButtons();

  } catch (err) {
    console.error("Failed to load courses:", err);
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  attachEnrollButtons();

  // If you want dynamic loading:
  // loadCoursesFromAPI();
});
