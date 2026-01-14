const API = "https://academy-api.tessysbeautyy.workers.dev";
const authToken = localStorage.getItem("academy_user_id");

// ------------------- DOM Elements -------------------
const lessonTitleEl = document.querySelector("h1");
const lessonDescriptionEl = document.querySelector("p.text-gray-600");
const videoIframe = document.querySelector("iframe");
const resourcesList = document.querySelector("ul.space-y-2.text-pink-600");
const completeBtn = document.getElementById("completeLessonBtn");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const quizContainer = document.getElementById("quizContent");
const quizSection = document.getElementById("quizSection");

let allModules = [];
let currentLesson = null;

// ------------------- Get course_id -------------------
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course_id") || "C1";

if (!authToken) {
  alert("Veuillez vous reconnecter");
  window.location.href = "/courses/auth.html";
}

// ------------------- Fetch course + lessons -------------------
async function fetchCourse(courseId) {
  try {
    const res = await fetch(`${API}/courses/lessons?course_id=${courseId}`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data || !Array.isArray(data)) throw new Error("Aucune leçon trouvée");

    allModules = transformModules(data);
    if (allModules.length && allModules[0].lessons.length) {
      loadLesson(allModules[0].lessons[0], allModules[0]);
      updateSidebar();
    }
  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement du cours");
  }
}

// ------------------- Transform backend data -------------------
function transformModules(lessons) {
  const modulesMap = {};
  lessons.forEach(l => {
    if (!modulesMap[l.module_id]) {
      modulesMap[l.module_id] = {
        module_id: l.module_id,
        title: l.module_title,
        lessons: []
      };
    }

    let contents = [];
    try {
      contents = l.content ? JSON.parse(l.content) : [];
    } catch {}

    modulesMap[l.module_id].lessons.push({
      lesson_id: l.lesson_id,
      title: l.lesson_title,
      description: l.description,
      contents,
      completed: !!l.completed
    });
  });
  return Object.values(modulesMap);
}

// ------------------- Load lesson -------------------
function loadLesson(lesson, module) {
  currentLesson = lesson;
  lessonTitleEl.textContent = `📌 ${module.title}`;
  lessonDescriptionEl.textContent = lesson.description;

  // --- Vidéo ---
  const videoContent = lesson.contents.find(c => c.type === "video");
  if (videoContent) {
    let url = videoContent.url;
    if (url.includes("watch?v=")) url = url.replace("watch?v=", "embed/");
    if (url.includes("/shorts/")) url = `https://www.youtube.com/embed/${url.split("/shorts/")[1]}`;
    videoIframe.src = url;
  } else videoIframe.src = "";

  // --- PDF / Matériel ---
  resourcesList.innerHTML = "";
  lesson.contents.forEach(c => {
    if (c.type === "pdf" || c.type === "material") {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = c.url;
      a.target = "_blank";
      a.textContent = c.type === "pdf" ? "Télécharger le support PDF" : "Liste du matériel recommandé";
      a.classList.add("hover:underline", "text-pink-600");
      li.appendChild(a);
      resourcesList.appendChild(li);
    }
  });

  // --- Mini quiz sous la vidéo ---
  const quizQuestions = lesson.contents.find(c => c.type === "quiz")?.questions || [];
  renderQuiz(quizQuestions);

  updateProgress();
  updateCompleteBtn();
}

// ------------------- Render mini quiz -------------------
function renderQuiz(questions) {
  quizContainer.innerHTML = "";
  if (!questions.length) {
    quizSection.classList.add("hidden");
    return;
  }

  quizSection.classList.remove("hidden");

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "mb-4 bg-white p-4 rounded-none shadow-sm";

    const p = document.createElement("p");
    p.textContent = `${i + 1}. ${q.question}`;
    p.className = "font-medium";
    div.appendChild(p);

    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.className = "block cursor-pointer mt-1";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${i}`;
      input.value = opt;
      input.className = "mr-2";

      label.appendChild(input);
      label.append(opt);
      div.appendChild(label);
    });

    quizContainer.appendChild(div);
  });
}

// ------------------- Update progress -------------------
function updateProgress() {
  const completedLessons = allModules.flatMap(m => m.lessons).filter(l => l.completed).length;
  const totalLessons = allModules.flatMap(m => m.lessons).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent;
}

// ------------------- Sidebar + Terminer -------------------
function updateSidebar() {
  const sidebar = document.querySelector("aside ul");
  sidebar.innerHTML = "";

  let currentLessonCompleted = false;

  allModules.forEach(mod => {
    const liModule = document.createElement("li");
    liModule.className = "font-semibold text-pink-600 cursor-pointer";
    liModule.textContent = `▶ ${mod.title}`;
    sidebar.appendChild(liModule);

    mod.lessons.forEach(lesson => {
      const liLesson = document.createElement("li");
      liLesson.className = "text-gray-700 hover:text-pink-600 cursor-pointer pl-4 text-sm";
      liLesson.textContent = lesson.title + (lesson.completed ? " ✅" : "");
      liLesson.addEventListener("click", () => {
        loadLesson(lesson, mod);
      });
      sidebar.appendChild(liLesson);

      if (currentLesson && lesson.lesson_id === currentLesson.lesson_id) {
        currentLessonCompleted = lesson.completed;
      }
    });
  });

  updateCompleteBtn(currentLessonCompleted);
}

// ------------------- Update "Terminer" button -------------------
function updateCompleteBtn(disabled = false) {
  if (!currentLesson) return;
  const isCompleted = disabled || currentLesson.completed;
  completeBtn.disabled = isCompleted;
  completeBtn.classList.toggle("bg-gray-400", isCompleted);
  completeBtn.classList.toggle("cursor-not-allowed", isCompleted);
  completeBtn.classList.toggle("bg-pink-600", !isCompleted);
}

// ------------------- Complete lesson -------------------
completeBtn.addEventListener("click", async () => {
  if (!currentLesson) return;

  try {
    const res = await fetch(`${API}/courses/lessons/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ lessonId: currentLesson.lesson_id })
    });
    if (res.ok) {
      currentLesson.completed = true;
      updateProgress();
      updateSidebar();
      alert("Leçon marquée comme complétée ✅");
    } else {
      alert("Erreur lors de la mise à jour de la leçon");
    }
  } catch (err) {
    console.error(err);
  }
});

// ------------------- Init -------------------
fetchCourse(courseId);
