/**************************************
 * Tessy’s Beauty Academy — Dashboard
 **************************************/

const API = "https://academy-api.tessysbeautyy.workers.dev";

document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("academy_user_id");
  if (!userId) return redirectAuth();

  bindLogout();

  let payload;
  try {
    const res = await fetch(`${API}/courses/dashboard`, {
      headers: { Authorization: "Bearer " + userId }
    });

    if (!res.ok) throw new Error("Dashboard fetch error: " + res.status);

    payload = await res.json();
  } catch (e) {
    console.error("Dashboard fetch error:", e);
    showError("Impossible de charger vos données. Essayez plus tard.");
    return;
  }

  renderUser(payload.user);
  renderAccountStatus(payload.user);
  renderProgress(payload.user.progress_percent || 0);

  renderCourses(payload.courses || []);
  renderExams(payload.exams || []);
  renderCertificates(payload.certificates || []);
});

/* =========================
   Helpers
========================= */
function redirectAuth() {
  window.location.href = "/courses/auth.html";
}

function bindLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.onclick = () => {
      localStorage.clear();
      redirectAuth();
    };
  }
}

function showError(msg) {
  const grid = document.getElementById("coursesGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="bg-red-50 border p-6 text-center col-span-full">
        <p class="text-sm text-red-700">${msg}</p>
      </div>
    `;
  }
}

/* =========================
   Render User
========================= */
function renderUser(user) {
  const nameEl = document.getElementById("studentName");
  if (!nameEl) return;

  if (!user || !user.name) {
    nameEl.textContent = "Étudiant";
    return;
  }

  const parts = user.name.trim().split(/\s+/);
  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  nameEl.textContent = firstName;
}

/* =========================
   Account Status
========================= */
function renderAccountStatus(user) {
  const el = document.getElementById("accountStatus");
  if (!el) return;

  const active = user.status === "active";
  el.textContent = active ? "Actif" : "Suspendu";
  el.className =
    "text-lg font-semibold " +
    (active ? "text-green-600" : "text-red-600");
}

/* =========================
   Global Progress
========================= */
function renderProgress(percent) {
  const el = document.getElementById("progressPercent");
  if (el) el.textContent = percent + "%";
}

/* =========================
   Courses — Only enrolled courses
========================= */
function renderCourses(courses) {
  const grid = document.getElementById("coursesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!courses.length) {
    grid.innerHTML = `
      <div class="bg-yellow-50 border p-6 text-center col-span-full">
        <p class="text-sm text-yellow-700">
          Vous n’êtes inscrit à aucun cours.
        </p>
        <button id="goCourses" class="mt-4 bg-pink-600 text-white px-4 py-2">
          S’inscrire à un cours
        </button>
      </div>
    `;
    document.getElementById("goCourses").onclick = () =>
      (window.location.href = "/courses/index.html");
    return;
  }

  courses.forEach(course => {
    const enrollmentStatus = course.enrollment_status; // active | pending
    const progress = course.progress_percent || 0;

    let buttonText = "";
    let isClickable = false;

    if (enrollmentStatus === "active") {
      buttonText = progress === 0 ? "Commencer le cours" : "Continuer le cours";
      isClickable = true;
    } else if (enrollmentStatus === "pending") {
      buttonText = "Paiement en attente";
      isClickable = false;
    }

    const card = document.createElement("div");
    card.className =
      "block bg-white p-6 rounded-none shadow-sm hover:shadow-md transition cursor-pointer";

    card.innerHTML = `
      <h3 class="font-semibold text-lg text-gray-800">
        ${course.title}
      </h3>

      <p class="text-sm text-gray-600 mt-2">
        ${course.description || ""}
      </p>

      <div class="mt-4">
        <div class="w-full bg-gray-200 h-2 rounded-none">
          <div class="bg-pink-500 h-2 rounded-none" style="width:${progress}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          ${progress}% complété
        </p>
      </div>

      <div class="mt-4 text-center py-2 ${
        isClickable
          ? "bg-pink-600 text-white hover:bg-pink-700 cursor-pointer"
          : "bg-gray-300 text-gray-600 cursor-not-allowed"
      }">
        ${buttonText}
      </div>
    `;

    if (isClickable) {
      card.onclick = () =>
        (window.location.href =
          `/courses/lesson.html?course=${course.course_id}`);
    }

    grid.appendChild(card);
  });
}

/* =========================
   Exams
========================= */
function renderExams(exams = []) {
  const box = document.getElementById("examsContainer");
  if (!box) return;

  box.innerHTML = "";

  if (!exams.length) {
    box.innerHTML = `<p class="text-sm text-gray-500">Aucun examen disponible.</p>`;
    return;
  }

  exams.forEach(exam => {
    const unlocked = exam.payment_status === "paid";

    box.innerHTML += `
      <div class="bg-white p-6 shadow flex justify-between items-center mb-4">
        <div>
          <p class="font-semibold">${exam.title}</p>
          <p class="text-sm text-gray-500">
            ${exam.questions_count} questions • ${exam.duration_minutes} minutes
          </p>
        </div>

        <button
          ${unlocked ? "" : "disabled"}
          class="px-4 py-2 ${
            unlocked
              ? "bg-pink-600 text-white hover:bg-pink-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }"
          onclick="${
            unlocked
              ? `location.href='/courses/quiz.html?exam=${exam.exam_id}'`
              : ""
          }"
        >
          Commencer
        </button>
      </div>
    `;
  });
}

/* =========================
   Certificates
========================= */
function renderCertificates(certificates = []) {
  const box = document.getElementById("certificatesContainer");
  if (!box) return;

  box.innerHTML = "";

  if (!certificates.length) {
    box.innerHTML = `
      <div class="bg-white p-6 shadow">
        <p class="text-gray-600">
          Votre certificat sera disponible après réussite de l’examen.
        </p>
      </div>
    `;
    return;
  }

  certificates.forEach(cert => {
    box.innerHTML += `
      <div class="bg-white p-6 shadow mb-4">
        <p class="font-semibold">${cert.title}</p>
        <button
          class="mt-4 bg-green-600 text-white px-4 py-2 hover:bg-green-700"
          onclick="location.href='/verify.html?cert=${cert.certificate_id}'"
        >
          Télécharger le certificat
        </button>
      </div>
    `;
  });
}
