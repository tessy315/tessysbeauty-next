const API = "https://academy-api.tessysbeautyy.workers.dev";

// Get logged user
function getUserId() {
  return localStorage.getItem("user_id");
}

// Handle enroll button clicks
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".enroll-btn");
  if (!btn) return;

  const courseId = btn.dataset.courseId;
  const userId = getUserId();

  // Not logged in → login first
  if (!userId) {
    window.location.href = "/courses/auth.html";
    return;
  }

  // Redirect to payment page
  window.location.href = `/payment.html?course=${encodeURIComponent(courseId)}`;
});


// OPTIONAL — load courses dynamically later
async function loadCourses() {
  try {
    const res = await fetch(`${API}/courses`);
    if (!res.ok) return;

    const courses = await res.json();
    console.log("Courses:", courses);

    // You can render cards later here
  } catch (err) {
    console.error("Failed to load courses", err);
  }
}

loadCourses();
