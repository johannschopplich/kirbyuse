import type { Panel } from "kirby-types";
import { afterEach, describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { useDialog } from "../src/composables/dialog";
import { providePanel, setActivePanel } from "../src/composables/panel";

function createPanel(openedComponents: string[]) {
  return {
    dialog: {
      open: ({ component }: { component: string }) =>
        openedComponents.push(component),
    },
  } as unknown as Panel;
}

afterEach(() => {
  setActivePanel(undefined);
});

describe("useDialog", () => {
  it("opens a dialog on the provided panel after setup", async () => {
    const openedComponents: string[] = [];
    let openTextDialog:
      ReturnType<typeof useDialog>["openTextDialog"] | undefined;

    const Child = defineComponent({
      setup() {
        ({ openTextDialog } = useDialog());
        return () => null;
      },
    });
    const Parent = defineComponent({
      setup() {
        providePanel(createPanel(openedComponents));
        return () => h(Child);
      },
    });

    await renderToString(createSSRApp(Parent));
    void openTextDialog!("Are you sure?");

    expect(openedComponents).toEqual(["k-text-dialog"]);
  });

  it("opens a dialog on a panel set after it ran outside a component", () => {
    const openedComponents: string[] = [];
    const { openTextDialog } = useDialog();

    setActivePanel(createPanel(openedComponents));
    void openTextDialog("Are you sure?");

    expect(openedComponents).toEqual(["k-text-dialog"]);
  });
});
