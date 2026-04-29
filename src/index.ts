import type { Panel } from "kirby-types";
import { globalVue } from "./vue";

declare global {
  interface Window {
    panel: Panel;
  }
}

export const {
  computed,
  customRef,
  defineAsyncComponent,
  defineComponent,
  effectScope,
  getCurrentInstance,
  getCurrentScope,
  h,
  inject,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  isShallow,
  markRaw,
  nextTick,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onErrorCaptured,
  onMounted,
  onRenderTracked,
  onRenderTriggered,
  onScopeDispose,
  onServerPrefetch,
  onUnmounted,
  onUpdated,
  provide,
  proxyRefs,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  toRaw,
  toRef,
  toRefs,
  triggerRef,
  unref,
  useAttrs,
  useCssModule,
  useCssVars,
  useListeners,
  useSlots,
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
} = globalVue;

export * from "./composables";
export * from "./utils";
export { globalVue, type VueGlobal } from "./vue";
