document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("statusMsg");
  status.className = "text-sm text-center text-gray-600";
  status.textContent = "Connexion en cours...";
  status.classList.remove("hidden");

  const payload = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch(
      "https://academy-api.tessysbeautyy.workers.dev/courses/auth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      status.className = "text-sm text-center text-red-600";
      status.textContent = data.error || "Erreur de connexion";
      return;
    }

    // ✅ Save session locally
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status); // pending / active
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    // 🔹 Redirect logic for pending course
    const pendingCourse = localStorage.getItem("pending_course_id");
    if (pendingCourse) {
      localStorage.removeItem("pending_course_id");
      window.location.href = `/courses/checkout.html?course=${pendingCourse}`;
    } else {
      window.location.href = "/courses/dashboard.html";
    }

  } catch (err) {
    console.error(err);
    status.className = "text-sm text-center text-red-600";
    status.textContent = "Erreur réseau. Veuillez réessayer.";
  }
});

// ==========================
// Google Login
// ==========================
async function handleGoogleLogin(response) {
  try {
    const res = await fetch(
      "https://academy-api.tessysbeautyy.workers.dev/courses/auth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Google login failed");
      return;
    }

    // ✅ Save session locally
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status);
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    // 🔹 Redirect logic for pending course
    const pendingCourse = localStorage.getItem("pending_course_id");
    if (pendingCourse) {
      localStorage.removeItem("pending_course_id");
      window.location.href = `/courses/checkout.html?course=${pendingCourse}`;
    } else {
      window.location.href = "/courses/dashboard.html";
    }

  } catch (err) {
    console.error(err);
    alert("Erreur réseau Google login");
  }
}
