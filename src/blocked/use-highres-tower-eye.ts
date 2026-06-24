const EYE_VIEWBOX_Y = 48;
const VIEWBOX_HEIGHT = 256;
const MAX_PUPIL_MOVE = 4;
const MAX_EYE_MOVE = 1.2;
const INTENSITY_RANGE = 250;

export function useHighresTowerEye(root: ParentNode = document): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const svg = root.querySelector<SVGSVGElement>("#barad-dur-highres, .barad-dur-highres");
  const pupil = root.querySelector<SVGGElement>("#eye-pupil-slit");
  const eyeBall = root.querySelector<SVGGElement>("#eye-ball-group");

  if (!svg || !pupil || !eyeBall) {
    return () => {};
  }

  function onPointerMove(event: MouseEvent): void {
    const rect = svg!.getBoundingClientRect();
    const eyeX = rect.left + rect.width * 0.5;
    const eyeY = rect.top + rect.height * (EYE_VIEWBOX_Y / VIEWBOX_HEIGHT);

    const dx = event.clientX - eyeX;
    const dy = event.clientY - eyeY;
    const dist = Math.hypot(dx, dy);

    if (dist <= 0) {
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    const intensity = Math.min(dist / INTENSITY_RANGE, 1);

    const pupilX = nx * MAX_PUPIL_MOVE * intensity;
    const pupilY = ny * MAX_PUPIL_MOVE * intensity;
    const eyeXOffset = nx * MAX_EYE_MOVE * intensity;
    const eyeYOffset = ny * MAX_EYE_MOVE * intensity;

    pupil!.setAttribute("transform", `translate(${pupilX.toFixed(2)}, ${pupilY.toFixed(2)})`);
    eyeBall!.setAttribute("transform", `translate(${eyeXOffset.toFixed(2)}, ${eyeYOffset.toFixed(2)})`);
  }

  window.addEventListener("mousemove", onPointerMove, { passive: true });

  return () => {
    window.removeEventListener("mousemove", onPointerMove);
    pupil!.removeAttribute("transform");
    eyeBall!.removeAttribute("transform");
  };
}
