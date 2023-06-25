import { readFileSync, writeFileSync, existsSync } from 'fs';
import prompts from 'prompts';
import semver from 'semver';
import * as path from 'path';
import { error, success } from '@/utils';

/**
 * Function to build the file path
 * @param {string} currentDirectory - The current directory
 * @param {string} fileName - The name of the file
 * @returns {string} The full path of the file
 */
function buildFilePath(currentDirectory: string, fileName: string) {
  return path.join(currentDirectory, fileName);
}

/**
 * Function to check if the file exists
 * @param {string} currentDirectory - The current directory
 * @param {string} fileName - The name of the file
 * @returns {boolean} Whether the file exists or not
 */
function isFileExist(currentDirectory: string, fileName: string) {
  if (!existsSync(buildFilePath(currentDirectory, fileName))) {
    error(`No ${fileName} found in the current directory`);
    return false;
  }
  return true;
}

/**
 * Function to get the new version
 * @param {string} currentVersion - The current version
 * @returns {Promise<string>} The new version
 */
async function getNewVersion(currentVersion: string) {
  const versions = ['patch', 'minor', 'major'].map((type) => ({
    title: `${semver.inc(
      currentVersion,
      type as semver.ReleaseType,
    )} (${type})`,
    value: semver.inc(currentVersion, type as semver.ReleaseType),
  }));

  versions.unshift({
    title: 'custom',
    value: 'custom',
  });

  const { newVersion } = await prompts({
    type: 'select',
    name: 'newVersion',
    message: 'Please select a new version number:',
    choices: versions,
  });

  if (newVersion === 'custom') {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: 'Please enter a new version number:',
      validate: (input) =>
        semver.valid(input) && semver.gt(input, currentVersion)
          ? true
          : 'The version number must be valid and greater than the current version number.',
    });
    return response.value;
  }

  return newVersion;
}

/**
 * Function to get the new value for a field
 * @param {string} field - The field to get the new value for
 * @returns {Promise<string>} The new value
 */
async function getNewValue(field: string) {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `Please enter a new value for ${field}:`,
  });
  return response.value;
}

/**
 * Function to update fields in a file
 * @param {string} currentDirectory - The current directory (default is process.cwd())
 * @param {string} fileName - The name of the file (default is 'package.json')
 * @param {Array} fields - The fields to update (default is [{ field: 'version', type: 'select' }])
 * @returns {Promise<void>}
 */
export async function updateFieldsInFile(
  currentDirectory: string = process.cwd(),
  fileName = 'package.json',
  fields = [{ field: 'version', type: 'select' }],
) {
  if (!isFileExist(currentDirectory, fileName)) {
    return;
  }

  const fileContent = JSON.parse(
    readFileSync(buildFilePath(currentDirectory, fileName), 'utf-8'),
  );

  for (const { field, type } of fields) {
    let newValue;
    if (type === 'select') {
      const currentVersion = fileContent[field];
      const shouldUpgrade = await prompts({
        type: 'confirm',
        name: 'value',
        message: `The current version number is ${currentVersion}. Would you like to upgrade it?`,
      });

      if (!shouldUpgrade.value) {
        console.log('The version number upgrade has been canceled.');
        continue;
      }

      newValue = await getNewVersion(currentVersion);
    } else if (type === 'input') {
      newValue = await getNewValue(field);
    }

    fileContent[field] = newValue;
  }

  writeFileSync(
    buildFilePath(currentDirectory, fileName),
    JSON.stringify(fileContent, null, 2),
  );

  success('Successfully updated the file.');
}
