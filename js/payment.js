const API = "https://academy-api.tessysbeautyy.workers.dev";

// ⚠️ clé publique TEST Stripe
const stripe = Stripe("pk_test_51Siyg82M8ztFJb4DGPu0jlzKyMqrKhy7g4ZE2NyDamob7CuBxjGFmAKOYlEZUvfwoLJVIBDVAPU2fTx2DcBcbt1000CtQLaTLL");

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

const messageEl = document.getElementById("message");

if (!courseId) {
  messageEl.textContent = "Cours manquant.";
  throw new Error("Missing course id");
}

const token = localStorage.getItem("academy_token");
if (!token) {
  window.location.href = "/courses/auth.html";
}

let elements;

async function initPayment() {
  try {
    const res = await fetch(`${API}/payment/stripe`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("academy_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ course_id: courseId })
    });

    const data = await res.json();

    if (!data.clientSecret) {
      messageEl.textContent = data.error || "Erreur lors de l'initialisation du paiement.";
      return;
    }

    elements = stripe.elements({
      clientSecret: data.clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#db2777",
          borderRadius: "6px",
          fontFamily: "Poppins, system-ui, sans-serif"
        }
      }
    });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

  } catch (err) {
    messageEl.textContent = "Erreur réseau ou Stripe indisponible.";
    console.error(err);
  }
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
    messageEl.textContent = error.message;
  }
});

initPayment();
