(async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("Veuillez vous connecter.");
    location.href = "/courses/login.html";
    return;
  }

  const res = await fetch(
    "https://certificate.tessysbeautyy.workers.dev/certificate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userId}`
      },
      body: JSON.stringify({
        course_id: "maquillage-professionnel"
      })
    }
  );

  const data = await res.json();
  if (!data.cert_id) {
    alert("Certificat non disponible.");
    location.href = "/courses/dashboard.html";
    return;
  }

  document.getElementById("studentName").textContent =
    localStorage.getItem("student_name") || "Étudiant(e)";

  document.getElementById("certId").textContent = data.cert_id;
  document.getElementById("date").textContent =
    new Date().toLocaleDateString("fr-FR");
})();

