function $(id) { return document.getElementById(id); }
function on(el, event, fn) { if (el) el.addEventListener(event, fn); }

document.addEventListener("DOMContentLoaded", async () => {

  
  // REVIEWS 
  const reviewForm = $("review-form");
  if (reviewForm) {
    on(reviewForm, "submit", e => {
      e.preventDefault();
      alert("Formulaire soumis ✅");
      reviewForm.reset();
      $("review-popup")?.classList.add("hidden");
    });
  }

});
