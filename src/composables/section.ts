import { useApi } from "./api";

export const sectionProps = {
  blueprint: String,
  lock: [Boolean, Object],
  help: String,
  name: String,
  parent: String,
  timestamp: Number,
};

export function useSection() {
  const api = useApi();

  const load = ({ parent, name }: { parent: string; name: string }) =>
    api.get(`${parent}/sections/${name}`);

  return {
    load,
  };
}
