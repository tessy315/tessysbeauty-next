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
document.querySelectorAll("#logoutBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  });
});

// ------------------------------------
// FETCH DASHBOARD DATA
// ------------------------------------
async function fetchDashboard() {
  try {
    const res = await fetch(DASHBOARD_API, {
      headers: { "Authorization": "Bearer " + userId }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();

    renderUser(data.user);
    renderCourses(data.courses, data.user.status);
    renderExams(data.courses, data.user.status);
    renderCertificates(data.courses, data.user.status);
    updateNavStatus(data.user.status);
  } catch (err) {
    console.error(err);
    alert("Session expirée. Veuillez vous reconnecter.");
    localStorage.clear();
    window.location.href = "/courses/auth.html";
  }
}

fetchDashboard();

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
        Payer maintenant
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

    const lessonDisabled = status === "pending" ? "pointer-events-none opacity-50 cursor-not-allowed" : "";

    const courseCard = document.createElement("div");
    courseCard.className = `bg-white p-6 shadow-sm ${lessonDisabled}`;

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
         class="block mt-4 w-full text-center bg-pink-600 text-white py-2 rounded-none hover:bg-pink-700 transition ${lessonDisabled}">
        Continuer le cours
      </a>
    `;

    container.appendChild(courseCard);
  });

  renderGlobalProgress(totalLessons, completedLessons);
}

// ------------------------------------
// RENDER EXAMS
// ------------------------------------
function renderExams(courses, status) {
  const examSection = document.querySelector("#examsSection") || document.querySelector("section.mb-12:nth-of-type(2)");
  examSection.innerHTML = `
    <h2 class="text-xl font-bold mb-4">📝 Examens</h2>
  `;

  courses.forEach(course => {
    const progressPercent = course.lessons.length === 0 ? 0 : Math.round((course.lessons.filter(l => l.completed).length / course.lessons.length) * 100);
    const canStartExam = status === "active" && progressPercent === 100;

    const btnClass = canStartExam
      ? "bg-pink-600 text-white px-4 py-2 hover:bg-pink-700"
      : "bg-gray-300 text-gray-500 px-4 py-2 cursor-not-allowed";

    const div = document.createElement("div");
    div.className = "bg-white p-6 shadow flex justify-between items-center mb-4";

    div.innerHTML = `
      <div>
        <p class="font-semibold">Examen – ${course.title}</p>
        <p class="text-sm text-gray-500">${course.lessons.length} leçons • ${course.lessons.length * 3} minutes approx.</p>
      </div>
      <button data-exam="${course.course_id}" class="${btnClass}" ${!canStartExam ? "disabled" : ""}>
        Commencer
      </button>
    `;

    examSection.appendChild(div);
  });

  // Add button events
  document.querySelectorAll("[data-exam]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      window.location.href = `/courses/quiz.html?course=${btn.dataset.exam}`;
    });
  });
}

// ------------------------------------
// RENDER CERTIFICATES
// ------------------------------------
function renderCertificates(courses, status) {
  const certSection = document.querySelector("#certificatesSection") || document.querySelector("section:nth-of-type(3)");
  certSection.innerHTML = `<h2 class="text-xl font-bold mb-4">🎓 Certificats</h2>`;

  courses.forEach(course => {
    const cert = course.certificate;
    const canDownload = status === "active" && cert.issued;

    const btnClass = canDownload
      ? "mt-4 bg-green-100 text-green-600 underline px-4 py-2"
      : "mt-4 bg-gray-300 text-gray-500 px-4 py-2 cursor-not-allowed";

    const div = document.createElement("div");
    div.className = "bg-white p-6 shadow mb-4";

    div.innerHTML = `
      <p class="text-gray-600">Certificat pour ${course.title}</p>
      <a href="/certificate.html?id=${cert.certificate_id || ''}" class="${btnClass}">${canDownload ? "Télécharger le certificat" : "Indisponible"}</a>
    `;

    certSection.appendChild(div);
  });
}

// ------------------------------------
// GLOBAL PROGRESS
// ------------------------------------
function renderGlobalProgress(total, completed) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("progressPercent").textContent = percent;
}

// ------------------------------------
// UPDATE NAV BUTTONS BASED ON STATUS
// ------------------------------------
function updateNavStatus(status) {
  const navItems = document.querySelectorAll("nav a, nav button");
  navItems.forEach(item => {
    if (item.textContent.includes("Mes Cours") || item.textContent.includes("Module") || item.textContent.includes("Examen")) {
      if (status === "pending") {
        item.classList.add("opacity-50", "pointer-events-none", "cursor-not-allowed");
      } else {
        item.classList.remove("opacity-50", "pointer-events-none", "cursor-not-allowed");
      }
    }
  });
}
