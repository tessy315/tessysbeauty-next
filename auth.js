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

    // ✅ Save session regardless of status
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status); // pending / active
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    // Redirect to dashboard
    window.location.href = "/courses/dashboard.html";

  } catch (err) {
    status.className = "text-sm text-center text-red-600";
    status.textContent = "Erreur réseau. Veuillez réessayer.";
  }
});

// Google Login
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

    // ✅ Save session regardless of status
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status);
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    // Redirect to dashboard
    window.location.href = "/courses/dashboard.html";

  } catch (err) {
    alert("Erreur réseau Google login");
  }
}
