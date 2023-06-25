import { exec } from 'child_process';
import { error as errorMessage, info } from '@/utils/colors';

/**
 * Clone a remote git repository to a local directory.
 * If the operation does not complete within 15 seconds, kill the process and display a message.
 * @param {string} gitUrl - The URL of the remote git repository.
 * @param {string} targetDirectory - The local directory to which the repository is to be cloned.
 */
export function cloneRepo(
  gitUrl: string,
  targetDirectory: string = process.cwd(),
): void {
  if (!gitUrl) {
    errorMessage('Please pass the gitUrl parameter.');
    return;
  }

  const command = `git clone ${gitUrl}`;

  const cloning = exec(
    command,
    { cwd: targetDirectory },
    (error, stdout, stderr) => {
      if (error) {
        errorMessage(`Execution error: ${error}`);
        return;
      }
      info(`stdout: ${stdout}`);
      errorMessage(`stderr: ${stderr}`);
    },
  );

  // Set a timeout for the cloning operation.
  const timer = setTimeout(() => {
    cloning.kill();
    info(
      'The cloning operation took longer than expected. You can choose to manually download the repository code and place it in the project root directory.',
    );
  }, 15000);

  // Clear the timeout if the cloning operation completes without timing out.
  cloning.on('exit', () => clearTimeout(timer));
}
