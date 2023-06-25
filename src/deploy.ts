import fs from 'fs-extra';
import { NodeSSH, Config as SSHConfig } from 'node-ssh';
import prompts from 'prompts';
import { Config, Deploy, Local, Server } from './config';
import { error, getTime, info, resolvePath, success } from '@/utils';
import archiver from 'archiver';

let SSH: NodeSSH | null = null;

/**
 * Create SSH connection instance
 */
export function createSSHConnection(): NodeSSH {
  return (SSH = new NodeSSH());
}

/**
 * Select the deployment environment
 * @param deploy List of deployment environments in the config file
 */
export function selectDeploymentEnvironment(deploy: Deploy[]): Promise<Deploy> {
  return new Promise((resolve, reject) => {
    (async () => {
      const selection = await prompts({
        type: 'select',
        name: 'selectedConfig',
        message: 'Please select a deployment environment:',
        choices: deploy.map((item, index) => ({
          title: `${item.server.name}`,
          value: index,
        })),
      });

      const selectedServer = deploy[selection.selectedConfig];

      if (selectedServer) {
        resolve(selectedServer);
      } else {
        reject();
      }
    })();
  });
}


/**
 * Get the deployment environment from the config file
 * @param deploy List of deployment environments in the config file
 */
export async function getDeploymentConfig({
  deploy,
}: Config): Promise<Deploy[] | undefined> {
  if (!deploy || deploy.length <= 0) {
    error('Please configure the deploy field in the configuration file');
    return;
  }

  try {
    const localKeys = ['buildCommand', 'distDir', 'distZip'];
    const serverKeys = [
      'name',
      'host',
      'port',
      'username',
      'password',
      'distDir',
      'distZipName',
      'backup',
    ];

    const configError = deploy.some((item) => {
      const localKeys = Object.keys(item.local);
      const serverKeys = Object.keys(item.server);

      const hasAllLocalKey = localKeys.every((item) =>
        localKeys.includes(item)
      );
      const hasAllServerKey = serverKeys.every((item) =>
        serverKeys.includes(item)
      );
      return !hasAllLocalKey || !hasAllServerKey;
    });

    // Configuration item error
    if (configError) {
      info(
        `Fields required for local: {${localKeys.join(
          ', '
        )}}, fields required for server: {${serverKeys.join(', ')}}\n`
      );
      return;
    }
  } catch (err: any) {
    error(err);
  }
  return deploy;
}

/**
 * Compress local build files
 * @param localConfig Local configuration
 * @param next Optional callback function
 */
export async function compressLocalBuildFiles(
  localConfig: Local,
  next?: (...data: any[]) => void
): Promise<void> {
  try {
    const { distDir, distZip } = localConfig;
    const dist = resolvePath(process.cwd(), distDir);

    if (!fs.existsSync(dist)) {
      error(`Compression failed!`);
      error(
        `The packaging path [local.distDir] configuration is incorrect! ${dist} does not exist!\n`
      );
      return;
    }

    info('Compressing...');

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    archive.directory(dist, false);

    const output = fs.createWriteStream(resolvePath(process.cwd(), distZip));

    archive.pipe(output);
    await archive.finalize();

    success('Compression complete!');
    if (next) next();
  } catch (err) {
    error(`Compression failed! \n error:${JSON.stringify(err)}`);
  }
}

/**
 * Execute command on server via SSH
 * @param cmd Shell command to be executed
 * @param cwd Command execution path
 */
async function executeCommandOnServer(cmd: string, cwd: string): Promise<void> {
  await SSH?.execCommand(cmd, {
    cwd,
    onStderr(chunk) {
      error(`${cmd}, stderrChunk, ${chunk.toString('utf8')}`);
    },
  });
}

/**
 * Connect to the server
 * @param params Parameters required for server connection, including hostname, port, username, and password
 */
async function establishServerConnection(params: SSHConfig): Promise<void> {
  success('Connecting to server...');
  await SSH?.connect(params)
    .then(() => {
      success('Server connection successful!');
    })
    .catch((err) => {
      error('Server connection failed!');
      error(err);
      process.exit(1);
    });
}

/**
 * Deploy project
 * @param localConfig Local configuration
 * @param serverConfig Server configuration
 * @param next Optional callback function
 */
