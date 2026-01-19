/**************************************
 * Tessys LMS — Dashboard (Cours + Exam + Certificat)
 **************************************/

const API = "https://academy-api.tessysbeautyy.workers.dev";

document.addEventListener("DOMContentLoaded", async () => {

  const userId = localStorage.getItem("academy_user_id");
  if (!userId) return window.location.href = "/courses/auth.html";

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  };

  // Fetch dashboard data depuis backend
  let payload;
  try {
    const res = await fetch(`${API}/courses/dashboard`, {
      headers: { Authorization: "Bearer " + userId }
    });
    if (!res.ok) throw new Error("Unauthorized");
    payload = await res.json();
  } catch (err) {
    console.error(err);
    localStorage.clear();
    return window.location.href = "/courses/auth.html";
  }

  renderUser(payload.user);
  renderProgress(payload.user.progress_percent || 0);
  renderCourses(payload.courses);
});

/* =========================
   Render User Name
========================= */
function renderUser(user) {
  const nameEl = document.getElementById("studentName");
  if (nameEl && user.name) {
    const firstName = user.name.trim().split(" ")[0];
    nameEl.textContent = `${firstName}`;
  }
}

/* =========================
   Render Global Progress
========================= */
function renderProgress(percent) {
  const progressEl = document.getElementById("progressPercent");
  if (progressEl) progressEl.textContent = percent;
}

/* =========================
   Render Courses + Exam + Certificat
========================= */
function renderCourses(courses) {
  const container = document.getElementById("coursesGrid");
  if (!container) return;
  container.innerHTML = "";

  if (!courses || courses.length === 0) {
    container.innerHTML = `
      <div class="bg-yellow-50 border p-6 text-center">
        <p class="text-sm text-yellow-700">Vous n’êtes inscrit à aucun cours.</p>
        <button id="goCourses" class="mt-4 bg-pink-600 text-white px-4 py-2">
          S’inscrire à un cours
        </button>
      </div>
    `;
    document.getElementById("goCourses").onclick = () => {
      window.location.href = "/courses/index.html";
    };
    return;
  }

  courses.forEach(course => {
    const {
      course_id,
      title,
      enrollment_status,
      progress_percent = 0,
      exam_status = "locked",
      certificate_status = "locked"
    } = course;

    // Cours button
    const lessonBtn = enrollment_status === "active"
      ? `<button class="action-btn bg-green-600 text-white w-full mt-4 py-2" data-course="${course_id}">Commencer la leçon</button>`
      : `<button class="action-btn bg-orange-400 text-white w-full mt-4 py-2" data-pay="${course_id}">Paiement en attente</button>`;

    // Exam button
    const examBtn = exam_status === "available"
      ? `<button class="exam-btn bg-pink-600 text-white w-full mt-2 py-2" data-exam="${course_id}">Commencer l'examen</button>`
      : `<button class="exam-btn bg-gray-300 text-gray-500 w-full mt-2 py-2 cursor-not-allowed" disabled>Examen</button>`;

    // Certificat button
    const certBtn = (certificate_status === "available" || certificate_status === "issued")
      ? `<button class="cert-btn bg-green-100 text-green-600 w-full mt-2 py-2" data-cert="${course_id}">Télécharger le certificat</button>`
      : `<button class="cert-btn bg-gray-300 text-gray-500 w-full mt-2 py-2 cursor-not-allowed" disabled>Certificat</button>`;

    // Create card
    const card = document.createElement("div");
    card.className = "bg-white p-6 shadow-sm mb-6";
    card.innerHTML = `
      <h3 class="font-semibold text-lg">${title}</h3>
      <div class="mt-3">
        <div class="w-full bg-gray-200 h-2">
          <div class="bg-pink-500 h-2" style="width:${progress_percent}%"></div>
        </div>
        <p class="text-xs mt-1">${progress_percent}% complété</p>
      </div>
      ${lessonBtn}
      ${examBtn}
      ${certBtn}
    `;
    container.appendChild(card);
  });

  bindActions();
}

/* =========================
   Bind Actions (Navigation)
========================= */
function bindActions() {

  // Commencer leçon
  document.querySelectorAll("[data-course]").forEach(btn => {
    btn.onclick = () => {
      const courseId = btn.dataset.course;
      window.location.href = `/courses/lesson.html?course=${courseId}`;
    };
  });

  // Paiement pending → checkout
  document.querySelectorAll("[data-pay]").forEach(btn => {
    btn.onclick = () => {
      const courseId = btn.dataset.pay;
      window.location.href = `/api/checkout.html?course=${courseId}`;
    };
  });

  // Examen
  document.querySelectorAll("[data-exam]").forEach(btn => {
    btn.onclick = () => {
      const courseId = btn.dataset.exam;
      window.location.href = `/courses/quiz.html?course=${courseId}`;
    };
  });

  // Certificat
  document.querySelectorAll("[data-cert]").forEach(btn => {
    btn.onclick = () => {
      const courseId = btn.dataset.cert;
      window.location.href = `/verify.html?course=${courseId}`;
    };
  });
}
