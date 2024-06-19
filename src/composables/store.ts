import { globalVue } from "../vue";

interface Store<S> {
  readonly state: S;
  readonly getters: any;
}

export function useStore() {
  const instance = globalVue.getCurrentInstance();

  if (!instance) {
    throw new Error(`"useStore" must be called within a component`);
  }

  return (instance.proxy as any).$store as Store<any>;
}
