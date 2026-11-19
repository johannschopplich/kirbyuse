import type { Panel } from "../src";
import { afterEach, describe, expect, it } from "vitest";
import { useContent } from "../src/composables/content";
import { setActivePanel } from "../src/composables/panel";

function setPanel(view: { path: string; props: { api?: string } }) {
  setActivePanel({
    view,
    content: { env: () => ({ api: view.props.api }) },
  } as unknown as Panel);
}

afterEach(() => {
  setActivePanel(undefined);
});

describe("useContent", () => {
  it("modelPath returns the model's path in Kirby's preview view", () => {
    setPanel({
      path: "pages/blog+post/preview/form",
      props: { api: "/pages/blog+post" },
    });

    expect(useContent().modelPath.value).toBe("pages/blog+post");
  });

  it("modelPath returns undefined in a view without a model", () => {
    setPanel({ path: "users", props: {} });

    expect(useContent().modelPath.value).toBeUndefined();
  });
});
