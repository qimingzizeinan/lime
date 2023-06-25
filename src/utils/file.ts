import * as fs from 'fs-extra';
import * as path from 'path';
import { info } from '@/utils/colors';

/**
 * Check if a directory exists.
 * @param {string} directoryPath - The path of the directory to check.
 * @return {Promise<boolean>} - True if the directory exists, false otherwise.
 */
export async function checkDirectory(directoryPath: string): Promise<boolean> {
  try {
    await fs.access(directoryPath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a file exists in the given directory.
 * @param {string} directory - The directory to check in.
 * @param {string} filename - The name of the file to check for.
 * @return {boolean} - True if the file exists, false otherwise.
 */
export function checkFileExists(directory: string, filename: string): boolean {
  const filePath = path.join(directory, filename);
  return fs.existsSync(filePath);
}

/**
 * Copy a directory to another location.
 * @param {string} srcDir - The source directory.
 * @param {string} destDir - The destination directory.
 * @param {string} [message=`Directory ${srcDir} was copied to ${destDir}`] - The message to log on success.
 * @return {Promise<void>}
 */
export async function copyDirectory(
  srcDir: string,
  destDir: string,
  message = `Directory ${srcDir} was copied to ${destDir}`,
): Promise<void> {
  try {
    await fs.copy(srcDir, destDir);
    info(message);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Copy a file to another location.
 * @param {string} srcFile - The source file.
 * @param {string} destFile - The destination file.
 * @param {string} [message=`File ${srcFile} was copied to ${destFile}`] - The message to log on success.
 * @return {Promise<void>}
 */
export async function copyFile(
  srcFile: string,
  destFile: string,
  message = `File ${srcFile} was copied to ${destFile}`,
): Promise<void> {
  try {
    await fs.copy(srcFile, destFile);
    info(message);
  } catch (err) {
    console.error(err);
  }
}
