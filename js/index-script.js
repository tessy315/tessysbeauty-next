// ========================
// HEADER DROPDOWN (DESKTOP)
// ========================
document.querySelectorAll(".dropdown").forEach(dropdown => {
  const button = dropdown.querySelector("button");
  const menu = dropdown.querySelector(".dropdown-menu");
  if(!button || !menu) return;

  let timeout;

  dropdown.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    dropdown.classList.add("open");
  });

  dropdown.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
      dropdown.classList.remove("open");
    }, 150);
  });
});

// ========================
// MOBILE MENU TOGGLE
// ========================
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if(menuBtn && mobileMenu){
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}


// ========================
// COUNTER ANIMATION
// ========================
const counters = document.querySelectorAll('.counter');
const speed = 200;

const animateCounters = () => {
  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 15);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
};

if (counters.length > 0) {
  const counterObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      counterObserver.disconnect();
    }
  });

  counterObserver.observe(counters[0]);
}

// ========================
// FADE-IN REVEAL
// ========================
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll(){
  reveals.forEach(el=>{
    const top = el.getBoundingClientRect().top;
    if(top < window.innerHeight - 100){
      el.classList.add("opacity-100","translate-y-0");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ========================
// PARTICLES HERO
// ========================
const particlesCanvas = document.getElementById("particles");

if (particlesCanvas) {
  const particlesCtx = particlesCanvas.getContext("2d");

  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;

  let particlesArray = [];

  class Particle{
    constructor(){
      this.x = Math.random()*particlesCanvas.width;
      this.y = Math.random()*particlesCanvas.height;
      this.size = Math.random()*2+1;
      this.speedY = Math.random()*0.5+0.2;
    }

    update(){
      this.y -= this.speedY;
      if(this.y < 0) this.y = particlesCanvas.height;
    }

    draw(){
      particlesCtx.fillStyle="rgba(236,72,153,0.4)";
      particlesCtx.beginPath();
      particlesCtx.arc(this.x,this.y,this.size,0,Math.PI*2);
      particlesCtx.fill();
    }
  }

  function initParticles(){
    for(let i=0;i<120;i++){
      particlesArray.push(new Particle());
    }
  }

  function animateParticles(){
    particlesCtx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height);
    particlesArray.forEach(p=>{
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();
}

// ========================
// TYPING EFFECT
// ========================
const subtitleText="Powered by Artificial Intelligence";
const typingEl=document.getElementById("typingSubtitle");
let i=0;

function typeSubtitle(callback){
  if (!typingEl) return;

  typingEl.parentElement.classList.add("opacity-100");

  function type(){
    if(i<subtitleText.length){
      typingEl.innerHTML+=subtitleText.charAt(i);
      i++;
      setTimeout(type,60);
    } else if(callback){
      callback();
    }
  }

  type();
}

const taglineEl=document.getElementById("tagline");

function showTagline(){
  if (taglineEl) taglineEl.classList.add("opacity-100");
}

window.addEventListener("load",()=>{
  const titleEl=document.querySelector("h1");
  if(titleEl) titleEl.style.opacity="1";

  setTimeout(()=>typeSubtitle(showTagline),500);
});

// ========================
// DROPDOWN MENU
// ========================
const dropdowns=document.querySelectorAll(".dropdown");

dropdowns.forEach(dropdown=>{
  let timeout;

  dropdown.addEventListener("mouseenter",()=>{
    clearTimeout(timeout);
    dropdown.classList.add("open");
  });

  dropdown.addEventListener("mouseleave",()=>{
    timeout=setTimeout(()=>{
      dropdown.classList.remove("open");
    },150);
  });
});

document.addEventListener("click",(e)=>{
  dropdowns.forEach(dropdown=>{
    if(!dropdown.contains(e.target)){
      dropdown.classList.remove("open");
    }
  });
});

// ========================
// PREMIUM SLIDER
// ========================
function initSlider(sliderTrackId, intervalTime=4000){

  const sliderTrack=document.getElementById(sliderTrackId);
  if (!sliderTrack) return;

  const progressBar=document.getElementById("sliderProgressBar");

  const totalCards=sliderTrack.children.length;

  let currentIndex=0;
  let interval;
  let isPaused=false;

  function getCardsPerView(){
    if(window.innerWidth<768) return 1;
    if(window.innerWidth<1024) return 2;
    return 3;
  }

  function startProgress(){
    if (!progressBar) return;

    progressBar.style.transition="none";
    progressBar.style.width="0%";

    setTimeout(()=>{
      progressBar.style.transition=`width ${intervalTime}ms linear`;
      progressBar.style.width="100%";
    },50);
  }

  function goToSlide(index){
    const cardsPerView=getCardsPerView();
    const totalSlides=Math.ceil(totalCards/cardsPerView);

    currentIndex=(index+totalSlides)%totalSlides;

    const cardWidth=sliderTrack.children[0].getBoundingClientRect().width;
    const moveX=currentIndex*cardWidth*cardsPerView;

    sliderTrack.style.transform=`translateX(-${moveX}px)`;

    startProgress();
  }

  function autoSlide(){
    if (!isPaused){
      goToSlide(currentIndex+1);
    }
  }

  function startAuto(){
    interval=setInterval(autoSlide,intervalTime);
  }

  function stopAuto(){
    clearInterval(interval);
  }

  // 🧠 PAUSE ON HOVER (FIX HEADER BUG)
  sliderTrack.addEventListener("mouseenter",()=>{
    isPaused=true;
    stopAuto();
  });

  sliderTrack.addEventListener("mouseleave",()=>{
    isPaused=false;
    startAuto();
    startProgress();
  });

  // INIT
  goToSlide(0);
  startAuto();

  window.addEventListener("resize",()=>goToSlide(0));
}

initSlider("aiSliderTrack",4000);
initSlider("academySliderTrack",4000);

// ========================
// ECOSYSTEM (SAFE)
// ========================
setTimeout(() => {

  const container = document.getElementById("circleContainer");
  const core = document.getElementById("coreAI");
  const cards = document.querySelectorAll(".eco-card");

  if (!container || !core || cards.length === 0) return;

  function positionArc() {
    const cRect = container.getBoundingClientRect();
    const coreRect = core.getBoundingClientRect();

    const centerX = coreRect.left - cRect.left + coreRect.width / 2;
    const centerY = coreRect.top - cRect.top + coreRect.height / 2;

    const radius = window.innerWidth < 768 ? 140 : 200;
    const angles = [-80, -25, 25, 80];

    cards.forEach((card, i) => {
      const angle = angles[i] * (Math.PI / 180);

      const x = centerX + radius * Math.cos(angle) - card.offsetWidth / 2;
      const y = centerY + radius * Math.sin(angle) - card.offsetHeight / 2;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
    });
  }

  positionArc();
  window.addEventListener("resize", positionArc);

}, 300);

// ========================
// MODAL (SAFE)
// ========================
setTimeout(() => {

  const modal = document.getElementById("ecoModal");
  if (!modal) return;

  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const closeBtn = document.getElementById("closeModal");

  const ecoData = {
    "AI LAB": "Advanced beauty diagnostics powered by AI.",
    "ACADEMY": "Learn beauty skills with structured courses.",
    "TESSYPRO": "Grow your freelance beauty business.",
    "SHOP": "Access curated beauty products."
  };

  document.querySelectorAll(".eco-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.innerText.trim();
      if (!ecoData[name]) return;

      modalTitle.innerText = name;
      modalText.innerText = ecoData[name];
      modal.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove("active");
  }

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("active");
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") modal.classList.remove("active");
  });

}, 400);
