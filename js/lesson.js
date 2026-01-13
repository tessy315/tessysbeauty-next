const API = "https://academy-api.tessysbeautyy.workers.dev";
const authToken = localStorage.getItem("academy_user_id");

// DOM
const lessonTitleEl = document.querySelector("h1");
const lessonDescriptionEl = document.querySelector("p.text-gray-600");
const videoIframe = document.querySelector("iframe");
const resourcesList = document.querySelector("ul.space-y-2.text-pink-600");
const completeBtn = document.getElementById("completeLessonBtn");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const quizBlock = document.getElementById("quizBlock");
const quizContent = document.getElementById("quizContent");

// State
let allModules = [];
let currentLesson = null;

// course_id
const courseId = new URLSearchParams(window.location.search).get("course_id");

if (!authToken) {
  alert("Veuillez vous reconnecter");
  window.location.href = "/courses/auth.html";
}

// ---------- FETCH ----------
async function fetchCourse() {
  try {
    const res = await fetch(`${API}/courses/lessons?course_id=${courseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const lessons = await res.json();
    if (!Array.isArray(lessons)) throw new Error("Invalid lessons");

    allModules = transformModules(lessons);
    loadLesson(allModules[0].lessons[0], allModules[0]);
    updateSidebar();

  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement du cours");
  }
}

// ---------- TRANSFORM ----------
function transformModules(lessons) {
  const map = {};
  lessons.forEach(l => {
    if (!map[l.module_id]) {
      map[l.module_id] = {
        title: l.module_title,
        lessons: []
      };
    }
    map[l.module_id].lessons.push({
      lesson_id: l.lesson_id,
      title: l.lesson_title,
      description: l.description,
      contents: l.contents || [],
      completed: !!l.completed
    });
  });
  return Object.values(map);
}

// ---------- LOAD LESSON ----------
function loadLesson(lesson, module) {
  currentLesson = lesson;

  lessonTitleEl.textContent = `📌 ${module.title}`;
  lessonDescriptionEl.textContent = lesson.description || "";

  // Video
  const video = lesson.contents.find(c => c.type === "video");
  videoIframe.src = video ? video.url.replace("watch?v=", "embed/") : "";

  // Resources
  resourcesList.innerHTML = "";
  lesson.contents
    .filter(c => c.type === "pdf" || c.type === "material")
    .forEach(c => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${c.url}" target="_blank" class="hover:underline text-pink-600">
        ${c.type === "pdf" ? "📄 Support PDF" : "📦 Matériel recommandé"}
      </a>`;
      resourcesList.appendChild(li);
    });

  // Quiz
  const quiz = lesson.contents.find(c => c.type === "quiz");
  quizBlock.classList.toggle("hidden", !quiz);
  if (quiz) {
    quizContent.innerHTML = `<p class="text-gray-600">${quiz.title || "Quiz de validation"}</p>`;
  }

  updateProgress();
}

// ---------- SIDEBAR ----------
function updateSidebar() {
  const ul = document.querySelector("aside ul");
  ul.innerHTML = "";

  allModules.forEach(mod => {
    ul.innerHTML += `<li class="font-semibold text-pink-600">▶ ${mod.title}</li>`;
    mod.lessons.forEach(lesson => {
      const li = document.createElement("li");
      li.className = "pl-4 text-sm cursor-pointer hover:text-pink-600";
      li.textContent = lesson.title + (lesson.completed ? " ✅" : "");
      li.onclick = () => loadLesson(lesson, mod);
      ul.appendChild(li);
    });
  });
}

// ---------- PROGRESS ----------
function updateProgress() {
  const lessons = allModules.flatMap(m => m.lessons);
  const done = lessons.filter(l => l.completed).length;
  const percent = Math.round((done / lessons.length) * 100);
  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent;
}

// ---------- COMPLETE ----------
completeBtn.onclick = async () => {
  if (!currentLesson) return;

  await fetch(`${API}/courses/lessons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ lessonId: currentLesson.lesson_id })
  });

  currentLesson.completed = true;
  updateProgress();
  updateSidebar();
};

// ---------- START ----------
fetchCourse();
