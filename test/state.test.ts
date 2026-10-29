import { describe, expect, it } from "vitest";
import { effectScope, ref, watchEffect } from "vue";
import { createGlobalState } from "../src/utils/state";

describe("createGlobalState", () => {
  it("returns the state of the first call to every later call", () => {
    const useState = createGlobalState(() => ({}));

    expect(useState()).toBe(useState());
  });

  it("keeps the state's watchers running after the scope that calls createGlobalState stops", () => {
    const scope = effectScope();

    const state = scope.run(() => {
      const useState = createGlobalState(() => {
        const count = ref(0);
        const watchedCounts: number[] = [];
        watchEffect(() => watchedCounts.push(count.value), { flush: "sync" });
        return { count, watchedCounts };
      });
      return useState();
    })!;
    scope.stop();
    state.count.value++;

    expect(state.watchedCounts).toEqual([0, 1]);
  });
});
