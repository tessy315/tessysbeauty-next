/* =====================================================
   Courses.js — Inscription + Checkout Flow
===================================================== */

const API = "https://academy-api.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("academy_user_id");

/* =========================
   Handle Enrollment
========================= */
async function handleEnroll(courseId) {
  // User pa konekte → redirect signup
  if (!userId) {
    localStorage.setItem("pending_course_id", courseId);
    alert("Veuillez créer un compte ou vous connecter pour vous inscrire à ce cours.");
    return window.location.href = "/courses/signup.html";
  }

  try {
    // Poste enrollment
    const res = await fetch(`${API}/enroll`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + userId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ course_id: courseId })
    });

    const data = await res.json();

    // Si enrollment deja exist → check si paiement fini
    if (res.status === 409) {
      // Backend renvoie data.status (pending | active)
      if (data.status === "active") {
        alert("Vous êtes déjà inscrit et paiement effectué. Redirection vers le cours.");
        return window.location.href = `/courses/lesson.html?course=${courseId}`;
      } else if (data.status === "pending") {
        alert("Vous avez déjà commencé l'inscription mais le paiement est en attente.");
        return window.location.href = `/api/checkout.html?course=${courseId}`;
      }
    }

    if (!res.ok) {
      alert(data.error || "Erreur d'inscription");
      return;
    }

    // Nouvo inscription → redirect checkout
    window.location.href = `/api/checkout.html?course=${courseId}`;

  } catch (err) {
    console.error(err);
    alert("Erreur réseau, veuillez réessayer.");
  }
}

/* =========================
   Add Event Listeners To Enroll Buttons
========================= */
function bindEnrollButtons() {
  document.querySelectorAll(".enroll-btn").forEach(btn => {
    const courseId = btn.dataset.courseId;
    btn.onclick = () => handleEnroll(courseId);
  });
}

/* =========================
   Auto-Enroll After Signup/Login
========================= */
function autoEnrollPendingCourse() {
  const pendingCourse = localStorage.getItem("pending_course_id");
  if (pendingCourse && userId) {
    localStorage.removeItem("pending_course_id"); // clear pending
    handleEnroll(pendingCourse);
  }
}

/* =========================
   Initialize Courses Page
========================= */
document.addEventListener("DOMContentLoaded", () => {
  bindEnrollButtons();
  autoEnrollPendingCourse();
});
