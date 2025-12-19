document.getElementById("academy-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  const payload = {
    nom: form.nom.value,
    prenom: form.prenom.value,
    email: form.email.value,
    telephone: form.telephone.value
  };

  try {
    const res = await fetch("https://tessysbeauty-next.tessysbeautyy.workers.dev/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "admin2025_secret_key"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Erreur: " + (data.error || "Échec"));
      return;
    }

    alert("Inscription réussie ✅");
    window.location.href = "/academy.html?step=2";

  } catch (err) {
    console.error(err);
    alert("Erreur réseau (Failed to fetch)");
  }
});

