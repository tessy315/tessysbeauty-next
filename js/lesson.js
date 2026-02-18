document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // ========= DOM ELEMENTS =========
  const lessonTitleEl = document.getElementById("lessonTitle");
  const lessonDescriptionEl = document.getElementById("lessonDescription");
  const videoIframe = document.getElementById("lessonVideo");
  const resourcesList = document.getElementById("lessonResources");

  const quizSection = document.getElementById("quizSection");
  const quizContainer = document.getElementById("quizContent");

  const progressBar = document.getElementById("progressBar");

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course") || "C1";

  try {
    const response = await fetch(`/api/courses/${courseId}/lessons`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur API");
    }

    const lessons = await response.json();

    if (!lessons || lessons.length === 0) {
      throw new Error("Aucune leçon trouvée");
    }

    // ========= PREND PREMIÈRE LEÇON =========
    const lesson = lessons[0];

    // ========= TITLE + DESCRIPTION =========
    lessonTitleEl.textContent = lesson.title || "Leçon";
    lessonDescriptionEl.textContent =
      lesson.description || "Description indisponible.";

    // ========= VIDEO =========
    let videoUrl = lesson.video_url || "";

    if (videoUrl.includes("/shorts/")) {
      videoUrl = `https://www.youtube.com/embed/${videoUrl.split("/shorts/")[1]}`;
    }

    if (videoUrl.includes("watch?v=")) {
      videoUrl = videoUrl.replace("watch?v=", "embed/");
    }

    if (videoUrl) {
      videoIframe.src = videoUrl;
    }

    // ========= RESSOURCES (PDF / LINKS) =========
    resourcesList.innerHTML = "";

    if (lesson.resources && lesson.resources.length > 0) {
      lesson.resources.forEach((res) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="${res.url}" target="_blank" class="text-pink-600 underline">
            ${res.title}
          </a>
        `;
        resourcesList.appendChild(li);
      });
    }

    // ========= QUIZ =========
    quizContainer.innerHTML = "";
    quizSection.classList.add("hidden");

    if (lesson.quiz && lesson.quiz.questions?.length > 0) {
      quizSection.classList.remove("hidden");

      lesson.quiz.questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("mb-4");

        questionDiv.innerHTML = `
          <p class="font-semibold mb-2">${index + 1}. ${q.question}</p>
          ${q.options
            .map(
              (opt, i) => `
            <label class="block mb-1">
              <input type="radio" name="question${index}" value="${i}" class="mr-2">
              ${opt}
            </label>
          `
            )
            .join("")}
        `;

        quizContainer.appendChild(questionDiv);
      });

      const submitBtn = document.createElement("button");
      submitBtn.textContent = "Valider le quiz";
      submitBtn.className =
        "mt-4 bg-pink-600 text-white px-4 py-2 rounded";

      submitBtn.addEventListener("click", () => {
        let score = 0;

        lesson.quiz.questions.forEach((q, index) => {
          const selected = document.querySelector(
            `input[name="question${index}"]:checked`
          );

          if (selected && parseInt(selected.value) === q.correct_answer) {
            score++;
          }
        });

        alert(
          `Score: ${score}/${lesson.quiz.questions.length}`
        );

        if (score === lesson.quiz.questions.length) {
          updateProgress(100);
        }
      });

      quizContainer.appendChild(submitBtn);
    }

    // ========= PROGRESS BAR =========
    function updateProgress(value) {
      progressBar.style.width = value + "%";
      progressBar.textContent = value + "%";
    }

    // Progress 30% lè video chaje
    videoIframe.addEventListener("load", () => {
      updateProgress(30);
    });

  } catch (error) {
    console.error("Erreur:", error.message);
    alert(error.message);
  }
});
