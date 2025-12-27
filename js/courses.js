const API = "https://academy-api.tessysbeautyy.workers.dev";

// TEMP auth storage (same pattern you already use)
function getUserId() {
  return localStorage.getItem("user_id");
}

// Attach enroll handlers
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("enroll-btn")) return;

  const courseId = e.target.dataset.courseId;
  const userId = getUserId();

  if (!userId) {
    window.location.href = "/login.html";
    return;
  }

  // redirect to payment
  window.location.href = `/payment.html?course=${courseId}`;
});

// Load courses dynamically (optional)
async function loadCourses() {
  try {
    const res = await fetch(`${API}/courses`);
    const courses = await res.json();

    console.log("Courses:", courses);
    // you can later render them dynamically
  } catch (e) {
    console.error("Failed to load courses");
  }
}

loadCourses();
