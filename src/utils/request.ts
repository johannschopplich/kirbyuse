export interface SharedRequest<T> {
  get: () => Promise<T>;
  clear: () => void;
}

/**
 * Wraps a fetcher so all `get()` calls share one request; a rejected request isn't cached, so the next call retries.
 *
 * @example
 * ```ts
 * const fieldsets = createSharedRequest(() =>
 *   usePanel().api.get("my-plugin/fieldsets"),
 * )
 *
 * await fieldsets.get()
 * ```
 */
export function createSharedRequest<T>(
  fetcher: () => Promise<T>,
): SharedRequest<T> {
  let request: Promise<T> | undefined;

  return {
    get() {
      if (!request) {
        const pending = fetcher().catch((error) => {
          if (request === pending) request = undefined;
          throw error;
        });
        request = pending;
      }
      return request;
    },
    clear() {
      request = undefined;
    },
  };
}
