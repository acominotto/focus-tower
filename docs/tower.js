const MAX_PUPIL_MOVE = 4;
const MAX_EYE_MOVE = 1.2;
const INTENSITY_RANGE = 250;

function stripEmbeddedScripts(svgText) {
  return svgText.replace(/<script[\s\S]*?<\/script>/gi, "");
}

async function loadTower(container) {
  try {
    const response = await fetch("assets/test.svg");
    if (!response.ok) return;
    const svgText = stripEmbeddedScripts(await response.text());
    if (!svgText.includes("<svg")) return;
    container.insertAdjacentHTML("afterbegin", svgText);
  } catch {
    // Tower is decorative.
  }
}

function useTowerEye(root = document) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const pupil = root.querySelector("#eye-pupil-slit");
  const eyeBall = root.querySelector("#eye-ball-group");
  if (!pupil || !eyeBall) return;

  function onPointerMove(event) {
    const eyeRect = eyeBall.getBoundingClientRect();
    const eyeX = eyeRect.left + eyeRect.width * 0.5;
    const eyeY = eyeRect.top + eyeRect.height * 0.5;
    const dx = event.clientX - eyeX;
    const dy = event.clientY - eyeY;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const intensity = Math.min(dist / INTENSITY_RANGE, 1);
    const pupilX = nx * MAX_PUPIL_MOVE * intensity;
    const pupilY = ny * MAX_PUPIL_MOVE * intensity;
    const eyeXOffset = nx * MAX_EYE_MOVE * intensity;
    const eyeYOffset = ny * MAX_EYE_MOVE * intensity;

    pupil.setAttribute("transform", `translate(${pupilX.toFixed(2)}, ${pupilY.toFixed(2)})`);
    eyeBall.setAttribute("transform", `translate(${eyeXOffset.toFixed(2)}, ${eyeYOffset.toFixed(2)})`);
  }

  window.addEventListener("mousemove", onPointerMove, { passive: true });
}

async function bootstrap() {
  const tower = document.getElementById("dark-tower");
  if (!tower) return;
  await loadTower(tower);
  useTowerEye(tower);
}

void bootstrap();
