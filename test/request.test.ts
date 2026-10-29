import { describe, expect, it } from "vitest";
import { createSharedRequest } from "../src/utils/request";

describe("createSharedRequest", () => {
  it("shares one in-flight request between concurrent calls", async () => {
    let fetchCount = 0;
    const request = createSharedRequest(async () => ++fetchCount);

    const values = await Promise.all([request.get(), request.get()]);

    expect(values).toEqual([1, 1]);
  });

  it("returns the resolved value without fetching again", async () => {
    let fetchCount = 0;
    const request = createSharedRequest(async () => ++fetchCount);

    await request.get();

    expect(await request.get()).toBe(1);
  });

  it("fetches again after a rejected request", async () => {
    let fetchCount = 0;
    const request = createSharedRequest(async () => {
      if (++fetchCount === 1) throw new Error("Offline");
      return fetchCount;
    });

    await expect(request.get()).rejects.toThrow("Offline");

    expect(await request.get()).toBe(2);
  });

  it("clear makes the next call fetch again", async () => {
    let fetchCount = 0;
    const request = createSharedRequest(async () => ++fetchCount);

    await request.get();
    request.clear();

    expect(await request.get()).toBe(2);
  });
});
