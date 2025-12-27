
const API = "https://academy-api.tessysbeautyy.workers.dev";

async function completeEnrollment(courseId) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/courses/login.html";
    return;
  }

  const res = await fetch(`${API}/enroll`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ course_id: courseId })
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = "/dashboard";
  } else {
    alert(data.error || "Enrollment failed");
  }
}
