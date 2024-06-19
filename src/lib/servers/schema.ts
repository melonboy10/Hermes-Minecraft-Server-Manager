import { env as publicENV } from '$env/dynamic/public';
import { randomWord } from '$lib';
import { Difficulty, Gamemode, ServerSoftware, ServerSoftwareOptions, TimeToLive, WorldCreationMethod, WorldType } from '$lib/database/types';
import { z } from 'zod';

export const ServerCreationSchema = z
  .object({
    title: z.string().min(3).max(63),
    subdomain: z
      .string()
      .min(3)
      .max(63)
      .refine((v) => /^[a-z0-9-]+$/.test(v), { message: 'Invalid characters, All lowercase or dashes with no spaces' })
      .or(z.literal(''))
      .transform((v) => (v ? v.toLowerCase() : randomWord())),
    icon: z.instanceof(File).optional(),
    motd: z
      .string()
      .transform((s) => (s ? s : 'A Hermes Minecraft Server'))
      .default('A Hermes Minecraft Server'),
    serverSoftware: z.nativeEnum(ServerSoftware),
    gameVersion: z.string(),

    timeToLive: z.nativeEnum(TimeToLive).default(TimeToLive['12 hr']),
    eula: z.literal(true).or(z.literal('true')),

    // resourcePack: z.instanceof(File).optional(),
    resourcepackURL: z.string().optional(),
    datapackURL: z.string().optional(),
    mods: z.instanceof(File).array().optional(),
    plugins: z.instanceof(File).array().optional()
  })
  .refine(
    (data) => {
      const serverSoftware = ServerSoftwareOptions[data.serverSoftware];
      if (!serverSoftware) return false;

      if (data.mods && !serverSoftware.modsUpload) return false;
      if (data.plugins && !serverSoftware.pluginsUpload) return false;

      return serverSoftware.versions.flat().includes(data.gameVersion);
    },
    { message: 'Invalid game version for software' }
  )
  .and(
    z.discriminatedUnion('worldCreator', [
      z.object({
        worldCreator: z.literal(WorldCreationMethod.Source),
        worldSourceURL: z.string().url().optional(),
        worldSource: z.instanceof(File).optional()
      }),
      z.object({
        worldCreator: z.literal(WorldCreationMethod.New),
        worldSeed: z.string().default(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + ''),
        worldType: z.nativeEnum(WorldType),
        superflatLayers: z
          .string()
          .optional()
          .transform((v) => (v ? JSON.parse(v) : []))
          .pipe(
            z
              .object({
                block: z.string(),
                height: z.number()
              })
              .strip()
              .array()
              .default([])
          )
      })
    ])
  )
  .and(
    z.object({
      maxPlayers: z.coerce.number().min(1).max(50).default(10),
      difficulty: z.nativeEnum(Difficulty).default(Difficulty.Normal),
      gamemode: z.nativeEnum(Gamemode).default(Gamemode.Survival),

      viewDistance: z.coerce.number().min(1).max(20).default(16),
      simulationDistance: z.coerce.number().min(1).max(20).default(10),

      allowNether: z.coerce.boolean().default(true), // ASSUMED WORKING
      hardcore: z.coerce.boolean().default(false), // ASSUMED WORKING
      enableCommandBlock: z.coerce.boolean().default(true), // UNTESTED
      enablePVP: z.coerce.boolean().default(true), // ASSUMED WORKING

      whitelist: z
        .string()
        .transform((v) => (v.trim() ? JSON.parse(v) : []))
        .pipe(
          (() => {
            const pipeType = z
              .object({
                name: z.string()
              })
              .strip()
              .array();
            if (publicENV.PUBLIC_REQUIRE_WHITELIST) return pipeType;
            else return pipeType.default([]);
          })()
        )
        .transform((v) => v.map((e) => e.name)),
      ops: z
        .string()
        .transform((v) => (v.trim() ? JSON.parse(v) : []))
        .pipe(
          z
            .object({
              // uuid: z.string(),
              name: z.string()
              // level: z.number().default(4),
              // bypassesPlayerLimit: z.coerce.boolean().default(true)
            })
            .strip()
            .array()
            .default([])
        )
        .transform((v) => v.map((e) => e.name)),
      // TODO: UNUSED
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
        )
        .optional(),

      serverProperties: z.instanceof(File).optional()
    })
  );
