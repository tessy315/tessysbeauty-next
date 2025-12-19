const form = document.getElementById("academy-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nom: form.nom.value,
    prenom: form.prenom.value,
    email: form.email.value,
    telephone: form.telephone.value,
    adresse: form.adresse.value,
    sexe: form.sexe.value,
    profession: form.profession.value,
    experience: form.experience.value,
    source: Array.from(form.querySelectorAll("input[name='source[]']:checked")).map(i => i.value),
    attentes: form.attentes.value,
    engagement: form.engagement.checked
  };

  try {
    const res = await fetch("https://tessysbeauty-next.tessysbeautyy.workers.dev/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "admin2025_secret_key"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      localStorage.setItem("formSubmitted", "1");
      window.location.href = "/academy.html?step=2";
    } else {
      alert(result.error || "Une erreur est survenue.");
    }
  } catch (err) {
    alert("Erreur réseau: " + err.message);
  }
});
