import Vue from "vue";

export function useStore() {
  return Vue.getCurrentInstance().proxy.$store;
}
