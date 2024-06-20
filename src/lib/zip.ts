import { ResultAsync } from 'neverthrow';
import childProcess from 'node:child_process';
import path from 'node:path';
import { CustomError } from './types';

interface CommandResult {
  exitCode: number;
  err: string;
  out: string;
  command: string;
}

function command(command: string, args: string[], cwd: string): Promise<CommandResult> {
  return new Promise((resolve, reject): void => {
    const childProc = childProcess.spawn(command, args, {
      cwd,
      timeout: 1000 * 30 // 30 seconds tops
    });

    childProc.on('error', (err): void => {
      reject(err);
    });

    const result: CommandResult = {
      exitCode: -1,
      err: '',
      out: '',
      command: childProc.spawnargs.join(' ')
    };

    childProc.stdout.on('data', (chunk): void => {
      result.out += chunk.toString();
    });

    childProc.stderr.on('data', (chunk): void => {
      result.err += chunk.toString();
    });

    childProc.on('exit', (exitCode): void => {
      result.exitCode = exitCode ?? -1;
      setTimeout(() => {
        // Exit code 12 from ZIP means "Nothing to do" also okay!
        if (exitCode === 0 || exitCode == 12) {
          resolve(result);
        } else {
          reject(result);
        }
      }, 500);
    });
  });
}

export async function zip(inPath: string, outPath: string, ignoreFiles: string[] = ['**/.**']) {
  // console.log('Running zip', 'zip', ['--recurse-paths', '--update', outPath, inPath, '--exclude', ...ignoreFiles]);
  return ResultAsync.fromPromise(command('zip', ['--recurse-paths', '--update', outPath, inPath, '--exclude', ...ignoreFiles], path.dirname(inPath)), (e) => CustomError.from(e, 'Failed to zip files'));
}

export async function unzip(inPath: string, outPath: string) {
  return ResultAsync.fromPromise(command('unzip', ['-o', inPath, '-d', outPath], path.dirname(inPath)), (e) => CustomError.from(e, 'Failed to unzip files'));
}
