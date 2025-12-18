// Later replaced by D1 / API
  const student = {
    name: "Étudiant",
    status: "Actif",
    progress: 40
  };

  document.getElementById("studentName").textContent = student.name;
  document.getElementById("accountStatus").textContent = student.status;
  document.getElementById("progressPercent").textContent = student.progress;

  document.getElementById("logoutBtn").onclick = () => {
    alert("Déconnexion (logique à connecter plus tard)");
  };
