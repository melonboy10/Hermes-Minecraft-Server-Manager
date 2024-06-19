import { env as privateENV } from '$env/dynamic/private';
import { serverPB } from '$lib/database';
import { Collections, type ServerResponse } from '$lib/database/types';
import { err, ok, type Result } from 'neverthrow';

export const PORT_RANGE = [+privateENV.PORT_MIN, +privateENV.PORT_MAX];
export const PORT_MIN = PORT_RANGE[0];
export const PORT_MAX = PORT_RANGE[1];

const AVOID_DEFAULT = Boolean(privateENV.AVOID_DEFAULT_PORT);
const MINECRAFT_DEFAULT_PORT = 25565;

export async function getUnusedPort(): Promise<Result<number, Error>> {
  const usedPorts = (
    await serverPB.collection(Collections.Servers).getFullList<ServerResponse>({
      fields: 'port'
    })
  ).map((server) => server.port);
  let port = PORT_MIN;
  while (usedPorts.includes(port) || (AVOID_DEFAULT && port == MINECRAFT_DEFAULT_PORT)) if (port++ > PORT_MAX) return err(new Error('No Ports Available'));
  return ok(port);
}

export async function getPortsRemaining() {
  const usedPorts = (
    await serverPB.collection(Collections.Servers).getFullList<ServerResponse>({
      fields: 'port'
    })
  ).map((server) => server.port);
  const availablePorts = new Array(PORT_MAX - PORT_MIN + 1)
    .fill(0)
    .map((_, i) => i + PORT_MIN)
    .filter((p) => !usedPorts.includes(p) && p != MINECRAFT_DEFAULT_PORT);
  return availablePorts.length;
}
