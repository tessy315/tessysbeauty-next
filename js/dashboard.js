/**************************************
 * Tessys LMS — Dashboard Logic
 **************************************/

const DASHBOARD_API ="https://academy-api.tessysbeautyy.workers.dev/courses/dashboard";

// ------------------------------------
// AUTH CHECK
// ------------------------------------
const token = localStorage.getItem("tessys_token");

if (!token) {
  window.location.href = "/auth.html";
}

// ------------------------------------
// LOGOUT
// ------------------------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("tessys_token");
    window.location.href = "/.html";
  });
}

// ------------------------------------
// FETCH DASHBOARD DATA
// ------------------------------------
fetch(DASHBOARD_API, {
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(res => {
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
})
.then(data => {
  renderUser(data.user);
  renderCourses(data.courses);
})
.catch(err => {
  console.error(err);
  alert("Session expirée. Veuillez vous reconnecter.");
  localStorage.removeItem("tessys_token");
  window.location.href = "/auth.html";
});

// ------------------------------------
// RENDER USER INFO
// ------------------------------------
function renderUser(user) {
  document.getElementById("studentName").textContent = user.name;
  document.getElementById("accountStatus").textContent =
    user.status === "active" ? "Actif" : "En attente";

  document.getElementById("accountStatus").className =
    user.status === "active"
      ? "text-lg font-semibold text-green-600"
      : "text-lg font-semibold text-orange-500";
}

// ------------------------------------
// RENDER COURSES
// ------------------------------------
function renderCourses(courses) {
  const container = document.querySelector(".grid");
  container.innerHTML = "";

  let totalLessons = 0;
  let completedLessons = 0;

  courses.forEach(course => {
    course.lessons.forEach(l => {
      totalLessons++;
      if (l.completed) completedLessons++;
    });

    const progress =
      course.lessons.length === 0
        ? 0
        : Math.round(
            (course.lessons.filter(l => l.completed).length /
              course.lessons.length) * 100
          );

    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-none shadow-sm";

    card.innerHTML = `
      <h3 class="font-semibold text-lg text-gray-800">
        ${course.title}
      </h3>

      <p class="text-sm text-gray-600 mt-2">
        Progression du cours
      </p>

      <div class="mt-4">
        <div class="w-full bg-gray-200 h-2 rounded-none">
          <div class="bg-pink-500 h-2 rounded-none" style="width:${progress}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">${progress}% complété</p>
      </div>

      <a href="/lesson.html?course=${course.course_id}"
         class="block mt-4 w-full text-center bg-pink-600 text-white py-2 rounded-none hover:bg-pink-700 transition">
        Continuer le cours
      </a>

      ${
        course.certificate.issued
          ? `<a href="/certificate.html?id=${course.certificate.certificate_id}"
               class="block mt-2 text-center text-green-600 underline">
               🎓 Télécharger certificat
             </a>`
          : ""
      }
    `;

    container.appendChild(card);
  });

  renderGlobalProgress(totalLessons, completedLessons);
}

// ------------------------------------
// GLOBAL PROGRESS
// ------------------------------------
function renderGlobalProgress(total, completed) {
  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progressPercent").textContent = percent;
}
