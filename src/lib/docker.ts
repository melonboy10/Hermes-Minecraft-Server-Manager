import { env as publicENV } from '$env/dynamic/public';
import compose, { execCompose, type IDockerComposeResult } from 'docker-compose/dist/v2';
import { Result, ResultAsync, err, ok } from 'neverthrow';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { removeCloudflareRecords } from './cloudflare';
import { serverPB } from './database';
import { Collections, ServerState, type ServerRecord, type ServerResponse } from './database/types';
import { createBackup } from './servers/backups';
import { /* CustomError, */ ContainerState, CustomError, type ContainerData, type ContainerResult } from './types';

function getServerFolder(serverID: string): string {
  const relative = `servers/${serverID}/`;
  return path.resolve(relative);
}

export function containerDoesntExists(serverID: string): boolean {
  return !fs.existsSync(getServerFolder(serverID));
}

function containerHasPauseFile(serverID: string): boolean {
  return fs.existsSync(path.join(getServerFolder(serverID), 'server-files', '.paused'));
}

export async function startContainer(serverID: string): ContainerResult<void> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const composeFile = getServerFolder(serverID);
  const containerStart = await ResultAsync.fromPromise(compose.upAll({ cwd: composeFile }), (e) => CustomError.from(e, 'Failed to start container'));

  if (containerStart.isErr()) return err(containerStart.error);
  // if (containerStart.isErr()) {
  //   const dbResult = await ResultAsync.fromPromise(
  //     serverPB.collection(Collections.Servers).update<ServerRecord>(serverID, {
  //       state: ServerState.Stopped,
  //       startDate: null,
  //       shutdownDate: new Date().toISOString(),
  //       deletionDate: null // TODO: Deletion date
  //     }),
  //     () => new CustomError('Failed to update server status on failed container start', )
  //   );

  //   return err(dbResult.isErr() ? dbResult.error : containerStart.error);
  // }

  const dbResult = await ResultAsync.fromPromise(
    serverPB.collection(Collections.Servers).update<ServerRecord>(serverID, {
      state: ServerState.Running,
      startDate: new Date().toISOString(),
      shutdownDate: null,
      deletionDate: null
    }),
    () => new CustomError('Failed to update server status on successful container start')
  );

  return dbResult.map(() => undefined);
}

export async function stopContainer(serverID: string): ContainerResult<void> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const containerStop = await ResultAsync.fromPromise(compose.stop({ cwd: getServerFolder(serverID) }), () => new CustomError('Failed to stop container'));

  if (containerStop.isErr()) return err(containerStop.error);

  const backupResult = await createBackup(serverID);
  if (backupResult.isErr()) return err(backupResult.error);

  const server = await ResultAsync.fromPromise(serverPB.collection(Collections.Servers).getOne(serverID), () => new CustomError('Failed to get server data from DB'));
  if (server.isErr()) return err(server.error);

  const updateResult = await ResultAsync.fromPromise(
    serverPB.collection(Collections.Servers).update(serverID, {
      state: ServerState.Stopped,
      startDate: null,
      shutdownDate: new Date().toISOString(),
      deletionDate: server.value.canBeDeleted ? new Date(Date.now() + 1000 * 60 * 60 * +publicENV.PUBLIC_TIME_UNTIL_DELETION_AFTER_SHUTDOWN).toISOString() : null // 7 days
    }),
    (e) => CustomError.from(e, 'Failed to update server data on stop')
  );
  return updateResult.map(() => undefined);
}

export async function getContainerLogs(serverID: string, lines: number | 'all'): ContainerResult<string[]> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const containerLogs = await ResultAsync.fromPromise(
    compose.logs([], {
      commandOptions: ['--tail', lines === 'all' ? '150' : Math.min(lines, 150).toString()],
      cwd: getServerFolder(serverID)
    }),
    (e) => CustomError.from(e, 'Failed to get container logs')
  );

  return containerLogs.map((r) =>
    r.out
      .split('\n')
      .map((s) => s.trim())
      .map((line) => {
        // Do some line shortenting and rephrasing.
        if (/.*(RCON Client).*(Thread RCON Client).*(shutting down).*/.test(line)) return '';
        if (/.*(RCON Listener).*(Thread RCON Client).*(started).*/.test(line)) return '';

        return line;
      })
      .filter((line) => line !== '')
  );
}

