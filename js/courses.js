const API = "https://academy-api.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("academy_user_id");
const userStatus = localStorage.getItem("academy_status"); // pending / active

// ------------------------------------
// ENROLL / S'INSCRIRE FLOW
// ------------------------------------
async function handleEnroll(courseId) {
  if (!userId) {
    // User pa konekte: sove course epi ale nan signup
    localStorage.setItem("pending_course_id", courseId);
    alert("Veuillez créer un compte ou vous connecter pour vous inscrire à ce cours.");
    window.location.href = "/signup.html";
    return;
  }

  try {
    const res = await fetch(`${API}/enroll`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + userId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ course_id: courseId })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Erreur d'inscription");
      return;
    }

    // Redirect to checkout
    localStorage.setItem("selected_course", courseId);
    window.location.href = `/courses/checkout.html?course=${courseId}`;

  } catch (err) {
    console.error(err);
    alert("Erreur réseau, veuillez réessayer.");
  }
}

// ------------------------------------
// RENDER COURSES
// ------------------------------------
function renderCourses(courses) {
  const container = document.getElementById("coursesGrid");
  container.innerHTML = "";

  courses.forEach(course => {
    const courseCard = document.createElement("div");
    courseCard.className = "bg-white shadow-sm p-6 relative rounded-none mb-6";
    courseCard.innerHTML = `
      <span class="absolute top-4 right-4 text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-none">
        ${course.level || "Débutant"}
      </span>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">${course.title}</h3>
      <p class="text-sm text-gray-600 mb-4">${course.description || ""}</p>

      <button
        class="enroll-btn w-full px-4 py-2 rounded-none bg-pink-600 text-white hover:bg-pink-700"
        data-course-id="${course.course_id}"
      >
        S’inscrire
      </button>
    `;

    container.appendChild(courseCard);
  });

  // ADD EVENT LISTENER
  document.querySelectorAll(".enroll-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const courseId = btn.dataset.courseId;
      handleEnroll(courseId);
    });
  });
}

// ------------------------------------
// FETCH COURSES
// ------------------------------------
async function fetchCourses() {
  try {
    const res = await fetch(`${API}/courses`);
    if (!res.ok) throw new Error("Impossible de récupérer les cours");

    const data = await res.json();
    renderCourses(data.courses || []);
  } catch (err) {
    console.error(err);
    const container = document.getElementById("coursesGrid");
    if (container) container.innerHTML = `<p class="text-red-600 text-center">Erreur de chargement des cours.</p>`;
  }
}

// ------------------------------------
// INIT
// ------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchCourses();
});
