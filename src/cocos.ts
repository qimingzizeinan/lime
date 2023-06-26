import path from 'path';
import { updateFieldsInFile } from './semver';
import { checkFileExists, copyFile, info, runCommand } from '@/utils';
import prompts from 'prompts';

/**
 * Function to select platform
 * @returns Selected platform
 */
export async function selectPlatform(): Promise<string | null> {
  const response = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Please select a platform:',
    choices: [
      { title: 'iOS', value: 'iOS' },
      { title: 'Android', value: 'Android' },
    ],
  });

  return response.platform;
}

/**
 * Function to update manifest version
 * @param currentDirectory Current directory path
 */
export async function updateManifestVersion(currentDirectory: string) {
  await updateFieldsInFile(currentDirectory, 'version.manifest');
}

/**
 * Function to build Cocos
 * @param command Command to run
 * @returns Result of command execution
 */
export async function cocosBuild(command: string) {
  return await runCommand(command);
}

/**
 * Function to check and copy YAML files
 * @param root Root directory path
 */
export async function checkAndCopyYamlFiles(root: string): Promise<void> {
  const yamlFiles = [
    'lime.local.yaml',
    'lime.development.yaml',
    'lime.production.yaml',
  ];

  const response = await prompts({
    type: 'multiselect',
    name: 'files',
    message: 'Which YAML files do you want to generate?',
    choices: yamlFiles.map((file) => ({ title: file, value: file })),
  });

  if (!response.files || response.files.length === 0) {
    info('No YAML files will be generated.');
    return;
  }

  for (const file of response.files) {
    const srcFile = path.resolve(__dirname, './yamls', file);
    const destFile = path.join(root, file);

    if (!checkFileExists(root, file)) {
      await copyFile(srcFile, destFile, `${file} has been created`);
    } else {
      info(`File ${file} already exists`);
    }
  }
}
