document.addEventListener("deviceready", disableScroll);
document.addEventListener("DOMContentLoaded", disableScroll);

function disableScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.documentElement.style.overflow = "hidden";
}
