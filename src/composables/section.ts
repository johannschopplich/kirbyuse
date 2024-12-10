import { useApi } from "./api";

/**
 * Provides section methods for loading section data.
 */
export function useSection() {
  const api = useApi();

  const load = ({ parent, name }: { parent: string; name: string }) =>
    api.get(`${parent}/sections/${name}`);

  return {
    load,
  };
}
