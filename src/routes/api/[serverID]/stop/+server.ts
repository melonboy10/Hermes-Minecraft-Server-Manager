import { Collections } from '$lib/database/types.js';
import { stopCompose } from '$lib/docker';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  const code = await stopCompose(params.serverID);
  await locals.pb.collection(Collections.Servers).update(params.serverID, {
    shutdown: true,
    shutdownDate: new Date()
  });

  // TODO: Zip and upload server files

  return json(code);
}