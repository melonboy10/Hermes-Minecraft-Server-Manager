import { serverPB } from '$lib/database';
import { Collections } from '$lib/database/types';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // TODO: Return a promise instead of awaiting pageload
  const backups = await serverPB.collection(Collections.Backups).getFullList();
  if (!backups) error(404, "This server doesn't exist");

  // TODO: Replace with Object.groupBy once Node 22 is LTS
  function groupBy<K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Record<K, T[]> {
    return Array.from(items).reduce(
      (acc, item, index) => {
        const key = keySelector(item, index);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<K, T[]>
    );
  }

  const groupObject = groupBy(backups, (b) => b.serverID);

  return { backups: groupObject };
}) satisfies PageServerLoad;
