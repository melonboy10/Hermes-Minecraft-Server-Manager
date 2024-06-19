/**
 * SERVER UPDATE TYPES
 */

import type { Result } from 'neverthrow';
import type { IsoDateString } from './database/types';

export enum ServerUpdateType {
  ContainerDoesntExist,
  StartedServer,
  StoppedServer,
  KeepState,
  ChangeState,
  ServerTimeToLiveExpired,
  RemoveServer,
  ContainerStats
}

export type ContainerResult<T> = Promise<Result<T, CustomError>>;

export class CustomError extends Error {
  stack: string | undefined;
  cause: unknown;
  error: CustomError | undefined;

  constructor(message: string, nestedError?: CustomError, stack?: string) {
    super(message);
    this.name = this.constructor.name;
    this.stack = stack ? stack : new Error(message).stack;
    this.error = nestedError;
  }

  json(): CustomError {
    return { ...JSON.parse(JSON.stringify(this, Object.getOwnPropertyNames(this))), error: this.error?.json() };
  }

  static from(error: Error | unknown, message?: string) {
    if (error instanceof Error) {
      const newError = new CustomError(error.message, undefined, error.stack);
      newError.cause = error.cause;

      if (message != undefined) return new CustomError(message, newError);
      return newError;
    }

    return new CustomError(JSON.stringify(error, null, 2));
  }
}

// export class ServerUpdateError extends CustomError {
//   stack: string = '';
//   cause: ServerUpdateType | ContainerErrorType;

//   constructor(
//     message: string,
//     cause: ServerUpdateType,
//     readonly error?: ServerUpdateError | CloudflareError | ContainerError
//   ) {
//     super(message, { cause });
//     this.cause = cause;
//   }

//   json(): ServerUpdateError {
//     console.log(Object.getOwnPropertyNames(this));
//     console.log(JSON.stringify(this, Object.getOwnPropertyNames(this)));
//     // console.log(this.error);
//     return { ...JSON.parse(JSON.stringify(this, Object.getOwnPropertyNames(this))), error: this.error?.json() };
//   }
// }

/**
 * CLOUDFLARE TYPES
 */

export enum CloudflareErrorType {
  CreateCNAME,
  CreateSRV,
  RemoveCNAME,
  RemoveSRV
}
// export class CloudflareError extends Error {
//   constructor(message: string, cause: CloudflareErrorType) {
//     super(message, { cause });
//   }

//   json(): ServerUpdateError {
//     console.log(Object.getOwnPropertyNames(this));
//     console.log(JSON.stringify(this, Object.getOwnPropertyNames(this)));
//     // console.log(this.error);
//     return { ...JSON.parse(JSON.stringify(this, Object.getOwnPropertyNames(this))) };
//   }
// }

/**
 * DOCKER CONTAINER TYPES
 */

export enum ContainerErrorType {
  DoesntExist,
  Start,
  Stop,
  UpdateServerDB,
  ReadServerDB,
  GetLogs,
  SendCommand,
  GetPlayerCount,
  GetContainerData,
  GetContainerRunningStatus,
  GetAllServerStatuses,
  GetContainerUsageStats,
  ZipContainerFiles,
  RemoveContainer,
  Cloudflare
}

// export class ContainerError extends Error {
//   stack: string = '';
//   cause: ContainerErrorType;

//   constructor(
//     message: string,
//     cause: ContainerErrorType,
//     readonly error?: unknown
//   ) {
//     super(message, { cause });
//     this.cause = cause;
//   }

//   json(): ContainerError {
//     return JSON.parse(JSON.stringify(this, Object.getOwnPropertyNames(this)));
//   }
// }

export enum ContainerState {
  Created = 'created', // Running
  Restarting = 'restarting', // Running
  Running = 'running', // Running
  Removing = 'removing', // Running
  Paused = 'paused', // Running
  Exited = 'exited', // Stopped
  Dead = 'dead' // Stopped
}

export type ContainerData = {
  ID: string;
  Name: string;
  Command: string;
  Project: string;
  Service: string;
  State: ContainerState;
  Health: string;
  ExitCode: number;
  Publishers?: {
    URL: string;
    TargetPort: number;
    PublishedPort: number;
    Protocol: string;
  }[];
};

export type ServerBackup = {
  serverId: string;
  serverTitle: string;
  backupDate: IsoDateString;
  backupSize: number;
  backupFileName: string;
};
