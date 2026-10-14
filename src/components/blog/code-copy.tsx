"use client";

import { useEffect } from "react";

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * The post body is pre-rendered HTML, so copy buttons are attached to its code
 * blocks after mount instead of being part of the markup.
 */
export function CodeCopy({
  containerId,
  label,
  copiedLabel,
}: {
  containerId: string;
  label: string;
  copiedLabel: string;
}) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttons: HTMLButtonElement[] = [];
    for (const pre of container.querySelectorAll("pre")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", label);
      button.title = label;
      button.innerHTML = COPY_ICON;
      button.addEventListener("click", async () => {
        await navigator.clipboard.writeText(pre.innerText);
        button.innerHTML = CHECK_ICON;
        button.title = copiedLabel;
        button.dataset.copied = "true";
        setTimeout(() => {
          button.innerHTML = COPY_ICON;
          button.title = label;
          delete button.dataset.copied;
        }, 1500);
      });
      (pre.parentElement ?? pre).classList.add("code-block");
      (pre.parentElement ?? pre).appendChild(button);
      buttons.push(button);
    }

    return () => {
      for (const b of buttons) b.remove();
    };
  }, [containerId, label, copiedLabel]);

  return null;
}
