function $(id) { return document.getElementById(id); }
function on(el, event, fn) { if (el) el.addEventListener(event, fn); }

document.addEventListener("DOMContentLoaded", async () => {

  const steps = ["step-1", "step-2", "step-3"];
  const progressBar = $("progress-bar");

  function showStep(step) {
    steps.forEach((id, index) => {
      const el = $(id);
      if (!el) return;
      el.classList.toggle("hidden", index + 1 !== step);
    });

    const percent = step === 1 ? 16.66 :
                    step === 2 ? 33.33 :
                    step === 3 ? 66.66 : 100;
    if (progressBar) progressBar.style.width = percent + "%";
  }

  let startStep = 1;
  const stepParam = new URLSearchParams(location.search).get("step");
  if (stepParam === "2" || localStorage.getItem("formSubmitted") === "1") {
    startStep = 2;
  }
  showStep(startStep);

  // NAVIGATION
  on($("step2-prev"), "click", () => showStep(1));
  on($("step2-next"), "click", () => showStep(3));
  on($("step3-prev"), "click", () => showStep(2));

  // STEP 1 – FORM
  on($("open-form-btn"), "click", () => {
    window.location.href = "/formulaire.html"; // SAME TAB
  });

  // ----------------------------------------
  // STEP 2 – PAYMENT
  // ----------------------------------------
  const payMoncashBtn = $("pay-moncash");
  const payStripeBtn = $("pay-stripe");
  const paymentMsg = $("payment-msg");
  const dashboardLink = $("dashboard-link");

  function showPaymentMessage(msg, type="info") {
    if (!paymentMsg) return;
    paymentMsg.textContent = msg;
    paymentMsg.className = "";
    paymentMsg.classList.add(
      type === "success" ? "text-green-500" :
      type === "error" ? "text-red-500" :
      "text-gray-600"
    );
  }

  // MonCash sandbox simulation
  on(payMoncashBtn, "click", async () => {
    showPaymentMessage("Redirection vers MonCash Sandbox…", "info");
    try {
      await new Promise(res => setTimeout(res, 1500)); // simulate API call
      localStorage.setItem("paymentStatus", "moncash_success");
      showPaymentMessage("Paiement MonCash confirmé ✅", "success");
      dashboardLink.classList.remove("hidden");
      showStep(3);
    } catch(err) {
      showPaymentMessage("Erreur MonCash ❌", "error");
      console.error(err);
    }
  });

  // Stripe sandbox simulation
  on(payStripeBtn, "click", async () => {
    showPaymentMessage("Redirection vers Stripe Sandbox…", "info");
    try {
      await new Promise(res => setTimeout(res, 1500)); // simulate API call
      localStorage.setItem("paymentStatus", "stripe_success");
      showPaymentMessage("Paiement Stripe confirmé ✅", "success");
      dashboardLink.classList.remove("hidden");
      showStep(3);
    } catch(err) {
      showPaymentMessage("Erreur Stripe ❌", "error");
      console.error(err);
    }
  });

  // Auto-show dashboard if payment already done
  if (localStorage.getItem("paymentStatus") === "moncash_success" ||
      localStorage.getItem("paymentStatus") === "stripe_success") {
    dashboardLink.classList.remove("hidden");
    showPaymentMessage("Paiement déjà confirmé, accès au tableau de bord ✅", "success");
    showStep(3);
  }

});

  // REVIEWS 
  const reviewForm = $("review-form");
  if (reviewForm) {
    on(reviewForm, "submit", e => {
      e.preventDefault();
      alert("Formulaire soumis ✅");
      reviewForm.reset();
      $("review-popup")?.classList.add("hidden");
    });
  }

});