export async function deployProject(
  localConfig: Local,
  serverConfig: Server,
  next?: (...data: any[]) => void
): Promise<void> {
  const {
    host,
    port,
    username,
    password,
    distDir,
    distZipName,
    backup,
    command,
  } = serverConfig;

  if (!host || !username || !password || !distDir || !distZipName) {
    error(`deploy field configuration is incorrect!`);
    process.exit(1);
  }
  if (!distDir.startsWith('/') || distDir === '/') {
    error(
      `[server.distDir: ${distDir}] needs to be an absolute path, and cannot be the root directory "/"`
    );
    process.exit(1);
  }

  // Connect to server
  await establishServerConnection({ host, port, username, password });

  success('Deploying project...');

  try {
    // Before put file command
    if (command.beforePutFile.command) {
      await executeCommandOnServer(command.beforePutFile.command, distDir);
    }

    // Upload compressed project files
    await SSH?.putFile(
      resolvePath(process.cwd(), localConfig.distZip),
      `${distDir}/${distZipName}.zip`
    ).catch((err) => {
      console.log('[error]putFile: ', err);
    });

    // After put file command
    if (command.afterPutFile.command) {
      await executeCommandOnServer(command.afterPutFile.command, distDir);
    }

    if (backup) {
      // Before backup command
      if (command.beforeBackup.command) {
        await executeCommandOnServer(command.beforeBackup.command, distDir);
      }

      // Backup and rename the original project files
      await executeCommandOnServer(
        `mv ${distZipName} ${distZipName}_${getTime()}`,
        distDir
      );

      // After backup command
      if (command.afterBackup.command) {
        await executeCommandOnServer(command.afterBackup.command, distDir);
      }
    } else {
      // Before remove old file command
      if (command.beforeRmOldFile.command) {
        await executeCommandOnServer(command.beforeRmOldFile.command, distDir);
      }

      // Delete original project files
      await executeCommandOnServer(`rm -rf ${distZipName}`, distDir).catch(
        (err) => {
          console.log('[error]rmOldFile: ', err);
        }
      );

      // After remove old file command
      if (command.afterRmOldFile.command) {
        await executeCommandOnServer(command.afterRmOldFile.command, distDir);
      }
    }

    // Modify file permissions
    await executeCommandOnServer(`chmod 777 ${distZipName}.zip`, distDir).catch(
      (err) => {
        console.log('[error]chmod: ', err);
      }
    );

    // Before unzip command
    if (command.beforeUnzip.command) {
      await executeCommandOnServer(command.beforeUnzip.command, distDir);
    }

    // Unzip uploaded project files
    await executeCommandOnServer(
      `unzip ./${distZipName}.zip -d ${distZipName}`,
      distDir
    ).catch((err) => {
      console.log('[error]unzip: ', err);
    });

    // After unzip command
    if (command.afterUnzip.command) {
      await executeCommandOnServer(command.afterUnzip.command, distDir);
    }

    // Delete compressed project files on the server
    await executeCommandOnServer(`rm -rf ./${distZipName}.zip`, distDir).catch(
      (err) => {
        console.log('[error]rmzip: ', err);
      }
    );

    // Success command
    if (command.success.command) {
      await executeCommandOnServer(command.success.command, distDir);
    }

    success('Deployment successful');

    await SSH?.dispose();
    SSH = null;

    info(`Project path: ${distDir}`);
    info(`Completion time: ${new Date()}`);
    info('');
    if (next) next();
  } catch (err) {
    error('Deployment failed');
    error(`catch: ${err}`);
    process.exit(1);
  }
}

// 压缩assets并且部署到服务器
export async function assetsCompressAndDeploy(config: Config) {
  await createSSHConnection();
  const deployConfig = await getDeploymentConfig(config);
  if (!deployConfig) {
    error('Configruation not found');
    return;
  }

  const finalConfig = await selectDeploymentEnvironment(deployConfig);
  if (!finalConfig) {
    error('Configruation not found');
    return;
  }

  info(`Starting deployment`);

  await compressLocalBuildFiles(finalConfig.local);
  await deployProject(finalConfig.local, finalConfig.server);
  info(`Deployment complete`);
  process.exit();
}
