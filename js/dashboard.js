/**************************************
 * Tessys LMS — Fully Integrated Dashboard
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
document.querySelectorAll("#logoutBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  });
});

// ------------------------------------
// SELECTED COURSE (from index.html)
// ------------------------------------
const selectedCourseId = localStorage.getItem("selected_course");

// ------------------------------------
// FETCH DASHBOARD DATA
// ------------------------------------
fetch(DASHBOARD_API, {
      headers: {
        "Authorization": "Bearer " + userId,
        "Content-Type": "application/json"
      }
    });

  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {
    renderUser(data.user);
    renderCourses(data.courses, data.user.status);
    // Clear selected course after use
    localStorage.removeItem("selected_course");
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
  const course = localStorage.getItem("selected_course");
  if (!course) {
    alert("Cours manquant");
    return;
  }
  window.location.href = `/payment.html?course=${course}`;
});

  }

  // Grey out navigation links if pending
  if (user.status === "pending") {
    document.querySelectorAll(".nav-mes-cours a").forEach(nav => {
      nav.classList.add("pointer-events-none", "opacity-50", "cursor-not-allowed");
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

    const lessonDisabled = status === "pending" ? "opacity-50 cursor-not-allowed" : "";
    const quizDisabled = status === "pending" || progressPercent < 100
      ? "disabled bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-pink-600 text-white hover:bg-pink-700";

    const certDisabled = !(status === "active" && course.certificate?.issued)
      ? "disabled bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-100 text-green-600 underline";

    // Highlight selected course from index.html
    const isSelected = course.course_id === selectedCourseId;
    const enrollText = isSelected ? "Inscrit" : "Continuer le cours";
    const enrollDisabled = status === "pending" || isSelected ? "disabled" : "";

    const courseCard = document.createElement("div");
    courseCard.className = `bg-white p-6 shadow-sm mb-6`;
    courseCard.innerHTML = `
      <h3 class="font-semibold text-lg text-gray-800">${course.title}</h3>
      <p class="text-sm text-gray-600 mt-2">Progression du cours</p>
      <div class="mt-4">
        <div class="w-full bg-gray-200 h-2 rounded-none">
          <div class="bg-pink-500 h-2 rounded-none" style="width:${progressPercent}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">${progressPercent}% complété</p>
      </div>

      <button 
        class="mt-4 w-full py-2 rounded-none ${lessonDisabled} ${enrollDisabled} bg-pink-600 text-white hover:bg-pink-700 transition"
        ${enrollDisabled}
        data-course-id="${course.course_id}"
      >
        ${enrollText}
      </button>

      <button 
        data-exam="${course.course_id}"
        class="mt-2 w-full py-2 rounded-none transition ${quizDisabled}"
      >
        Commencer l'examen
      </button>

      <a 
        href="/certificate.html?id=${course.certificate?.certificate_id || ''}" 
        class="block mt-2 text-center py-2 ${certDisabled}"
      >
        🎓 Télécharger certificat
      </a>
    `;

    container.appendChild(courseCard);
  });

  renderGlobalProgress(totalLessons, completedLessons);

  // ADD ENROLL BUTTON EVENTS
  document.querySelectorAll("button[data-course-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const course = btn.dataset.courseId;
      if (btn.disabled) return;

      // Store as selected course in localStorage in case we redirect to payment
      localStorage.setItem("selected_course", course);
      window.location.href = "/api/payment.html";
    });
  });

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
