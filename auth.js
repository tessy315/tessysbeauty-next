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
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      status.className = "text-sm text-center text-red-600";
      status.textContent = data.error || "Erreur de connexion";
      return;
    }

    // ✅ Pending user (payment not validated yet)
    if (data.status === "pending") {
      status.className = "text-sm text-center text-yellow-600";
      status.textContent = "Compte créé. Paiement en attente de validation.";
      return;
    }

    // ✅ Save session (simple version)
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status);

    // Redirect to dashboard
    window.location.href = "/courses/dashboard.html";

  } catch (err) {
    status.className = "text-sm text-center text-red-600";
    status.textContent = "Erreur réseau. Veuillez réessayer.";
  }
});

async function handleGoogleLogin(response) {
  try {
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_token: response.credential
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Google login failed");
      return;
    }

    // Save session
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status);

    if (data.status === "pending") {
      alert("Compte créé. Paiement requis pour activer.");
      return;
    }

    // Redirect after success
    window.location.href = "/courses/dashboard.html";

  } catch (err) {
    alert("Erreur réseau Google login");
  }
}

