const API = "https://academy-api.tessysbeautyy.workers.dev";
const authToken = localStorage.getItem("academy_user_id"); // Bearer token

// Elements DOM
const lessonTitleEl = document.querySelector("h1");
const lessonDescriptionEl = document.querySelector("p.text-gray-600");
const videoIframe = document.querySelector("iframe");
const resourcesList = document.querySelector("ul.space-y-2.text-pink-600");
const completeBtn = document.getElementById("completeLessonBtn");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

// Sidebar dynamique
let allModules = [];
let currentLesson = null;

// ----------- Get course_id from URL ----------- 
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course_id") || "C1"; // default to C1

// ----------- Fetch course + lessons ----------- 
async function fetchCourse(courseId) {
  try {
    const res = await fetch(`${API}/courses/lessons?course_id=${courseId}`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data || data.length === 0) return;

    // Transform backend data to modules + lessons
    allModules = transformModules(data);

    // Affiche première leçon par défaut
    loadLesson(allModules[0].lessons[0], allModules[0]);

    // Sidebar
    updateSidebar();
  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement du cours");
  }
}

// Transform backend data into modules with lessons
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
    modulesMap[l.module_id].lessons.push({
      lesson_id: l.lesson_id,
      title: l.lesson_title,
      description: l.description,
      contents: l.contents || [],
      completed: !!l.completed
    });
  });
  return Object.values(modulesMap);
}

// ----------- Load lesson ----------- 
function loadLesson(lesson, module) {
  currentLesson = lesson;
  lessonTitleEl.textContent = `📌 ${module.title}`;
  lessonDescriptionEl.textContent = lesson.description;

  // Vidéo YouTube
  const videoContent = lesson.contents.find(c => c.type === "video");
  if (videoContent) {
    const embedUrl = videoContent.url.replace("watch?v=", "embed/");
    videoIframe.src = embedUrl;
  }

  // PDF / Material
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

  updateProgress();
}

// ----------- Update progress ----------- 
function updateProgress() {
  const completedLessons = allModules.flatMap(m => m.lessons).filter(l => l.completed).length;
  const totalLessons = allModules.flatMap(m => m.lessons).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent;
}

// ----------- Update sidebar + gestion bouton Terminer ----------- 
function updateSidebar() {
  const sidebar = document.querySelector("aside ul");
  sidebar.innerHTML = "";

  let currentLessonCompleted = false;

  allModules.forEach(mod => {
    // Module title
    const liModule = document.createElement("li");
    liModule.className = "font-semibold text-pink-600 cursor-pointer";
    liModule.textContent = `▶ ${mod.title}`;
    sidebar.appendChild(liModule);

    // Lessons
    mod.lessons.forEach(lesson => {
      const liLesson = document.createElement("li");
      liLesson.className = "text-gray-700 hover:text-pink-600 cursor-pointer pl-4 text-sm";
      liLesson.textContent = lesson.title + (lesson.completed ? " ✅" : "");
      liLesson.addEventListener("click", () => {
        loadLesson(lesson, mod);
        // Desab bouton si deja fini
        completeBtn.disabled = lesson.completed;
        completeBtn.classList.toggle("bg-gray-400", lesson.completed);
        completeBtn.classList.toggle("cursor-not-allowed", lesson.completed);
        completeBtn.classList.toggle("bg-pink-600", !lesson.completed);
      });
      sidebar.appendChild(liLesson);

      // Si lesson loaded se menm sa ki fini
      if (currentLesson && lesson.lesson_id === currentLesson.lesson_id) {
        currentLessonCompleted = lesson.completed;
      }
    });
  });

  // Bouton "Terminer" selon progression
  if (currentLesson) {
    completeBtn.disabled = currentLessonCompleted;
    completeBtn.classList.toggle("bg-gray-400", currentLessonCompleted);
    completeBtn.classList.toggle("cursor-not-allowed", currentLessonCompleted);
    completeBtn.classList.toggle("bg-pink-600", !currentLessonCompleted);
  }
}

// ----------- Complete lesson ----------- 
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

// ----------- Launch ----------- 
fetchCourse(courseId);
