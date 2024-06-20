import { latestUpdateResults } from '$lib/servers';

export async function load(/* {}: PageServerLoadEvent */) {
  return {
    update: latestUpdateResults.map((serverUpdate) => ({
      server: serverUpdate.server,
      updates: serverUpdate.updates.map((r) => {
        // if (r.hasError) r.error = r.error.json();
        return {
          ...r,
          error: r.hasError ? r.error.json() : undefined
        };
      })
    }))
  };
}
