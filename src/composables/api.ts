import { usePanel } from "./panel";

/**
 * Returns Kirby's Panel API for making HTTP requests to the backend.
 */
export function useApi() {
  return usePanel().api;
}
