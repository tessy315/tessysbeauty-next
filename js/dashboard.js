/**************************************
 * Tessys LMS — Dashboard Logic
 **************************************/

const DASHBOARD_API = "https://academy-api.tessysbeautyy.workers.dev/courses/dashboard";

// ------------------------------------
// AUTH CHECK
// ------------------------------------
const userId = localStorage.getItem("academy_user_id");
const userStatus = localStorage.getItem("academy_status");

if (!userId || !userStatus) {
  alert("Session expirée. Veuillez vous reconnecter.");
  window.location.href = "/courses/auth.html";
}

// ------------------------------------
// LOGOUT
// ------------------------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  });
}

// ------------------------------------
// FETCH DASHBOARD DATA
// ------------------------------------
fetch(DASHBOARD_API, {
  headers: {
    "Authorization": "Bearer " + userId
  }
})
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {
    renderUser(data.user);
    renderCourses(data.courses, data.user.status);
  })
  .catch(err => {
    console.error(err);
    alert("Session expirée. Veuillez vous reconnecter.");
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  });

// ------------------------------------
// RENDER USER INFO
// ------------------------------------
function renderUser(user) {
  document.getElementById("studentName").textContent = user.name;
  const statusEl = document.getElementById("accountStatus");

  if (user.status === "active") {
    statusEl.textContent = "Actif";
    statusEl.className = "text-lg font-semibold text-green-600";
  } else {
    statusEl.innerHTML = `
      En attente de paiement
      <button id="payNowBtn" class="ml-4 bg-pink-600 text-white px-3 py-1 text-sm hover:bg-pink-700 transition">
        Pay Now
      </button>
    `;
    statusEl.className = "text-lg font-semibold text-orange-500";

    document.getElementById("payNowBtn").addEventListener("click", () => {
      window.location.href = "/courses/payment.html";
    });
  }
}

// ------------------------------------
// RENDER COURSES
// ------------------------------------
function renderCourses(courses, status) {
  const container = document.getElementById("coursesGrid");
  container.innerHTML = "";

  let totalLessons = 0;
  let completedLessons = 0;

  courses.forEach(course => {
    const lessons = course.lessons || [];
    const completed = lessons.filter(l => l.completed).length;

    totalLessons += lessons.length;
    completedLessons += completed;

    const progressPercent = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);

    const disabled = status === "pending" ? "pointer-events-none opacity-50" : "";
    const cursor = status === "pending" ? "cursor-not-allowed" : "cursor-pointer";

    const courseCard = document.createElement("div");
    courseCard.className = `bg-white p-6 shadow-sm ${disabled}`;

    courseCard.innerHTML = `
      <h3 class="font-semibold text-lg text-gray-800">${course.title}</h3>
      <p class="text-sm text-gray-600 mt-2">Progression du cours</p>
      <div class="mt-4">
        <div class="w-full bg-gray-200 h-2 rounded-none">
          <div class="bg-pink-500 h-2 rounded-none" style="width:${progressPercent}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">${progressPercent}% complété</p>
      </div>

      <a href="/courses/lesson.html?course=${course.course_id}"
         class="block mt-4 w-full text-center bg-pink-600 text-white py-2 rounded-none hover:bg-pink-700 transition ${cursor}">
        Continuer le cours
      </a>

      <button
        ${status === "pending" ? "disabled" : ""}
        data-exam="${course.course_id}"
        class="mt-2 w-full text-center py-2 ${progressPercent === 100 && status === 'active' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition rounded-none"
      >
        Commencer l'examen
      </button>

      ${
        course.certificate.issued && status === "active"
          ? `<a href="/certificate.html?id=${course.certificate.certificate_id}"
               class="block mt-2 text-center text-green-600 underline">
               🎓 Télécharger certificat
             </a>`
          : ""
      }
    `;

    container.appendChild(courseCard);
  });

  renderGlobalProgress(totalLessons, completedLessons);

  // ADD QUIZ BUTTON EVENTS
  document.querySelectorAll("[data-exam]").forEach(btn => {
    btn.addEventListener("click", () => {
      const course = btn.dataset.exam;
      if (btn.disabled) return;
      window.location.href = `/courses/quiz.html?course=${course}`;
    });
  });
}

// ------------------------------------
// GLOBAL PROGRESS
// ------------------------------------
function renderGlobalProgress(total, completed) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("progressPercent").textContent = percent;
}
