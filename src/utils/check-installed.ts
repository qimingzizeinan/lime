import { execSync, spawn } from 'child_process';
import { info, error as errorMessage } from '@/utils/colors';
import * as os from 'os';
import semver from 'semver';

/**
 * Get the Ruby version installed on Windows.
 * @return {string|null} - The Ruby version or null if not installed.
 */
function getRubyVersionOnWindows() {
  try {
    const result = execSync('ruby -v');
    const fullVersion = result.toString().split(' ')[1];
    return fullVersion.split('p')[0]; // Remove 'p' and everything after it
  } catch (error) {
    return null;
  }
}

/**
 * Get the Ruby version installed on macOS.
 * @return {string|null} - The Ruby version or null if not installed.
 */
function getRubyVersionOnMac() {
  try {
    const result = execSync('ruby -v');
    const fullVersion = result.toString().split(' ')[1];
    return fullVersion.split('p')[0]; // Remove 'p' and everything after it
  } catch (error) {
    return null;
  }
}

/**
 * Check the installed Ruby version.
 */
export function checkRubyVersion() {
  const platform = os.platform();
  let version: string | null;

  if (platform === 'darwin') {
    version = getRubyVersionOnMac();
  } else if (platform === 'win32') {
    version = getRubyVersionOnWindows();
  } else {
    errorMessage('Ruby is not supported on this platform.');
    return;
  }

  if (version) {
    info(`Ruby version: ${version}`);
    if (semver.lt(version, '2.0.0')) {
      errorMessage('Ruby version is less than 2.0.0, please upgrade.');
    }
  } else {
    errorMessage('Ruby is not installed, please install it first.');
  }
}

/**
 * Check if Ruby is installed on Windows.
 * @return {boolean} - True if Ruby is installed, false otherwise.
 */
function isRubyInstalledOnWindows() {
  try {
    execSync('where ruby');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Ruby is installed on macOS.
 * @return {boolean} - True if Ruby is installed, false otherwise.
 */
function isRubyInstalledOnMac() {
  try {
    execSync('command -v ruby');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Ruby is installed.
 * @return {boolean} - True if Ruby is installed, false otherwise.
 */
export function isRubyInstalled() {
  const platform = os.platform();
  if (platform === 'darwin') {
    return isRubyInstalledOnMac();
  } else if (platform === 'win32') {
    return isRubyInstalledOnWindows();
  } else {
    return false;
  }
}

/**
 * Check the installed xcode-select version.
 */
export function checkXcodeSelect() {
  try {
    const result = execSync('xcode-select -v');
    const version = result.toString().split(' ')[2];
    info(`xcode-select version: ${version.trim()}`);
  } catch (error) {
    errorMessage(
      'xcode-select is not installed, please install it by running: \n xcode-select --install'
    );
  }
}

/**
 * Check the installed Fastlane version.
 * @return {Promise<void>}
 */
export function checkFastlane(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const fastlane = spawn('fastlane', ['-v']);

      fastlane.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }
          if (line.startsWith('fastlane')) {
            const version = line.split(' ')[1];
            if (/^\d+\.\d+\.\d+$/.test(version)) {
              info(`Fastlane version: ${version}`);
              fastlane.stdout.removeAllListeners();
              resolve();
              return;
            }
          }
        }
      });

      fastlane.stderr.on('data', (data) => {
        errorMessage(`Fastlane error: ${data}`);
        reject(new Error(`Fastlane error: ${data}`));
      });

      fastlane.on('close', (code) => {
        if (code !== 0) {
          errorMessage('Fastlane failed to execute');
          reject(new Error('Fastlane failed to execute'));
        } else {
          resolve();
        }
      });
    } catch (error) {
      errorMessage(
        'Fastlane is not installed, please install it by running: \n sudo gem install fastlane -NV'
      );
      reject(error);
    }
  });
}
