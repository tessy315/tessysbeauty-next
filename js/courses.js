/**************************************
 * Tessys LMS — Courses Index
 * Enroll → Stripe Payment (Clean Flow)
 **************************************/

const API = "https://academy-api.tessysbeautyy.workers.dev";

/* =========================
   AUTH HELPERS
========================= */
function getUserId() {
  return localStorage.getItem("academy_user_id");
}

/* =========================
   ENROLL + PAY (SINGLE ENTRY)
========================= */
async function enrollAndPay(courseId) {
  const userId = getUserId();

  if (!userId) {
    window.location.href = "/courses/auth.html";
    return;
  }

  try {
    // 1️⃣ Create pending enrollment
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
      alert(err.error || "Erreur lors de l'inscription");
      return;
    }

    // Store selected course (dashboard fallback)
    localStorage.setItem("selected_course", courseId);

    // 2️⃣ Redirect to Stripe payment
    window.location.href = `/checkout.html?course=${courseId}`;

  } catch (err) {
    console.error(err);
    alert("Erreur réseau. Veuillez réessayer.");
  }
}

/* =========================
   LOAD COURSES
========================= */
async function loadCourses() {
  try {
    const res = await fetch(`${API}/courses/index`);
    if (!res.ok) return;

    const courses = await res.json();
    const container = document.getElementById("coursesGrid");
    container.innerHTML = "";

    courses.forEach(course => {
      const card = document.createElement("div");
      card.className = "bg-white p-6 shadow-sm mb-6";

      card.innerHTML = `
        <h3 class="font-semibold text-lg text-gray-800">${course.title}</h3>
        <p class="text-sm text-gray-600 mt-2">${course.description || ""}</p>
        <p class="mt-2 font-semibold text-pink-600">$${course.price}</p>

        <button
          class="enroll-btn mt-4 w-full py-2 bg-pink-600 text-white hover:bg-pink-700 transition"
          data-course-id="${course.id}"
        >
          S'inscrire
        </button>
      `;

      container.appendChild(card);
    });

    // Attach enroll events
    document.querySelectorAll(".enroll-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.disabled = true;
        btn.textContent = "Redirection...";
        enrollAndPay(btn.dataset.courseId);
      });
    });

  } catch (err) {
    console.error("Failed to load courses", err);
  }
}

loadCourses();
