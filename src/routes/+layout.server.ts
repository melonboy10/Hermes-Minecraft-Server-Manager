import { getUnusedPort } from '$lib/servers/ports';

export async function load() {
  return {
    allowCreate: getUnusedPort().then((r) => r.isOk())
  };
}
