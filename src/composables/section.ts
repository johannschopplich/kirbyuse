import { useApi } from "./api";

export function useSection() {
  const api = useApi();

  const load = ({ parent, name }: { parent: string; name: string }) =>
    api.get(`${parent}/sections/${name}`);

  return {
    load,
  };
}
