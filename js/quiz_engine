async function submitQuiz() {
  clearInterval(countdown);

  score = quiz.reduce((acc, q, i) =>
    acc + (answers[i] === q.answer ? 1 : 0), 0);

  const percent = Math.round((score / quiz.length) * 100);
  const passed = percent >= 70;

  const userId = localStorage.getItem("user_id");

  // 🔥 SEND RESULT TO WORKER
  await fetch("https://quiz.tessysbeautyy.workers.dev/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userId}`
    },
    body: JSON.stringify({
      quiz_id: "final-makeup-exam",
      score: percent,
      passed
    })
  });

  // UI RESULT (UNCHANGED)
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div class="bg-white p-8 rounded-none shadow-sm text-center max-w-md w-full">
        <h1 class="text-2xl font-bold mb-4">
          ${passed ? "🎉 Félicitations !" : "❌ Échec"}
        </h1>

        <p class="text-gray-700 mb-2">
          Score : <strong>${percent}%</strong>
        </p>

        <p class="mb-6 text-gray-600">
          ${passed
            ? "Vous avez réussi l’examen."
            : "Vous n’avez pas atteint le score requis (70%)."}
        </p>

        ${passed ? `
          <a href="/courses/dashboard.html"
             class="inline-block bg-pink-600 text-white px-6 py-2 rounded-none hover:bg-pink-700">
            Accéder au certificat
          </a>
        ` : `
          <a href="/courses/quiz.html"
             class="inline-block bg-gray-400 text-white px-6 py-2 rounded-none">
            Recommencer
          </a>
        `}
      </div>
    </div>
  `;
}
