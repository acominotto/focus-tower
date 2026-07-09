const LERP = 0.2;
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_SPHERE_RADIUS = 16;
const MAX_YAW_DEG = 44;
const MAX_PITCH_DEG = 34;
const MIN_FORESHORTEN = 0.72;
const YAW_ROTATE_FACTOR = 0.42;

type EyeOffset = {
  x: number;
  y: number;
};

type EyeRotation = {
  rotX: number;
  rotY: number;
  rotZ: number;
};

export type EyePose = EyeOffset & EyeRotation;

type EyeBounds = {
  centerX: number;
  centerY: number;
  halfW: number;
  halfH: number;
};

type EyeRenderer = {
  shellBounds: EyeBounds;
  rotor: SVGGElement;
  terminator: SVGGElement;
  rim: SVGGElement;
  specular: SVGGElement;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampAngle(deg: number, max: number): number {
  return clamp(deg, -max, max);
}

export function clampIrisOffset(dx: number, dy: number, maxX: number, maxY: number): EyeOffset {
  if (maxX <= 0 || maxY <= 0) {
    return { x: 0, y: 0 };
  }

  const nx = dx / maxX;
  const ny = dy / maxY;
  const dist = Math.hypot(nx, ny);

  if (dist <= 1) {
    return { x: dx, y: dy };
  }

  const scale = 1 / dist;
  return { x: nx * scale * maxX, y: ny * scale * maxY };
}

export function directionToEyeRotation(
  dx: number,
  dy: number,
  sphereRadius = DEFAULT_SPHERE_RADIUS,
): EyeRotation {
  const radius = Math.max(sphereRadius, 1);
  const yaw = clampAngle(Math.atan2(dx, radius) * RAD2DEG, MAX_YAW_DEG);
  const pitch = clampAngle(Math.atan2(dy, radius) * RAD2DEG, MAX_PITCH_DEG);

  return { rotY: yaw, rotX: pitch, rotZ: 0 };
}

export function foreshorteningScale(rotX: number, rotY: number): { scaleX: number; scaleY: number } {
  return {
    scaleX: Math.max(MIN_FORESHORTEN, Math.abs(Math.cos(rotY * DEG2RAD))),
    scaleY: Math.max(MIN_FORESHORTEN, Math.abs(Math.cos(rotX * DEG2RAD))),
  };
}

export function sphereFacing(pose: EyePose): number {
  return Math.cos(pose.rotY * DEG2RAD) * Math.cos(pose.rotX * DEG2RAD);
}

export function buildSphericalEyePose(
  dx: number,
  dy: number,
  sphereRadius = DEFAULT_SPHERE_RADIUS,
): EyePose {
  const rotation = directionToEyeRotation(dx, dy, sphereRadius);
  return { x: 0, y: 0, ...rotation };
}

export function rotationNorm(pose: EyePose): { normX: number; normY: number } {
  return {
    normX: clamp(pose.rotY / MAX_YAW_DEG, -1, 1),
    normY: clamp(pose.rotX / MAX_PITCH_DEG, -1, 1),
  };
}

export function pivotTransform(
  cx: number,
  cy: number,
  rotateDeg: number,
  scaleX: number,
  scaleY: number,
): string {
  return [
    `translate(${cx.toFixed(2)} ${cy.toFixed(2)})`,
    `rotate(${rotateDeg.toFixed(2)})`,
    `scale(${scaleX.toFixed(3)} ${scaleY.toFixed(3)})`,
    `translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`,
  ].join(" ");
}

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function findEyeSvg(root: ParentNode): SVGSVGElement | null {
  if (root instanceof SVGSVGElement) {
    return root;
  }

  return root.querySelector<SVGSVGElement>(".barad-dur, svg.watcher-eye, svg");
}

function findEyeTrack(root: ParentNode, towerEye: SVGGElement): SVGGElement | null {
  return (
    towerEye.querySelector<SVGGElement>(".eye-track") ??
    towerEye.querySelector<SVGGElement>(".eye-iris")
  );
}

function svgUnitsPerScreenPixel(svg: SVGSVGElement): number {
  const rect = svg.getBoundingClientRect();
  const viewWidth = svg.viewBox.baseVal.width || rect.width;
  if (rect.width <= 0 || viewWidth <= 0) {
    return 1;
  }
  return viewWidth / rect.width;
}

export function screenGazeDelta(
  eyeTrack: SVGGraphicsElement,
  svg: SVGSVGElement,
  pointerX: number,
  pointerY: number,
): EyeOffset {
  const shell = eyeTrack.querySelector<SVGGraphicsElement>(".eye-glow") ?? eyeTrack;
  const rect = shell.getBoundingClientRect();
  const unit = svgUnitsPerScreenPixel(svg);

  return {
    x: (pointerX - (rect.left + rect.width / 2)) * unit,
    y: (pointerY - (rect.top + rect.height / 2)) * unit,
  };
}

function getSphereRadius(track: SVGGElement): number {
  const shell = track.querySelector<SVGGraphicsElement>(".eye-glow") ?? track;
  const box = shell.getBBox();
  if (box.width <= 0 || box.height <= 0) {
    return DEFAULT_SPHERE_RADIUS;
  }

  return Math.max(box.width, box.height) * 0.48;
}

function measureShellBounds(track: SVGGElement): EyeBounds {
  const shell = track.querySelector<SVGGraphicsElement>(".eye-glow") ?? track;
  const box = shell.getBBox();
  return {
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2,
    halfW: box.width / 2 || 1,
    halfH: box.height / 2 || 1,
  };
}

function addPixel(
  group: SVGGElement,
  x: number,
  y: number,
  fill: string,
  opacity?: number,
): void {
  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", String(Math.round(x)));
  rect.setAttribute("y", String(Math.round(y)));
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute("fill", fill);
  if (opacity !== undefined) {
    rect.setAttribute("opacity", opacity.toFixed(2));
  }
  group.appendChild(rect);
}

function unwrapLegacySliceRows(track: SVGGElement): void {
  for (const row of [...track.querySelectorAll<SVGGElement>(".eye-slice-row")]) {
    const parent = row.parentElement;
    if (!parent) {
      continue;
    }

    while (row.firstChild) {
      parent.insertBefore(row.firstChild, row);
    }

    row.remove();
  }

  delete track.dataset.snesSlices;

  for (const element of track.querySelectorAll<SVGElement>("*")) {
    element.style.transform = "";
  }
}

function clearTransforms(track: SVGGElement, rotor: SVGGElement): void {
  track.removeAttribute("transform");
  track.style.transform = "";

  const glow = track.querySelector<SVGGElement>(".eye-glow");
  glow?.removeAttribute("transform");
  glow?.style.removeProperty("transform");

  const iris = track.querySelector<SVGGElement>(".eye-iris");
  iris?.removeAttribute("transform");
  iris?.style.removeProperty("transform");

  rotor.removeAttribute("transform");
  rotor.style.transform = "";
}

function ensureEyeRotor(track: SVGGElement): SVGGElement {
  const existing = track.querySelector<SVGGElement>(".eye-rotor");
  if (existing) {
    return existing;
  }

  const rotor = document.createElementNS(SVG_NS, "g");
  rotor.setAttribute("class", "eye-rotor");

  const core = track.querySelector<SVGGElement>(".eye-core");
  const slit = track.querySelector<SVGGElement>(".eye-slit");
  const iris = track.querySelector<SVGGElement>(".eye-iris");
  const glow = track.querySelector<SVGGElement>(".eye-glow");

  if (core) {
    rotor.appendChild(core);
  } else if (iris && !glow) {
    rotor.appendChild(iris);
  }

  if (slit) {
    rotor.appendChild(slit);
  }

  track.appendChild(rotor);
  return rotor;
}

function mountTerminator(rotor: SVGGElement, bounds: EyeBounds): SVGGElement {
  const existing = rotor.querySelector<SVGGElement>(".eye-terminator");
  if (existing) {
    return existing;
  }

  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", "eye-terminator");

  const { centerX: cx, centerY: cy, halfW: rx, halfH: ry } = bounds;
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const angle = Math.PI * 0.72 + t * Math.PI * 0.56;
    addPixel(group, cx + Math.cos(angle) * rx * 0.62, cy + Math.sin(angle) * ry * 0.5, "#120404", 0.72);
    addPixel(group, cx + Math.cos(angle) * rx * 0.72, cy + Math.sin(angle) * ry * 0.58, "#080000", 0.55);
  }

  group.style.pointerEvents = "none";
  rotor.appendChild(group);
  return group;
}

