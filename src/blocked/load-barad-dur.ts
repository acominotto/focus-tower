export async function loadBaradDur(container: HTMLElement): Promise<void> {
  try {
    const response = await fetch("test.svg", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const svgText = stripEmbeddedScripts(await response.text());
    if (!svgText.includes("<svg")) {
      return;
    }
    container.insertAdjacentHTML("afterbegin", svgText);
  } catch {
    // Tower is decorative; page remains usable without it.
  }
}

function stripEmbeddedScripts(svgText: string): string {
  return svgText.replace(/<script[\s\S]*?<\/script>/gi, "");
}