export async function sendCommandToContainer(serverID: string, command: string): ContainerResult<string[]> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const execResult = await ResultAsync.fromPromise(compose.exec('minecraft', `rcon-cli ${command}`, { cwd: getServerFolder(serverID) }), () => new CustomError('Failed to execute command in container'));

  // updateServerState(server);

  return execResult.map((r) =>
    r.out
      .split('\n')
      .map((s) => s.trim())
      .filter((line) => line !== '')
  );
}

export async function getContainerPlayerCount(serverID: string): ContainerResult<{ max: number; online: number }> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const execResult = await ResultAsync.fromPromise(compose.exec('minecraft', `mc-monitor status`, { cwd: getServerFolder(serverID) }), (e) => CustomError.from(e, 'Failed to execute command getting player count'));

  // updateServerState(server);

  return execResult.map((r) => {
    let online = r.out.substring(r.out.indexOf('online=') + 7);
    online = online.substring(0, online.indexOf(' '));
    let max = r.out.substring(r.out.indexOf('max=') + 4);
    max = max.substring(0, max.indexOf(' '));
    return { online: parseInt(online), max: parseInt(max) };
  });
}

export async function getContainerData(serverID: string): ContainerResult<ContainerData> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const psResult = await ResultAsync.fromPromise(execCompose('ps', ['-a', '--format', 'json'], { cwd: getServerFolder(serverID) }), (e) => CustomError.from(e, 'Failed to read container data'));
  if (psResult.isErr()) return err(psResult.error);

  const containerJSONResult = Result.fromThrowable(
    () =>
      JSON.parse(
        psResult.value.out
          .trim()
          .split('\n')
          .filter((s) => s.trim() != '')[0]
      ),
    (e) => CustomError.from(e, 'Failed to parse container data')
  )();
  if (containerJSONResult.isErr()) return err(containerJSONResult.error);
  const containerJSON: ContainerData = containerJSONResult.value;

  // if (containerJSON.length === 0) return err(CustomError.from(JSON.stringify(containerJSON), 'Failed to get any containers from ps command'));
  // if (!containerJSON[0]) return err(CustomError.from(JSON.stringify(containerJSON), 'Parsed one undefined container from ps command'));

  // Check if container is paused
  const paused = containerHasPauseFile(serverID);
  if (paused && containerJSON.State == ContainerState.Running) containerJSON.State = ContainerState.Paused;

  return ok(containerJSON);
}

export async function getContainerRunningStatus(serverID: string): ContainerResult<boolean> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));
  return (await getContainerData(serverID)).map((d) => d.State == ContainerState.Running);
  // return (await getContainerData(serverID)).map(d => d.State == ContainerState.Running);
}

// export function getAllServerStatuses(validIDs: string[]): Promise<Container[]> {
//   return new Promise((resolve) => {
//     exec('docker ps --format json', { cwd: 'servers' }, (error, stdout) => {
//       if (error) resolve([]);
//       const containers: (Container & { [key: string]: string })[] = JSON.parse(stdout);
//       resolve(
//         containers
//           .filter((container) => validIDs.includes(container.Project))
//           .map((container) => ({
//             ID: container.ID,
//             Project: container.Project,
//             Created: container.Created,
//             State: container.State,
//             ExitCode: container.ExitCode
//           }))
//       );
//     });
//   });
// }
export type ContainerUsageStats = {
  BlockIO: string;
  CPUPerc: string;
  Container: string;
  ID: string;
  MemPerc: string;
  MemUsage: string;
  Name: string;
  NetIO: string;
  PIDs: string;
};

