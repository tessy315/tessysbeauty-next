/**************************************
 * Tessys LMS — Fully Integrated Dashboard
 **************************************/

const API = "https://academy-api.tessysbeautyy.workers.dev";

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     AUTH CHECK
  ========================= */
  const userId = localStorage.getItem("academy_user_id");
  if (!userId) {
    alert("Session expirée. Veuillez vous reconnecter.");
    window.location.href = "/courses/auth.html";
    return;
  }

  /* =========================
     LOGOUT
  ========================= */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/courses/auth.html";
    });
  }

  /* =========================
     FETCH DASHBOARD DATA
  ========================= */
  fetch(`${API}/courses/dashboard`, {
    headers: {
      "Authorization": "Bearer " + userId,
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {
    // RENDER USER
    renderUser(data.user);

    // RENDER COURSES
    renderCourses(data.courses, data.user.status);
  })
  .catch(() => {
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  });

  /* =========================
     RENDER USER STATUS
  ========================= */
  function renderUser(user) {
    const nameEl = document.getElementById("studentName");
    if (nameEl && user.name) {
      const firstName = user.name.trim().split(" ")[0];
      nameEl.textContent = `Bienvenue, ${firstName}`;
    }

    const statusEl = document.getElementById("accountStatus");
    if (!statusEl) return;

    if (user.status === "active") {
      statusEl.textContent = "Actif";
      statusEl.className = "text-lg font-semibold text-green-600";
    } else {
      statusEl.innerHTML = `
        En attente de paiement
        <button id="payNowBtn"
          class="ml-4 bg-pink-600 text-white px-3 py-1 text-sm hover:bg-pink-700">
          Payer maintenant
        </button>
      `;
      statusEl.className = "text-lg font-semibold text-orange-500";

      const payBtn = document.getElementById("payNowBtn");
      if (payBtn) {
        payBtn.addEventListener("click", () => {
          const selectedCourse = localStorage.getItem("selected_course");
          if (!selectedCourse) {
            alert("Aucun cours sélectionné");
            return;
          }
          window.location.href = `/api/checkout.html?course=${selectedCourse}`;
        });
      }
    }

    if (user.status === "pending") {
      document.querySelectorAll(".nav-mes-cours a").forEach(nav => {
        nav.classList.add("pointer-events-none", "opacity-50", "cursor-not-allowed");
      });
    }
  }

  /* =========================
     RENDER COURSES
  ========================= */
  function renderCourses(courses, status) {
    const container = document.getElementById("coursesGrid");
    if (!container) return;
    container.innerHTML = "";

    if (!courses || courses.length === 0) {
      container.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-300 p-6 text-center">
          <h3 class="text-lg font-semibold text-yellow-700">
            Aucun cours actif
          </h3>
          <p class="mt-2 text-sm text-yellow-600">
            Vous devez vous inscrire à un cours pour accéder aux leçons.
          </p>
          <a
            href="/courses/index.html"
            class="inline-block mt-4 bg-pink-600 text-white px-5 py-2 hover:bg-pink-700"
          >
            S’inscrire à un cours
          </a>
        </div>
      `;
      return;
    }

    const selectedCourseId = localStorage.getItem("selected_course") || null;

    let totalLessons = 0;
    let completedLessons = 0;

    courses.forEach(course => {
      const lessons = course.lessons || [];
      const completed = lessons.filter(l => l.completed).length;

      totalLessons += lessons.length;
      completedLessons += completed;

      const progressPercent = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);

      const lessonDisabled = status === "pending" ? "opacity-50 cursor-not-allowed" : "";
      const quizDisabled = (status === "pending" || progressPercent < 100)
        ? "disabled bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-pink-600 text-white hover:bg-pink-700";

      const certDisabled = !(status === "active" && course.certificate?.issued)
        ? "disabled bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-green-100 text-green-600 underline";

      const isSelected = course.course_id === selectedCourseId;
      const enrollText = isSelected ? "Inscrit" : "S’inscrire à ce cours";
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

    // ENROLL BUTTON EVENTS → redirige vers /courses/index.html?course_C1=...
    document.querySelectorAll("button[data-course-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const course = btn.dataset.courseId;
        if (btn.classList.contains("disabled")) return;

        localStorage.setItem("selected_course", course);
        window.location.href = `/courses/index.html?course_${course}=1`;
      });
    });

    // QUIZ BUTTON EVENTS
    document.querySelectorAll("[data-exam]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;
        const course = btn.dataset.exam;
        window.location.href = `/courses/quiz.html?course=${course}`;
      });
    });
  }

  /* =========================
     GLOBAL PROGRESS
  ========================= */
  function renderGlobalProgress(total, completed) {
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const el = document.getElementById("progressPercent");
    if (el) el.textContent = percent;
  }

});
