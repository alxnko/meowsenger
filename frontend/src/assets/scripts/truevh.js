export default function setTrueVH() {
  window.addEventListener("resize", setTrueVH);
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
