import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { error as errorMessage } from '@/utils/colors';

/**
 * Run a shell command.
 * @param {string} command - The command to run.
 * @param {SpawnOptionsWithoutStdio} options - Options for the child_process.spawn function.
 * @return {Promise<void>} - A promise that resolves when the command successfully exits, or rejects if there is an error.
 */
export function runCommand(
  command: string,
  options: SpawnOptionsWithoutStdio = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    options.shell = true; // Parse command as a shell command
    const child = spawn(command, options);

    let output = '';

    child.stdout?.on('data', (data) => {
      output += data;
      process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      output += data;
      process.stderr.write(data);
    });

    child.on('error', (error) => {
      errorMessage(`Spawn error: ${error}`);
      reject(error);
    });

    child.on('exit', (code) => {
      // TODO: !output.includes('build success') cocos packaging exit code is not 0, temporarily compatible
      if (code !== 0 && !output.includes('build success')) {
        reject(
          new Error(
            `Command "${command}" exited with non-zero status code: ${code}`
          )
        );
      } else {
        resolve();
      }
    });
  });
}
