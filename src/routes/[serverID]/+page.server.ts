import { resultToPromise } from '$lib';
import { serverPB } from '$lib/database';
import { Collections, type ServerResponse } from '$lib/database/types';
import { getContainerLogs, getContainerUsageStats, sendCommandToContainer, startContainer, stopContainer } from '$lib/docker';
import type { CustomError } from '$lib/types';
import { error, fail, type ActionFailure } from '@sveltejs/kit';
import type { Actions, PageServerLoadEvent } from './$types';

export async function load({ fetch, params, locals }: PageServerLoadEvent) {
  const server = await serverPB
    .collection(Collections.Servers)
    .getOne<ServerResponse>(params.serverID)
    .catch(() => null);
  if (!server) error(404, "This server doesn't exist");

  const logs = getContainerLogs(params.serverID, 'all').then(resultToPromise);
  // const data = getContainerData(params.serverID).then(resultToPromise);
  const stats = getContainerUsageStats(params.serverID).then(resultToPromise);

  return {
    server,
    logs,
    stats
  };
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Result<N, S, E> = Promise<
  | ActionFailure<{
      error: E;
      action: N;
    }>
  | {
      value: S;
      action: N;
    }
>;

export const actions = {
  start: async ({ params }): Result<'start', void, CustomError> => {
    const result = await startContainer(params.serverID);
    await pause(1000);
    if (result.isErr()) return fail(400, { error: result.error.json(), action: 'start' });
    // return result.value;
    return { value: result.value, action: 'start' };
  },
  stop: async ({ params }): Result<'stop', void, CustomError> => {
    const result = await stopContainer(params.serverID);
    await pause(1000);
    if (result.isErr()) return fail(400, { error: result.error.json(), action: 'stop' });
    // return result.value;
    return { value: result.value, action: 'stop' };
  },
  command: async ({ params, request }): Result<'command', string[], CustomError> => {
    const command = (await (await request.formData()).get('command')?.toString()) ?? '';
    const result = await sendCommandToContainer(params.serverID, command);
    if (result.isErr()) return fail(400, { error: result.error.json(), action: 'command' });
    // return result.value;
    return { value: result.value, action: 'command' };
  },
  logs: async ({ params }): Result<'logs', string[], CustomError> => {
    return { action: 'logs', value: [] };
    // const result = await getContainerLogs(params.serverID, 10);
    // if (result.isErr()) return fail(400, { error: result.error });
    // return result.value;
  }
} satisfies Actions;
