const API = "https://academy-api.tessysbeautyy.workers.dev";

// Stripe public key (SAFE to expose)
const stripe = Stripe("pk_test_51Siyg82M8ztFJb4DGPu0jlzKyMqrKhy7g4ZE2NyDamob7CuBxjGFmAKOYlEZUvfwoLJVIBDVAPU2fTx2DcBcbt1000CtQLaTLL");

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

document.getElementById("payBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/courses/auth.html";
    return;
  }

  try {
    document.getElementById("status").textContent = "Création du paiement...";

    const res = await fetch(`${API}/payment/stripe`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        course_id: courseId
      })
    });

    const data = await res.json();

    if (!data.clientSecret) {
      alert(data.error || "Erreur paiement");
      return;
    }

    const result = await stripe.confirmCardPayment(data.clientSecret);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    if (result.paymentIntent.status === "succeeded") {
      // enrollment happens on backend webhook
      window.location.href = "/dashboard";
    }

  } catch (err) {
    console.error(err);
    alert("Erreur paiement");
  }
});
