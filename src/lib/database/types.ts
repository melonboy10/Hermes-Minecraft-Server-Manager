import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Backups = 'backups',
  Servers = 'servers',
  Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;
export type FileNameString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

export type UserRecord = {
  name?: string;
  avatar?: string;
};

export type BackupRecord = {
  file: FileNameString;
  name: string;
  serverID: string;
  fileSize: number;
};

export type ServerRecord = {
  port: number;
  icon: FileNameString;
  title: string;
  subdomain: string;

  serverSoftware: ServerSoftware;
  gameVersion: string;
  worldType: WorldType | 'source';

  cloudflareCNAMERecordID: string;
  cloudflareSRVRecordID: string;

  timeToLive: TimeToLive;

  state: ServerState;
  startDate: IsoDateString | null;
  shutdownDate: IsoDateString | null;
  deletionDate: IsoDateString | null;
  canBeDeleted: boolean;
  serverFilesMissing: boolean;
};

// Response types include system fields and match responses from the PocketBase API
export type BackupResponse<Texpand = unknown> = Required<BackupRecord> & BaseSystemFields<Texpand>;
export type ServerResponse<Texpand = unknown> = Required<ServerRecord> & BaseSystemFields<Texpand>;
export type UserResponse<Texpand = unknown> = Required<UserRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  backups: BackupRecord;
  servers: ServerRecord;
  users: UserRecord;
};

export type CollectionResponses = {
  backups: BackupResponse;
  servers: ServerResponse;
  users: UserResponse;
};

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'backups'): RecordService<BackupResponse>;
  collection(idOrName: 'servers'): RecordService<ServerResponse>;
  collection(idOrName: 'users'): RecordService<UserResponse>;
};

export enum TimeToLive {
  '12 hr' = '12_hr',
  '1 Day' = '1_day',
  '7 Days' = '7_days'
}

export const TimeToLiveMiliseconds: Record<TimeToLive, number> = {
  '12_hr': 43_200_000,
  '1_day': 86_400_000,
  '7_days': 604_800_000
};

export enum ServerSoftware {
  'Vanilla' = 'vanilla',
  // 'Forge' = 'forge',
  'Fabric' = 'fabric',
  // 'Quilt' = 'quilt',
  // 'Spigot' = 'spigot',
  'Paper' = 'paper'
  // 'Custom' = 'custom'
}

export const ServerSoftwareOptions: Record<
  ServerSoftware,
  {
    newWorld: boolean;
    fromSource: boolean;
    modsUpload: boolean;
    pluginsUpload: boolean;
    versions: string[][];
  }
> = {
  [ServerSoftware.Vanilla]: {
    newWorld: true,
    fromSource: true,
    modsUpload: false,
    pluginsUpload: false,
    versions: [
      //
      ['SNAPSHOT'],
      ['1.8', '1.8.1', '1.8.2', '1.8.3', '1.8.4', '1.8.5', '1.8.6', '1.8.7', '1.8.8', '1.8.9'],
      // ['1.9', '1.9.1', '1.9.2', '1.9.3', '1.9.4'],
      // ['1.10', '1.10.1', '1.10.2'],
      // ['1.11', '1.11.1', '1.11.2'],
      ['1.12', '1.12.1', '1.12.2'],
      // ['1.13', '1.13.1', '1.13.2'],
      // ['1.14', '1.14.1', '1.14.2', '1.14.3', '1.14.4'],
      // ['1.15', '1.15.1', '1.15.2'],
      // ['1.16', '1.16.1', '1.16.2', '1.16.3', '1.16.4', '1.16.5'],
      // ['1.17', '1.17.1'],
      ['1.18', '1.18.1', '1.18.2'],
      ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
      ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
    ]
  },
  // [ServerSoftware.Forge]: {
  //   newWorld: true,
  //   fromSource: false,
  //   modsUpload: true,
  //   pluginsUpload: false,
  //   versions: [
  //     ['1.16', '1.16.1', '1.16.2', '1.16.3', '1.16.4', '1.16.5'],
  //     ['1.17', '1.17.1'],
  //     ['1.18', '1.18.1', '1.18.2'],
  //     ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
  //     ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
  //   ]
  // },
  [ServerSoftware.Fabric]: {
    newWorld: true,
    fromSource: false,
    modsUpload: false,
    pluginsUpload: false,
    versions: [
      ['1.16', '1.16.1', '1.16.2', '1.16.3', '1.16.4', '1.16.5'],
      ['1.17', '1.17.1'],
      ['1.18', '1.18.1', '1.18.2'],
      ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
      ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
    ]
  },
  // [ServerSoftware.Quilt]: {
  //   newWorld: true,
  //   fromSource: false,
  //   modsUpload: true,
  //   pluginsUpload: false,
  //   versions: [
  //     ['1.18', '1.18.1', '1.18.2'],
  //     ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
  //     ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
  //   ]
  // },
  // [ServerSoftware.Spigot]: {
  //   newWorld: true,
  //   fromSource: false,
  //   modsUpload: false,
  //   pluginsUpload: true,
  //   versions: [
  //     ['1.16', '1.16.1', '1.16.2', '1.16.3', '1.16.4', '1.16.5'],
  //     ['1.17', '1.17.1'],
  //     ['1.18', '1.18.1', '1.18.2'],
  //     ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
  //     ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
  //   ]
  // },
  [ServerSoftware.Paper]: {
    newWorld: true,
    fromSource: false,
    modsUpload: false,
    pluginsUpload: false,
    versions: [
      ['1.16', '1.16.1', '1.16.2', '1.16.3', '1.16.4', '1.16.5'],
      ['1.17', '1.17.1'],
      ['1.18', '1.18.1', '1.18.2'],
      ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4'],
      ['1.20', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.6']
    ]
  }
};

export enum WorldCreationMethod {
  'New' = 'new',
  'Source' = 'source'
}

export enum ServerState {
  'Creating' = 'creating',
  'Running' = 'running',
  'Stopped' = 'stopped',
  'Paused' = 'paused'
}

export enum WorldType {
  'Normal' = 'normal',
  'Large Biomes' = 'large_biomes',
  'Flat' = 'flat',
  'Amplified' = 'amplified'
}

export enum Difficulty {
  'Peaceful' = 'peaceful',
  'Easy' = 'easy',
  'Normal' = 'normal',
  'Hard' = 'hard'
}

export enum Gamemode {
  'Survival' = 'survival',
  'Creative' = 'creative',
  'Adventure' = 'adventure',
  'Spectator' = 'spectator'
}
