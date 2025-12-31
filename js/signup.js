document.getElementById("academy-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const msg = document.getElementById("form-msg");

  msg.classList.remove("hidden");
  msg.textContent = "Inscription en cours...";

  const payload = {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim()
  };

  try {
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev", {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "admin2025_secret_key"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Erreur lors de l’inscription";
      msg.className = "text-sm text-center text-red-600";
      return;
    }

    msg.className = "text-sm text-center text-green-600";
    msg.textContent = "Compte créé avec succès ✅";

    setTimeout(() => {
      window.location.href = "/academy.html";
    }, 1200);

  } catch (err) {
    msg.className = "text-sm text-center text-red-600";
    msg.textContent = "Erreur réseau. Réessayez.";
  }
});
