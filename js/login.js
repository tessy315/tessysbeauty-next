document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const status = document.getElementById("statusMsg");
  status.className = "text-sm text-center text-gray-600";
  status.textContent = "Connexion en cours...";
  status.classList.remove("hidden");

  const payload = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      status.className = "text-sm text-center text-red-600";
      status.textContent = data.message || "Erreur de connexion";
      return;
    }

    if (data.status === "pending") {
      status.className = "text-sm text-center text-yellow-600";
      status.textContent = "Paiement en attente de validation.";
      return;
    }

    // Save token (later switch to cookie)
    localStorage.setItem("academy_token", data.token);

    window.location.href = "/courses/dashboard.html";

  } catch (err) {
    status.className = "text-sm text-center text-red-600";
    status.textContent = "Erreur réseau.";
  }
});
