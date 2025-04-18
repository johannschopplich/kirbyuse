import type * as Vue from "vue";
import type { Panel } from "./types/panel";
import { globalVue } from "./vue";

declare global {
  interface Window {
    Vue: typeof Vue;
    panel: Panel;
  }
}

export const computed = globalVue.computed;
export const customRef = globalVue.customRef;
export const defineAsyncComponent = globalVue.defineAsyncComponent;
export const defineComponent = globalVue.defineComponent;
export const effectScope = globalVue.effectScope;
export const getCurrentInstance = globalVue.getCurrentInstance;
export const getCurrentScope = globalVue.getCurrentScope;
export const h = globalVue.h;
export const inject = globalVue.inject;
export const isProxy = globalVue.isProxy;
export const isReactive = globalVue.isReactive;
export const isReadonly = globalVue.isReadonly;
export const isRef = globalVue.isRef;
export const isShallow = globalVue.isShallow;
export const markRaw = globalVue.markRaw;
export const nextTick = globalVue.nextTick;
export const onActivated = globalVue.onActivated;
export const onBeforeMount = globalVue.onBeforeMount;
export const onBeforeUnmount = globalVue.onBeforeUnmount;
export const onBeforeUpdate = globalVue.onBeforeUpdate;
export const onDeactivated = globalVue.onDeactivated;
export const onErrorCaptured = globalVue.onErrorCaptured;
export const onMounted = globalVue.onMounted;
export const onRenderTracked = globalVue.onRenderTracked;
export const onRenderTriggered = globalVue.onRenderTriggered;
export const onScopeDispose = globalVue.onScopeDispose;
export const onServerPrefetch = globalVue.onServerPrefetch;
export const onUnmounted = globalVue.onUnmounted;
export const onUpdated = globalVue.onUpdated;
export const provide = globalVue.provide;
export const proxyRefs = globalVue.proxyRefs;
export const reactive = globalVue.reactive;
export const readonly = globalVue.readonly;
export const ref = globalVue.ref;
export const shallowReactive = globalVue.shallowReactive;
export const shallowReadonly = globalVue.shallowReadonly;
export const shallowRef = globalVue.shallowRef;
export const toRaw = globalVue.toRaw;
export const toRef = globalVue.toRef;
export const toRefs = globalVue.toRefs;
export const triggerRef = globalVue.triggerRef;
export const unref = globalVue.unref;
export const useAttrs = globalVue.useAttrs;
export const useCssModule = globalVue.useCssModule;
export const useCssVars = globalVue.useCssVars;
export const useListeners = globalVue.useListeners;
export const useSlots = globalVue.useSlots;
export const watch = globalVue.watch;
export const watchEffect = globalVue.watchEffect;
export const watchPostEffect = globalVue.watchPostEffect;
export const watchSyncEffect = globalVue.watchSyncEffect;

export * from "./composables";
export * from "./utils";
export { globalVue } from "./vue";
