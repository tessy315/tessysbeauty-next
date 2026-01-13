const API = "https://academy-api.tessysbeautyy.workers.dev";
const authToken = localStorage.getItem("academy_user_id");

// 🔐 Sécurité
if (!authToken) {
  alert("Veuillez vous reconnecter");
  window.location.href = "/courses/auth.html";
}

/* =========================
   DOM ELEMENTS
========================= */
const lessonTitleEl = document.getElementById("lessonTitle");
const lessonDescriptionEl = document.getElementById("lessonDescription");
const videoIframe = document.getElementById("lessonVideo");
const resourcesList = document.getElementById("lessonResources");
const completeBtn = document.getElementById("completeLessonBtn");
const sidebar = document.getElementById("sidebarModules");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

const quizSection = document.getElementById("quizSection");
const quizContent = document.getElementById("quizContent");

/* =========================
   STATE
========================= */
let allModules = [];
let currentLesson = null;

/* =========================
   GET course_id
========================= */
const params = new URLSearchParams(window.location.search);
const courseId = params.get("course_id");

if (!courseId) {
  alert("Cours introuvable");
  window.location.href = "/courses/dashboard.html";
}

/* =========================
   FETCH LESSONS
========================= */
async function fetchCourse() {
  try {
    const res = await fetch(`${API}/courses/lessons?course_id=${courseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Format invalide :", data);
      return;
    }

    allModules = transformModules(data);

    if (allModules.length === 0) return;

    loadLesson(allModules[0].lessons[0], allModules[0]);
    renderSidebar();
    updateProgress();

  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement du cours");
  }
}

/* =========================
   TRANSFORM DATA
========================= */
function transformModules(rows) {
  const map = {};

  rows.forEach(r => {
    if (!map[r.module_id]) {
      map[r.module_id] = {
        id: r.module_id,
        title: r.module_title,
        lessons: []
      };
    }

    map[r.module_id].lessons.push({
      id: r.lesson_id,
      title: r.lesson_title,
      description: r.description || "",
      contents: r.contents || [],
      completed: !!r.completed
    });
  });

  return Object.values(map);
}

/* =========================
   LOAD LESSON
========================= */
function loadLesson(lesson, module) {
  currentLesson = lesson;

  lessonTitleEl.textContent = `📌 ${module.title}`;
  lessonDescriptionEl.textContent = lesson.description;

  renderVideo(lesson.contents);
  renderResources(lesson.contents);
  renderQuiz(lesson.contents);

  completeBtn.disabled = lesson.completed;
  completeBtn.classList.toggle("bg-gray-400", lesson.completed);
  completeBtn.classList.toggle("cursor-not-allowed", lesson.completed);
}

/* =========================
   VIDEO
========================= */
function renderVideo(contents) {
  const video = contents.find(c => c.type === "video");

  if (!video) {
    videoIframe.src = "";
    return;
  }

  let url = video.url;

  if (url.includes("watch?v=")) {
    url = url.replace("watch?v=", "embed/");
  }

  if (url.includes("/shorts/")) {
    const id = url.split("/shorts/")[1];
    url = `https://www.youtube.com/embed/${id}`;
  }

  videoIframe.src = url;
}

/* =========================
   RESSOURCES
========================= */
function renderResources(contents) {
  resourcesList.innerHTML = "";

  contents.forEach(c => {
    if (c.type === "pdf" || c.type === "material") {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = c.url;
      a.target = "_blank";
      a.className = "hover:underline text-pink-600";
      a.textContent =
        c.type === "pdf"
          ? "📄 Télécharger le support PDF"
          : "🧰 Liste du matériel recommandé";

      li.appendChild(a);
      resourcesList.appendChild(li);
    }
  });
}

/* =========================
   QUIZ
========================= */
function renderQuiz(contents) {
  quizContent.innerHTML = "";
  quizSection.classList.add("hidden");

  const quiz = contents.find(c => c.type === "quiz");
  if (!quiz || !Array.isArray(quiz.questions)) return;

  quizSection.classList.remove("hidden");

  quiz.questions.forEach((q, index) => {
    const block = document.createElement("div");

    block.innerHTML = `
      <p class="font-semibold">${index + 1}. ${q.question}</p>
      <div class="space-y-1 mt-2">
        ${q.options.map(opt => `
          <label class="flex items-center gap-2">
            <input type="radio" name="q${index}" value="${opt}">
            ${opt}
          </label>
        `).join("")}
      </div>
    `;

    quizContent.appendChild(block);
  });
}

/* =========================
   SIDEBAR
========================= */
function renderSidebar() {
  sidebar.innerHTML = "";

  allModules.forEach(mod => {
    const modLi = document.createElement("li");
    modLi.textContent = `▶ ${mod.title}`;
    modLi.className = "font-semibold text-pink-600";
    sidebar.appendChild(modLi);

    mod.lessons.forEach(lesson => {
      const li = document.createElement("li");
      li.textContent = lesson.title + (lesson.completed ? " ✅" : "");
      li.className = "pl-4 text-gray-700 cursor-pointer hover:text-pink-600";

      li.onclick = () => {
        loadLesson(lesson, mod);
        renderSidebar();
      };

      sidebar.appendChild(li);
    });
  });
}

/* =========================
   PROGRESS
========================= */
function updateProgress() {
  const lessons = allModules.flatMap(m => m.lessons);
  const completed = lessons.filter(l => l.completed).length;
  const percent = lessons.length
    ? Math.round((completed / lessons.length) * 100)
    : 0;

  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent;
}

/* =========================
   COMPLETE LESSON
========================= */
completeBtn.onclick = async () => {
  if (!currentLesson || currentLesson.completed) return;

  try {
    const res = await fetch(`${API}/courses/lessons/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ lessonId: currentLesson.id })
    });

    if (!res.ok) throw new Error("Update failed");

    currentLesson.completed = true;
    updateProgress();
    renderSidebar();

    alert("Leçon complétée ✅");

  } catch (err) {
    console.error(err);
    alert("Erreur lors de la validation");
  }
};

/* =========================
   INIT
========================= */
fetchCourse();
