export const WATCHER_EYE_URL = "content/watcher-eye.svg";

export async function mountWatcherEye(container: HTMLElement): Promise<boolean> {
  try {
    const response = await fetch(chrome.runtime.getURL(WATCHER_EYE_URL), { cache: "no-store" });
    if (!response.ok) {
      return false;
    }

    const doc = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
    if (doc.querySelector("parsererror")) {
      return false;
    }

    container.replaceChildren(document.importNode(doc.documentElement, true));
    return true;
  } catch {
    return false;
  }
}
