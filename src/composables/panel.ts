import type { Panel } from "../types/panel";

export function usePanel(): Panel {
  return window.panel;
}
