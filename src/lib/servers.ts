import { Collections, Difficulty, Gamemode, ServerSoftware, ServerSoftwareOptions, TimeToLive, WorldType, type ServerResponse, WorldCreationMethod } from '$lib/database/types';
import { z } from 'zod';
import PocketBase from 'pocketbase';
import { faker } from '@faker-js/faker';
import { objectFormData } from '$lib';
import fs from 'node:fs';
import { PUBLIC_PORT_MAX, PUBLIC_PORT_MIN } from '$env/static/public';
import { POCKETBASE_INTERNAL_ADMIN_EMAIL, POCKETBASE_INTERNAL_ADMIN_PASSWORD } from '$env/static/private';
import { addServerRecords } from './cloudflare';
import { startCompose } from './docker';

const PORT_RANGE = [+PUBLIC_PORT_MIN, +PUBLIC_PORT_MAX];
const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);
pb.admins.authWithPassword(POCKETBASE_INTERNAL_ADMIN_EMAIL, POCKETBASE_INTERNAL_ADMIN_PASSWORD);

// const StringArraySchema = z
//   .string()
//   .transform((v) =>
//     v
//       .split(',')
//       .map((s) => s.trim())
//       .filter((s) => s !== '')
//   )
//   .pipe(z.string().array().default([]));

export const ServerCreationSchema = z
  .object({
    title: z.string().min(3).max(63),
    subdomain: z
      .string()
      .min(3)
      .max(63)
      .or(z.literal(''))
      .transform((v) => (v ? v.toLowerCase() : faker.hacker.noun())),
    icon: z.instanceof(File).optional(),
    motd: z
      .string()
      .transform((s) => (s ? s : 'A Hermes Minecraft Server'))
      .default('A Hermes Minecraft Server'),
    serverSoftware: z.nativeEnum(ServerSoftware),
    gameVersion: z.string(),

    timeToLive: z.nativeEnum(TimeToLive),
    eula: z.literal(true).or(z.literal('true'))
  })
  .refine(
    (data) => {
      const serverSoftware = ServerSoftwareOptions[data.serverSoftware];
      if (!serverSoftware) return false;
      return serverSoftware.versions.flat().includes(data.gameVersion);
    },
    { message: 'Invalid game version for software' }
  )
  .and(
    z.discriminatedUnion('worldCreator', [
      z.object({
        worldCreator: z.literal(WorldCreationMethod.Source),
        worldSourceURL: z.string().url(),
        worldSource: z.instanceof(File)
      }),
      z.object({
        worldCreator: z.literal(WorldCreationMethod.New),
        worldSeed: z.string().default(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + ''),
        worldType: z.nativeEnum(WorldType),
        superflatLayers: z
          .object({
            block: z.string(),
            height: z.number()
          })
          .strict()
          .array()
          .optional()
      })
    ])
  )
  .and(
    z.object({
      maxPlayers: z.coerce.number().default(10),
      difficulty: z.nativeEnum(Difficulty).default(Difficulty.Normal),
      gamemode: z.nativeEnum(Gamemode).default(Gamemode.Survival),

      viewDistance: z.coerce.number().default(16),
      simulationDistance: z.coerce.number().default(10),

      allowNether: z.coerce.boolean().default(true),
      hardcore: z.coerce.boolean().default(false),
      enableCommandBlock: z.coerce.boolean().default(true),
      enablePVP: z.coerce.boolean().default(true),

      whitelist: z
        .string()
        .transform((v) => (v.trim() ? JSON.parse(v) : []))
        .pipe(
          z
            .object({
              uuid: z.string(),
              name: z.string()
            })
            .array()
            .default([])
        ),
      ops: z
        .string()
        .transform((v) => (v.trim() ? JSON.parse(v) : []))
        .pipe(
          z
            .object({
              uuid: z.string(),
              name: z.string(),
              level: z.number().default(4),
              bypassesPlayerLimit: z.coerce.boolean().default(true)
            })
            .array()
            .default([])
        ),
      bannedPlayers: z
        .string()
        .transform((v) => (v.trim() ? JSON.parse(v) : []))
        .pipe(
          z
            .object({
              uuid: z.string(),
              name: z.string(),
              created: z.string(),
              source: z.string(),
              expires: z.string(),
              reason: z.string()
            })
            .array()
            .default([])
        ),

      serverProperties: z.instanceof(File).optional()
    })
  );

