export function DetectTheme() {
  if (localStorage.getItem("light-mode") == null) {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (!darkThemeMq.matches) {
      document.body.classList.toggle("light-mode");
    }
  } else if (localStorage.getItem("light-mode") == "true") {
    document.body.classList.toggle("light-mode");
  }
  CheckTheme();
}
export function SwitchTheme() {
  document.body.classList.toggle("light-mode");
  CheckTheme(true);
}
function CheckTheme(set = false) {
  if (document.body.classList.contains("light-mode")) {
    if (set) {
      localStorage.setItem("light-mode", "true");
    }
    sun.style.display = "none";
    moon.style.display = "inline-block";
  } else {
    if (set) {
      localStorage.setItem("light-mode", "false");
    }
    sun.style.display = "inline-block";
    moon.style.display = "none";
  }
}