function mountRimLight(rotor: SVGGElement, bounds: EyeBounds): SVGGElement {
  const existing = rotor.querySelector<SVGGElement>(".eye-rim");
  if (existing) {
    return existing;
  }

  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", "eye-rim");

  const { centerX: cx, centerY: cy, halfW: rx, halfH: ry } = bounds;
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    const angle = -Math.PI * 0.22 + t * Math.PI * 0.44;
    addPixel(group, cx + Math.cos(angle) * rx * 0.78, cy + Math.sin(angle) * ry * 0.62, "#ffe8a0", 0.85);
    addPixel(group, cx + Math.cos(angle) * rx * 0.68, cy + Math.sin(angle) * ry * 0.52, "#ffcc66", 0.65);
  }

  group.style.pointerEvents = "none";
  rotor.appendChild(group);
  return group;
}

function mountSpecularHighlight(rotor: SVGGElement, bounds: EyeBounds): SVGGElement {
  const existing = rotor.querySelector<SVGGElement>(".eye-specular");
  if (existing) {
    return existing;
  }

  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", "eye-specular");
  const anchorX = Math.round(bounds.centerX - bounds.halfW * 0.28);
  const anchorY = Math.round(bounds.centerY - bounds.halfH * 0.38);
  addPixel(group, anchorX, anchorY, "#fff8dc", 0.95);
  addPixel(group, anchorX + 1, anchorY, "#ffe8a0", 0.85);
  addPixel(group, anchorX, anchorY + 1, "#ffcc66", 0.75);

  group.style.pointerEvents = "none";
  rotor.appendChild(group);
  return group;
}

