<script>
const API_URL = "https://lesson.tessysbeautyy.workers.dev";
const userId = localStorage.getItem("userId");
const lessonId = new URLSearchParams(window.location.search).get("lesson_id");

if (!userId || !lessonId) {
  alert("Session invalide. Veuillez vous reconnecter.");
  window.location.href = "/courses/login.html";
}

// -----------------------------
// LOAD LESSON
// -----------------------------
async function loadLesson() {
  const res = await fetch(`${API_URL}?lesson_id=${lessonId}`, {
    headers: {
      "Authorization": `Bearer ${userId}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Erreur chargement leçon");
    return;
  }

  // Update UI (already mostly static for now)
  if (data.completed) {
    document.getElementById("completeLessonBtn").disabled = true;
    document.getElementById("completeLessonBtn").textContent = "Déjà complétée ✔️";
  }
}

loadLesson();

// -----------------------------
// COMPLETE LESSON
// -----------------------------
document.getElementById("completeLessonBtn").onclick = async () => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userId}`
    },
    body: JSON.stringify({ lesson_id: lessonId })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Leçon complétée ✔️");

    // UI update
    document.getElementById("completeLessonBtn").disabled = true;
    document.getElementById("completeLessonBtn").textContent = "Complétée ✔️";

    // Redirect back to dashboard
    setTimeout(() => {
      window.location.href = "/courses/dashboard.html";
    }, 1000);

  } else {
    alert(data.error || "Erreur sauvegarde");
  }
};
</script>
