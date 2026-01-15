// auth.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("statusMsg");
  status.textContent = "Connexion en cours...";
  status.className = "text-sm text-center text-gray-600";

  try {
    const res = await fetch(
      "https://academy-api.tessysbeautyy.workers.dev/courses/auth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value
        })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status);
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    const pendingCourse = localStorage.getItem("pending_course_id");

    if (pendingCourse) {
      localStorage.removeItem("pending_course_id");
      window.location.href = `/courses/checkout.html?course=${pendingCourse}`;
    } else {
      window.location.href = "/courses/dashboard.html";
    }

  } catch {
    status.textContent = "Identifiants incorrects.";
    status.className = "text-sm text-center text-red-600";
  }
});
