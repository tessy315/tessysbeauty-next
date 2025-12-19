// ----------------------------------------
// ACADEMY.JS - FULL AUTOMATED FLOW
// ----------------------------------------

function $(id) { return document.getElementById(id); }
function on(el, event, fn) { if (el) el.addEventListener(event, fn); }

document.addEventListener("DOMContentLoaded", async () => {

  // ----------------------------------------
  // STEP MANAGEMENT + PROGRESS BAR
  // ----------------------------------------
  const steps = ["step-1", "step-2", "step-3"];
  const progressBar = $("progress-bar");

  function showStep(step) {
    steps.forEach((id, index) => {
      const el = $(id);
      if (!el) return;
      if (index + 1 === step) el.classList.remove("hidden");
      else el.classList.add("hidden");
    });

    const percent = step === 1 ? 33.33 : step === 2 ? 66.66 : 100;
    if (progressBar) progressBar.style.width = percent + "%";
  }

  // Start step
  let startStep = 1;
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = urlParams.get("step");
  if (stepParam === "2" || localStorage.getItem("formSubmitted") === "1") startStep = 2;
  if (urlParams.get("payment") === "success") startStep = 3;

  showStep(startStep);

  // ----------------------------------------
  // STEP NAVIGATION
  // ----------------------------------------
  on($("step2-prev"), "click", () => showStep(1));

  // ----------------------------------------
  // STEP 1 - FORM SUBMISSION
  // ----------------------------------------
  const form = $("academy-form");
  if (form) {
    on(form, "submit", async (e) => {
      e.preventDefault();

      const formData = {
        nom: $("nom").value,
        prenom: $("prenom").value,
        adresse: $("adresse").value,
        email: $("email").value,
        sexe: $("sexe").value,
        telephone: $("telephone").value,
        experience: form.querySelector('input[name="experience"]:checked')?.value || "",
        source: Array.from(form.querySelectorAll('input[name="source[]"]:checked')).map(c => c.value),
        profession: $("profession").value,
        attentes: $("attentes").value,
        engagement: form.querySelector('input[name="engagement"]')?.checked || false
      };

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          localStorage.setItem("formSubmitted", "1");
          showStep(2);
        } else {
          alert("Erreur d'inscription. Réessayez.");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur.");
      }
    });
  }

  // ----------------------------------------
  // STEP 2 - PAYMENT
  // ----------------------------------------
  const payBtn = $("pay-btn");
  const paymentMsg = $("payment-msg");
  const dashboardLink = $("dashboard-link");

  if (payBtn) {
    on(payBtn, "click", async () => {
      paymentMsg.textContent = "Création de la session de paiement…";

      try {
        const res = await fetch("/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: $("email").value,
            courseId: "COURSE_001"
          })
        });

        const data = await res.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          paymentMsg.textContent = "Erreur: impossible de créer la session.";
        }
      } catch (err) {
        console.error(err);
        paymentMsg.textContent = "Erreur lors de la connexion au serveur.";
      }
    });
  }

  // ----------------------------------------
  // STEP 3 - COURSE / DASHBOARD ACCESS
  // ----------------------------------------
  if (urlParams.get("payment") === "success") {
    showStep(3);
    dashboardLink?.classList.remove("hidden");
    $("course-access-msg").textContent = "Paiement confirmé ✅ Vous pouvez accéder à vos cours.";
  }

});

  // ----------------------------------------
  // REVIEWS (Optionnel)
  // ----------------------------------------
  const reviewForm = $("review-form");
  if (reviewForm) {
    on(reviewForm, "submit", (e) => {
      e.preventDefault();
      alert("Formulaire soumis ✅");
      reviewForm.reset();
      $("review-popup")?.classList.add("hidden");
    });
  }

  on($("open-review-form"), "click", () => $("review-popup")?.classList.remove("hidden"));
  on($("close-popup"), "click", () => $("review-popup")?.classList.add("hidden"));

});
