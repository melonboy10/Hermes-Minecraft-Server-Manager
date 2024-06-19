import { ResultAsync } from 'neverthrow';
import childProcess, { type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { CustomError } from './types';

interface CommandResult {
  exitCode: number;
  err: string;
  out: string;
  command: string;
}

function command(childProc: ChildProcessWithoutNullStreams): Promise<CommandResult> {
  return new Promise((resolve, reject): void => {
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

export function zip(inPath: string, outPath: string, ignoreFiles: string[] = ['**/.**']) {
  // console.log('Running zip', 'zip', ['--recurse-paths', '--update', outPath, inPath, '--exclude', ...ignoreFiles]);
  return ResultAsync.fromPromise(
    command(
      childProcess.spawn('zip', ['--recurse-paths', '--update', outPath, inPath, '--exclude', ...ignoreFiles], {
        cwd: path.dirname(inPath),
        timeout: 1000 * 30 // 30 seconds tops
      })
    ),
    (e) => CustomError.from(e, 'Failed to zip files')
  );
}

export function unzip(inPath: string, outPath: string) {
  return command(
    childProcess.spawn('unzip', ['-o', inPath, '-d', outPath], {
      cwd: path.dirname(inPath),
      timeout: 1000 * 30 // 30 seconds tops
    })
  );
}
