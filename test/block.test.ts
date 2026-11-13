import type { ExtractPropTypes } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useBlock } from "../src/composables/block";

const props: Readonly<
  ExtractPropTypes<{ content: ObjectConstructor; fieldset: ObjectConstructor }>
> = {
  content: { caption: "Old", source: "audio.mp3" },
  fieldset: { tabs: {} },
};

describe("useBlock", () => {
  it("emits the content merged with the update", () => {
    const emit =
      vi.fn<(event: "update", content: Record<string, unknown>) => void>();
    const { update } = useBlock(props, emit);

    update({ caption: "New" });

    expect(emit).toHaveBeenCalledWith("update", {
      caption: "New",
      source: "audio.mp3",
    });
  });

  it("returns the fallback for a field the fieldset lacks", () => {
    const { field } = useBlock(props, vi.fn());

    expect(field("caption", { marks: true }).marks).toBe(true);
  });
});
