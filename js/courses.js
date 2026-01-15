/* =====================================================
   Courses.js
===================================================== */

const API = "https://academy-api.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("academy_user_id");
const userStatus = localStorage.getItem("academy_status"); // pending / active

// ========================================
// ENROLL / S'INSCRIRE FLOW
// ========================================
async function handleEnroll(courseId) {
  if (!userId) {
    // User pa konekte: sove course epi ale nan signup
    localStorage.setItem("pending_course_id", courseId);
    alert("Veuillez créer un compte ou vous connecter pour vous inscrire à ce cours.");
    window.location.href = "/courses/signup.html";
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

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur d'inscription");
      return;
    }

    // ✅ Save selected course & redirect to checkout
    localStorage.setItem("selected_course", courseId);
    window.location.href = `/api/checkout.html?course=${courseId}`;

  } catch (err) {
    console.error(err);
    alert("Erreur réseau, veuillez réessayer.");
  }
}

// ========================================
// ADD EVENT LISTENER TO STATIC ENROLL BUTTONS
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".enroll-btn");

  buttons.forEach(btn => {
    const courseId = btn.dataset.courseId;
    btn.addEventListener("click", () => handleEnroll(courseId));
  });

  // ========================================
  // AUTO-ENROLL FOR PENDING COURSE (AFTER SIGNUP/LOGIN)
  // ========================================
  const pendingCourse = localStorage.getItem("pending_course_id");
  if (pendingCourse && userId) {
    localStorage.removeItem("pending_course_id"); // clear pending
    handleEnroll(pendingCourse);
  }
});
