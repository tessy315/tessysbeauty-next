document.getElementById("academy-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const msg = document.getElementById("form-msg");

  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // ✅ Validate email
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailPattern.test(email)) {
    msg.textContent = "Adresse email invalide.";
    msg.className = "text-sm text-center text-red-600";
    msg.classList.remove("hidden");
    return;
  }

  // ✅ Passwords match
  if (password !== confirmPassword) {
    msg.textContent = "Les mots de passe ne correspondent pas.";
    msg.className = "text-sm text-center text-red-600";
    msg.classList.remove("hidden");
    return;
  }

  // ✅ Strong password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordPattern.test(password)) {
    msg.textContent = "Mot de passe trop faible (min 8 caractères, majuscule, chiffre, symbole).";
    msg.className = "text-sm text-center text-red-600";
    msg.classList.remove("hidden");
    return;
  }

  msg.textContent = "Création du compte...";
  msg.className = "text-sm text-center text-gray-600";
  msg.classList.remove("hidden");

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

    if (res.status === 409) {
      // Email déjà utilisé
      msg.innerHTML = `Cette adresse email est déjà utilisée. <a href="/courses/auth.html" class="underline text-pink-600">Cliquez ici pour vous connecter</a>.`;
      msg.className = "text-sm text-center text-orange-500";
      return;
    }

    if (!res.ok) throw new Error(data.error || "Erreur lors de l’inscription.");

    // ✅ Save user session locally
    localStorage.setItem("academy_user_id", data.id);
    localStorage.setItem("academy_status", data.status); // pending / active
    localStorage.setItem("academy_name", data.nom || "Étudiant");

    msg.textContent = "Compte créé avec succès ✅";
    msg.className = "text-sm text-center text-green-600";

    // ✅ Redirect logic for pending course enrollment
    const pendingCourse = localStorage.getItem("pending_course_id");
    if (pendingCourse) {
      localStorage.removeItem("pending_course_id");
      setTimeout(() => {
        window.location.href = `/api/checkout.html?course=${pendingCourse}`;
      }, 1200);
    } else {
      setTimeout(() => {
        window.location.href = "/courses/dashboard.html";
      }, 1200);
    }

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Erreur réseau lors de l’inscription.";
    msg.className = "text-sm text-center text-red-600";
  }
});
