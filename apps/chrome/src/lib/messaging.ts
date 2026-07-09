import type { Message, Response } from "@focus-tower/core";

export function sendMessage<T extends Response = Response>(message: Message): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>;
}