function initEyeRenderer(track: SVGGElement): EyeRenderer {
  unwrapLegacySliceRows(track);
  clearTransforms(track, ensureEyeRotor(track));

  const rotor = ensureEyeRotor(track);
  const shellBounds = measureShellBounds(track);

  return {
    shellBounds,
    rotor,
    terminator: mountTerminator(rotor, shellBounds),
    rim: mountRimLight(rotor, shellBounds),
    specular: mountSpecularHighlight(rotor, shellBounds),
  };
}

function applySpherePose(renderer: EyeRenderer, track: SVGGElement, pose: EyePose): void {
  const { shellBounds, rotor } = renderer;
  const facing = sphereFacing(pose);
  const squash = foreshorteningScale(pose.rotX, pose.rotY);
  const cx = shellBounds.centerX;
  const cy = shellBounds.centerY;
  const rotateDeg = pose.rotY * YAW_ROTATE_FACTOR;

  clearTransforms(track, rotor);

  rotor.setAttribute(
    "transform",
    pivotTransform(cx, cy, rotateDeg, squash.scaleX, squash.scaleY),
  );

  renderer.terminator.style.opacity = String(clamp(0.34 + (1 - facing) * 0.4, 0.28, 0.78));
  renderer.rim.style.opacity = String(clamp(0.38 + facing * 0.45, 0.25, 0.88));
  renderer.specular.style.opacity = String(clamp(0.3 + facing * 0.55, 0.18, 0.92));
}

function clearEyeRenderer(track: SVGGElement, renderer: EyeRenderer): void {
  clearTransforms(track, renderer.rotor);

  for (const overlay of [renderer.terminator, renderer.rim, renderer.specular]) {
    overlay.style.removeProperty("opacity");
  }
}

export function useTowerEye(root: ParentNode = document): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const svg = findEyeSvg(root);
  const eyeAnchor = root.querySelector<SVGGElement>(".tower-eye");
  const eyeTrack = eyeAnchor ? findEyeTrack(root, eyeAnchor) : null;
  if (!svg || !eyeAnchor || !eyeTrack) {
    return () => {};
  }

  eyeAnchor.classList.add("is-tracking");
  let renderer = initEyeRenderer(eyeTrack);

  let sphereRadius = getSphereRadius(eyeTrack);
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let currentPose: EyePose = buildSphericalEyePose(0, 0, sphereRadius);
  let rafId = 0;

  function computeTarget(): EyePose {
    const { x, y } = screenGazeDelta(eyeTrack!, svg!, pointerX, pointerY);
    return buildSphericalEyePose(x, y, sphereRadius);
  }

  function renderPose(pose: EyePose): void {
    applySpherePose(renderer, eyeTrack!, pose);
  }

  function tick(): void {
    rafId = window.requestAnimationFrame(tick);

    const target = computeTarget();
    currentPose = {
      x: 0,
      y: 0,
      rotX: lerp(currentPose.rotX, target.rotX, LERP),
      rotY: lerp(currentPose.rotY, target.rotY, LERP),
      rotZ: 0,
    };

    renderPose(currentPose);
  }

  function onPointerMove(event: MouseEvent): void {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }

  function onLayoutChange(): void {
    sphereRadius = getSphereRadius(eyeTrack!);
    renderer.shellBounds = measureShellBounds(eyeTrack!);
    renderPose(currentPose);
  }

  rafId = window.requestAnimationFrame(tick);

  document.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("resize", onLayoutChange, { passive: true });
  window.addEventListener("scroll", onLayoutChange, { passive: true });

  return () => {
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
    }
    document.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("resize", onLayoutChange);
    window.removeEventListener("scroll", onLayoutChange);
    clearEyeRenderer(eyeTrack, renderer);
    renderer.terminator.remove();
    renderer.rim.remove();
    renderer.specular.remove();
  };
}
