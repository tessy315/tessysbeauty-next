const API = "https://academy-api.tessysbeautyy.workers.dev";
const stripe = Stripe("pk_test_51Siyg82M8ztFJb4DGPu0jlzKyMqrKhy7g4ZE2NyDamob7CuBxjGFmAKOYlEZUvfwoLJVIBDVAPU2fTx2DcBcbt1000CtQLaTLL");

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

if (!courseId) {
  document.getElementById("message").textContent = "Cours manquant.";
  throw new Error("Missing course id");
}

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}

let elements;

async function initPayment() {
  const res = await fetch(`${API}/payment/stripe`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ course_id: courseId })
  });

  const data = await res.json();

  if (!data.clientSecret) {
    document.getElementById("message").textContent =
      data.error || "Impossible de démarrer le paiement.";
    return;
  }

  elements = stripe.elements({ clientSecret: data.clientSecret });

  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
}

document.getElementById("payment-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/dashboard.html`
    }
  });

  if (error) {
    document.getElementById("message").textContent = error.message;
  }
});

initPayment();
