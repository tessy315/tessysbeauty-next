/* ==========================
   READ URL PARAM
   ========================== */
const params = new URLSearchParams(window.location.search);
const certFromUrl = params.get("cert_id"); // use cert_id param from Worker

if (certFromUrl) {
  document.getElementById("certInput").value = certFromUrl;
  verify(certFromUrl);
}

/* ==========================
   VERIFY ACTION
   ========================== */
document.getElementById("verifyBtn").onclick = () => {
  const id = document.getElementById("certInput").value.trim();
  if (!id) return alert("Veuillez entrer un identifiant de certificat.");
  verify(id);
};

/* ==========================
   FETCH FROM WORKER
   ========================== */
async function verify(id) {
  const resultBox = document.getElementById("result");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<p class="text-gray-600">Vérification en cours...</p>`;

  try {
    const res = await fetch(
      `https://certificate.tessysbeautyy.workers.dev/verify?cert_id=${encodeURIComponent(id)}`
    );

    if (res.status === 404) {
      resultBox.innerHTML = `
        <div class="text-red-600 font-semibold">
          ❌ Certificat non valide ou introuvable
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Vérifiez l’identifiant du certificat.
        </p>
      `;
      return;
    }

    const data = await res.json();

    if (!data.valid) {
      resultBox.innerHTML = `
        <div class="text-red-600 font-semibold">
          ❌ Certificat non valide
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Vérifiez l’identifiant du certificat.
        </p>
      `;
      return;
    }

    // DISPLAY REAL DATA
    resultBox.innerHTML = `
      <div class="text-green-700 font-semibold mb-2">
        ✅ Certificat valide
      </div>

      <ul class="text-sm text-gray-700 space-y-1">
        <li><strong>Nom :</strong> ${data.student}</li>
        <li><strong>Formation :</strong> ${data.course}</li>
        <li><strong>Date d’émission :</strong> ${new Date(data.issued_at).toLocaleDateString("fr-FR")}</li>
        <li><strong>ID Certificat :</strong> ${data.cert_id}</li>
      </ul>
    `;
  } catch (err) {
    resultBox.innerHTML = `
      <div class="text-red-600 font-semibold">
        ❌ Erreur lors de la vérification
      </div>
      <p class="text-sm text-gray-600 mt-2">
        ${err.message}
      </p>
    `;
  }
}

