// signup.js
document.getElementById("academy-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const msg = document.getElementById("form-msg");

  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailPattern.test(email)) {
    msg.textContent = "Adresse email invalide.";
    msg.className = "text-sm text-center text-red-600";
    return;
  }

  if (password !== confirmPassword) {
    msg.textContent = "Les mots de passe ne correspondent pas.";
    msg.className = "text-sm text-center text-red-600";
    return;
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordPattern.test(password)) {
    msg.textContent = "Mot de passe trop faible.";
    msg.className = "text-sm text-center text-red-600";
    return;
  }

  msg.textContent = "Création du compte...";
  msg.className = "text-sm text-center text-gray-600";

  try {
    const res = await fetch("https://academy-api.tessysbeautyy.workers.dev/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "tBA3R8v2kL9qXz5mN0yH"
      },
      body: JSON.stringify({
        nom: form.nom.value.trim(),
        prenom: form.prenom.value.trim(),
        email,
        telephone: form.telephone.value.trim(),
        password
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    msg.textContent = "Compte créé avec succès ✅";

    setTimeout(() => {
      window.location.href = "/courses/auth.html";
    }, 1000);

  } catch {
    msg.textContent = "Erreur lors de l’inscription.";
    msg.className = "text-sm text-center text-red-600";
  }
});
