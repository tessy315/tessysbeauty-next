document.getElementById("academy-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const msg = document.getElementById("form-msg");

  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // ✅ Password match
  if (password !== confirmPassword) {
    msg.className = "text-sm text-center text-red-600";
    msg.textContent = "Les mots de passe ne correspondent pas.";
    msg.classList.remove("hidden");
    return;
  }

  // ✅ Strong password validation
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  // At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special
  if (!passwordPattern.test(password)) {
    msg.className = "text-sm text-center text-red-600";
    msg.textContent = "Mot de passe faible. Il doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.";
    msg.classList.remove("hidden");
    return;
  }

  msg.className = "text-sm text-center text-gray-600";
  msg.textContent = "Inscription en cours...";
  msg.classList.remove("hidden");

  const payload = {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    password
  };

  try {
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "tBA3R8v2kL9qXz5mN0yH"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.className = "text-sm text-center text-red-600";
      msg.textContent = data.error || "Erreur lors de l’inscription";
      return;
    }

    msg.className = "text-sm text-center text-green-600";
    msg.textContent = "Compte créé avec succès ✅";

    setTimeout(() => window.location.href = "/courses/auth.html", 1200);

  } catch (err) {
    msg.className = "text-sm text-center text-red-600";
    msg.textContent = "Erreur réseau. Réessayez.";
  }
});