function up(str: string) {
  return str.toUpperCase();
}
export async function createNewServer(data: z.infer<typeof ServerCreationSchema>) {
  const usedPorts = (await pb.collection(Collections.Servers).getFullList<ServerResponse>()).map((server) => server.port);
  let port: number = PORT_RANGE[0];
  // Find first unused port
  while (usedPorts.includes(port)) if (port++ > PORT_RANGE[1]) throw new Error('No available ports');

  const record = await pb
    .collection(Collections.Servers)
    .create<ServerResponse>(
      objectFormData({
        port,
        title: data.title,
        icon: data.icon ? data.icon : new File([fs.readFileSync('src/assets/default-server-icon.png')], 'default-server-icon.png'),
        subdomain: data.subdomain,
        serverSoftware: data.serverSoftware,
        gameVersion: data.gameVersion,
        worldType: data.worldCreator === WorldCreationMethod.New ? data.worldType : null,
        timeToLive: data.timeToLive,
        deletionDate: null,
        shutdownDate: null,
        shutdown: false,
        canBeDeleted: true,
        serverFilesZiped: null
      })
    )
    .catch((e) => {
      console.error(e);
      throw new Error('Failed to create server record');
    });

  const serverFolderPath = `servers/${record.id}`;
  const serverFilesPath = `${serverFolderPath}/server-files`;
  fs.mkdirSync(serverFilesPath, { recursive: true });

  if (data.icon) fs.writeFileSync(`${serverFilesPath}/icon.png`, Buffer.from(await data.icon.arrayBuffer()));
  else fs.copyFileSync('src/assets/default-server-icon.png', `${serverFilesPath}/icon.png`);

  if (data.whitelist.length > 0) fs.writeFileSync(`${serverFilesPath}/whitelist.json`, JSON.stringify(data.whitelist));
  if (data.ops.length > 0) fs.writeFileSync(`${serverFilesPath}/ops.json`, JSON.stringify(data.ops));
  if (data.bannedPlayers.length > 0) fs.writeFileSync(`${serverFilesPath}/banned-players.json`, JSON.stringify(data.bannedPlayers));

  if (data.serverProperties) {
    const serverProperties = await data.serverProperties.text();
    fs.writeFileSync(`${serverFilesPath}/server.properties`, serverProperties);
  }

  /* 
  TODO: Files to create
  - docker-compose.yml
  - server.properties if not null
  - extract world if source is url
  */

  // Docker compose file
  const dockerCompose = `version: "3.9"
services:
  minecraft:
    image: itzg/minecraft-server
    ports:
      - "${port}:25565"
    volumes:
      - ./server-files:/data
    environment:
      USE_AIKAR_FLAGS: "true"
      EULA: "true"
      MEMORY: "2G"

      ${
        data.serverProperties
          ? `OVERRIDE_SERVER_PROPERTIES: "true"
      SKIP_SERVER_PROPERTIES: "true"`
          : ''
      }

      TYPE: "${up(data.serverSoftware)}"
      VERSION: "${data.gameVersion}"
      MOTD: "${data.motd}"
      ICON: "/data/icon.png"
      OVERRIDE_ICON: "true"
      
      DIFFICULTY: "${up(data.difficulty)}"
      MODE: "${data.gamemode}"
      MAX_PLAYERS: "${data.maxPlayers}"
      ALLOW_NETHER: "${data.allowNether}"
      ENABLE_COMMAND_BLOCK: "${data.enableCommandBlock}"
      HARDCORE: "${data.hardcore}"
      PVP: "${data.enablePVP}"
      ALLOW_FLIGHT: "true"
      
      SPAWN_PROTECTION: "0"
      VIEW_DISTANCE: "${data.viewDistance}"
      SIMULATION_DISTANCE: "${data.simulationDistance}"

      SEED: "${data.worldCreator === WorldCreationMethod.New ? data.worldSeed : ''}"
      LEVEL_TYPE: "${data.worldCreator === WorldCreationMethod.New ? data.worldType : ''}"
      ${
        data.worldCreator === WorldCreationMethod.New && data.worldType === WorldType.Flat
          ? (() => {
              if (!data.superflatLayers) return '';
              return `GENERATOR_SETTINGS: "{layers:${data.superflatLayers}}"`;
            })()
          : ''
      }

      EXISTING_WHITELIST_FILE: "SKIP"
      EXISTING_OPS_FILE: "SKIP"
      EXISTING_BANNED_PLAYERS_FILE: "SKIP"

      ENABLE_AUTOPAUSE: "true"
      ${data.timeToLive === TimeToLive['12 hr Inactivity'] ? 'AUTOPAUSE_TIMEOUT_EST: "7200"' : ''}
      ${data.timeToLive === TimeToLive['24 hr Inactivity'] ? 'AUTOPAUSE_TIMEOUT_EST: "14400"' : ''}
      ${data.timeToLive === TimeToLive['1 Day'] ? 'AUTOPAUSE_TIMEOUT_INIT: "86400"' : ''}
      ${data.timeToLive === TimeToLive['7 Days'] ? 'AUTOPAUSE_TIMEOUT_INIT: "259200"' : ''}

    restart: "no"
    healthcheck:
      test: mc-health
      start_period: 1m
      interval: 5s
      retries: 20
`;

  fs.writeFileSync(`${serverFolderPath}/docker-compose.yml`, dockerCompose);

  // Temporarily disabled
  // addServerRecords(data.subdomain, port);

  // Start the mc server's docker-compose file
  startCompose(record.id);

  return record;
}