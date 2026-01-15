const API = "https://academy-api.tessysbeautyy.workers.dev";
const stripe = Stripe("pk_test_51Siyg82M8ztFJb4DGPu0jlzKyMqrKhy7g4ZE2NyDamob7CuBxjGFmAKOYlEZUvfwoLJVIBDVAPU2fTx2DcBcbt1000CtQLaTLL");

const userId = localStorage.getItem("academy_user_id");
if (!userId) window.location.href = "/courses/auth.html";

const courseId = new URLSearchParams(window.location.search).get("course");
if (!courseId) throw new Error("Missing course");

let elements, paymentElement;

async function initPayment() {
  const res = await fetch(`${API}/payment/stripe`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + userId,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ course_id: courseId })
  });

  const data = await res.json();
  if (!data.clientSecret) throw new Error("Stripe init failed");

  elements = stripe.elements({ clientSecret: data.clientSecret });
  paymentElement = elements.create("payment"); // PaymentElement
  paymentElement.mount("#payment-element");
}

document.getElementById("payment-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${location.origin}/courses/dashboard.html`
    }
  });

  if (error) {
    document.getElementById("message").textContent = error.message;
  }
});

initPayment();
