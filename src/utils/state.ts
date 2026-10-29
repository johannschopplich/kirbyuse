import { effectScope } from "vue";

/**
 * Wraps a state factory so every caller shares the state of its first run.
 *
 * @example
 * ```ts
 * export const useTranslationState = createGlobalState(() => {
 *   const isTranslating = ref(false)
 *   return { isTranslating }
 * })
 * ```
 */
export function createGlobalState<T>(stateFactory: () => T): () => T {
  let isInitialized = false;
  let state: T;
  // Detached, so the state's watchers outlive even a component that calls `createGlobalState`.
  const scope = effectScope(true);

  return () => {
    if (!isInitialized) {
      state = scope.run(stateFactory)!;
      isInitialized = true;
    }
    return state;
  };
}
