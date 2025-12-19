const form = document.getElementById("academy-form");
const msg = document.getElementById("form-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {};
  new FormData(form).forEach((v, k) => data[k] = v);

  try {
    const res = await fetch("https://tessysbeauty-next.tessysbeautyy.workers.dev/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "admin2025_secret_key" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error(await res.text());

    msg.textContent = "Inscription réussie ✅ Vous pouvez maintenant procéder au paiement.";
    msg.classList.add("text-green-500");
    localStorage.setItem("formSubmitted", "1");
    window.location.href = "/academy.html?step=2"; // Go to payment step

  } catch(err) {
    msg.textContent = "Erreur lors de l'inscription ❌: " + err.message;
    msg.classList.add("text-red-500");
    console.error(err);
  }
});