export async function getContainerUsageStats(serverID: string): ContainerResult<ContainerUsageStats> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const containerData = await getContainerData(serverID);
  if (containerData.isErr()) return err(containerData.error);

  const containerStats = await ResultAsync.fromPromise(
    new Promise<IDockerComposeResult>((resolve, reject): void => {
      const childProc = childProcess.spawn('docker', ['stats', containerData.value.ID, '--no-stream', '--no-trunc', '--format', '{{ json . }}']);

      const result: IDockerComposeResult = { exitCode: null, err: '', out: '' };

      childProc.on('error', (err) => reject(err));
      childProc.stdout.on('data', (chunk) => (result.out += chunk.toString()));
      childProc.stderr.on('data', (chunk) => (result.err += chunk.toString()));
      childProc.on('exit', (exitCode): void => {
        result.exitCode = exitCode;
        setTimeout(() => {
          if (exitCode === 0) resolve(result);
          else reject(result);
        }, 500);
      });
    }),
    () => new CustomError('Failed to the server usage stats')
  );

  return containerStats.map((v) =>
    JSON.parse(
      v.out
        .trim()
        .split('\n')
        .filter((s) => s.trim() != '')
        .join('')
    )
  );

  // return new Promise((resolve) => {
  //   exec('docker stats --no-stream --format json', { cwd: `servers/${serverID}` }, (error, stdout) => {
  //     console.log(error);
  //     if (error) return resolve(null);
  //     console.log(stdout);
  //     const containers: (ContainerUsageStats & { [key: string]: string })[] = JSON.parse(stdout);
  //     console.log(containers);
  //     if (containers.length === 0 || !containers[0]) return resolve(null);
  //     const container = containers.filter((container) => container.Name.includes(serverID))[0];
  //     resolve({
  //       BlockIO: container.BlockIO,
  //       CPUPerc: container.CPUPerc,
  //       Container: container.Container,
  //       ID: container.ID,
  //       MemPerc: container.MemPerc,
  //       MemUsage: container.MemUsage,
  //       Name: container.Name,
  //       NetIO: container.NetIO,
  //       PIDs: container.PIDs
  //     });
  //   });
  // });
}

export async function removeContainer(serverID: string, forcibly = false): ContainerResult<void> {
  if (containerDoesntExists(serverID)) return err(new CustomError('Server not found'));

  const stopped = await stopContainer(serverID);
  if (stopped.isErr()) return err(stopped.error);

  const remove = Result.fromThrowable(
    () => fs.rmSync(getServerFolder(serverID), { recursive: true, force: forcibly }),
    () => new CustomError('Failed to remove server files')
  )();
  if (remove.isErr()) err(remove.error);

  const serverRecord = await serverPB.collection(Collections.Servers).getOne<ServerResponse>(serverID);
  const removed = await removeCloudflareRecords(serverRecord.cloudflareCNAMERecordID, serverRecord.cloudflareSRVRecordID);
  if (removed.isErr()) return err(new CustomError(removed.error.message, removed.error));

  const dbResult = await ResultAsync.fromPromise(serverPB.collection(Collections.Servers).delete(serverID), () => new CustomError('Failed to update database after removing server'));
  return dbResult.map(() => undefined);

  // new Promise((resolve) => {
  //   exec(`cd ../; rm -rf ${serverID}`, { cwd: `servers/${serverID}` }, (error) => {
  //     console.log(error);
  //     if (error && !forcibly) resolve(1);
  //     resolve(0);
  //   });
  // });
}

export class ComposeBuilder {
  private readonly version = '3.9';
  private readonly image = 'itzg/minecraft-server:latest';
  private port = 25565;
  private readonly volumes: string[] = ['./server-files:/data'];
  private readonly restart = 'no';
  private readonly healthcheck = {
    test: 'mc-health',
    start_period: '1m',
    interval: '5s',
    retries: '20'
  };

  private readonly variables: { key: string; value: string | number | boolean }[] = [];
  constructor(private readonly cwd: string) {}

  setPort(port: number) {
    this.port = port;
    return this;
  }

  addVariable(key: string, value: string | number | boolean) {
    this.variables.push({ key, value: `'${value}'` });
    return this;
  }

  addListVariable(key: string, value: (string | number | boolean)[]) {
    this.variables.push({ key, value: `|\n        ${value.join('\n        ')}` });
  }

  build() {
    let file = '';
    file += `version: "${this.version}"\n`;
    file += `services:\n`;
    file += `  minecraft:\n`;
    file += `    image: ${this.image}\n`;
    file += `    ports:\n`;
    file += `      - "${this.port}:25565"\n`;
    file += `    volumes:\n`;
    for (const volume of this.volumes) {
      file += `      - ${volume}\n`;
    }
    file += `    environment:\n`;
    for (const variable of this.variables) {
      file += `      ${variable.key}: ${variable.value}\n`;
    }
    file += `    restart: "${this.restart}"\n`;
    file += `    healthcheck:\n`;
    file += `      test: ${this.healthcheck.test}\n`;
    file += `      start_period: ${this.healthcheck.start_period}\n`;
    file += `      interval: ${this.healthcheck.interval}\n`;
    file += `      retries: ${this.healthcheck.retries}\n`;
    return file;
  }
}
