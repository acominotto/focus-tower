import type { Message, Response } from "@focus-tower/core";

/**
 * A cold MV3 service worker may not have registered its `onMessage` listener
 * yet when a freshly-loaded page (e.g. the blocked page firing straight after a
 * redirect) sends its first message. Chrome then rejects with "Could not
 * establish connection. Receiving end does not exist." — the message was never
 * delivered, so retrying is safe and lets the worker finish waking up.
 */
const TRANSIENT_ERROR = /could not establish connection|receiving end does not exist/i;

const RETRY_DELAYS_MS = [50, 100, 200, 400, 800];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMessage<T extends Response = Response>(message: Message): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await chrome.runtime.sendMessage(message)) as T;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      if (attempt >= RETRY_DELAYS_MS.length || !TRANSIENT_ERROR.test(reason)) {
        throw error;
      }
      await delay(RETRY_DELAYS_MS[attempt]!);
    }
  }
}
