import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import prompts from 'prompts';
import * as glob from 'glob';

export interface Local {
  buildCommand: string;
  distDir: string;
  distZip: string;
}
export interface Command {
  command: string;
}

interface Manifest {
  version: {
    root: string;
  };
}

export interface Server {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  distDir: string;
  distZipName: string;
  backup: boolean;
  command: {
    beforePutFile: Command;
    afterPutFile: Command;
    beforeBackup: Command;
    afterBackup: Command;
    beforeRmOldFile: Command;
    afterRmOldFile: Command;
    beforeUnzip: Command;
    afterUnzip: Command;
    success: Command;
  };
}

export interface Deploy {
  local: Local;
  server: Server;
}

interface Task {
  root?: string;
  command?: string;
  type?: string;
}

export interface Config {
  project: {
    root: string;
  };
  cocos: {
    editor: string;
    iosBuildConfig: string;
    iosBuildCommand: string;
    androidBuildConfig: string;
    androidBuildCommand: string;
  };
  manifest: Manifest;
  fastlane: {
    root: string;
    settingRoot: string;
  };
  deploy: Deploy[];
  tasks: {
    [key: string]: Task;
  };
  pipelines: {
    [key: string]: string[];
  };
}

/**
 * Parses a reference and replaces it with the corresponding value in the context.
 * @param {string} ref - Reference string
 * @param {any} context - Context object
 * @returns {any} - Parsed value
 */
function parseReference(ref: string, context: any): any {
  const path = ref.slice(1, -1).split('.');

  // Special handling for process.cwd
  if (path.join('.') === 'process.cwd') {
    return process.cwd();
  }

  let obj = context;
  for (const part of path) {
    if (part in obj) {
      obj = obj[part];
    } else {
      throw new Error(`Invalid reference: ${ref}`);
    }
  }
  return obj;
}

/**
 * Recursively replaces references in an object with the corresponding values from the context.
 * @param {any} obj - Object to replace references in
 * @param {any} context - Context object
 */
function replaceReferencesInObject(obj: any, context: any) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      const match = obj[key].match(/{.*?}/g);
      if (match) {
        for (const ref of match) {
          const value = parseReference(ref, context);
          obj[key] = path.normalize(obj[key].replace(ref, value));
        }
      }
    } else if (typeof obj[key] === 'object') {
      replaceReferencesInObject(obj[key], context);
    }
  }
}

/**
 * Sets default values in the data object if they are not present.
 * @param {any} data - Data object
 * @param {string} key - Key to set default value for
 * @param {any} defaultValue - Default value
 */
function setDefaultValues(data: any, key: string, defaultValue: any) {
  if (!data[key]) {
    data[key] = defaultValue;
  }
}

/**
 * Parses a YAML configuration file and returns the configuration object.
 * @param {string} filePath - Path to the YAML configuration file
 * @returns {Promise<Config>} - Promise that resolves to the configuration object
 */
export async function parseConfigFile(filePath: string): Promise<Config> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, fileContents) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const data = yaml.load(fileContents) as Config;

        setDefaultValues(data, 'project', { root: process.cwd() });
        setDefaultValues(data.project, 'root', process.cwd());

        setDefaultValues(data, 'fastlane', { root: '', settingRoot: '' });
        setDefaultValues(
          data.fastlane,
          'root',
          '{project.root}/build/ios/proj'
        );
        setDefaultValues(
          data.fastlane,
          'settingRoot',
          '{project.root}/pack_configs'
        );

        setDefaultValues(data, 'manifest', {
          version: {
            root: '{project.root}/assets/version.manifest',
          },
        });

        setDefaultValues(data, 'tasks', {
          fastlaneForceMatch: {
            root: '{fastlane.root}',
            command: 'fastlane force_match',
          },
          fastlaneBuildIPA: {
            root: '{fastlane.root}',
            command: 'fastlane beta',
          },
          updateManifestVersion: {
            type: 'updateManifestVersion',
          },
          cocosBuild: {
            type: 'cocosBuild',
          },
        });

        setDefaultValues(data, 'pipelines', {
          cocosBuild: ['cocosBuild'],
          ipa: ['fastlaneBuildIPA'],
          version: ['updateManifestVersion'],
          base: [
            'updateManifestVersion',
            'cocosBuild',
            'cocosBuild',
            'fastlaneBuildIPA',
          ],
          hotUpdate: ['updateManifestVersion', 'cocosBuild', ''],
          forceMatch: ['fastlaneForceMatch'],
        });

        // Replace references in the fastlane object
        replaceReferencesInObject(data.fastlane, data);

        // Replace references in the manifest, tasks, and pipelines objects
        replaceReferencesInObject(data.manifest, data);
        replaceReferencesInObject(data.tasks, data);
        replaceReferencesInObject(data.pipelines, data);

        replaceReferencesInObject(data, data);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Prompts the user to select a configuration file from the current working directory.
 * @param {string} cwd - Current working directory (default is process.cwd())
 * @returns {Promise<string>} - Promise that resolves to the path of the selected file
 */
export async function selectConfigFile(cwd: string = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    try {
      // Get all lime.*.yaml files in the specified directory
      const files = glob.sync('lime.*.yaml', { cwd: cwd });

      // Convert file names into choices that prompts can use
      const choices = files.map((file) => ({
        title: file,
        value: path.join(cwd, file),
      }));

      // Use prompts for selection
      prompts({
        type: 'select',
        name: 'file',
        message: 'Please select a configuration file',
        choices: choices,
      })
        .then((response) => {
          resolve(response.file);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}
