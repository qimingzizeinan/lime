import fs from 'fs-extra';
import path from 'path';
import { checkDirectory, copyDirectory, info } from '@/utils';
import prompts from 'prompts';

export async function prepareFastlaneDirectory(
  root: string,
  destPath: string,
  environment = 'development'
): Promise<void> {
  // 检查 fastlane.root 目录是否存在
  const fastlaneRootExists = await checkDirectory(root);

  if (!fastlaneRootExists) {
    // 如果不存在，创建它，包括任何必要的上级目录
    await fs.mkdir(root, { recursive: true });
  }

  const srcDir = path.resolve(root, environment);
  await copyDirectory(srcDir, destPath);
}

export async function prepareEnvironmentConfigsBeforeBuild(
  root: string
): Promise<void> {
  const srcFile = path.resolve(__dirname, './pack_configs');
  const destFile = path.join(root, './pack_configs');

  const response = await prompts({
    type: 'confirm',
    name: 'shouldCopy',
    message: 'Do you want to copy the pack_configs directory?',
    initial: true,
  });

  if (response.shouldCopy) {
    if (!(await checkDirectory(destFile))) {
      await copyDirectory(
        srcFile,
        destFile,
        `pack_configs directory has been created`
      );
    } else {
      info(`Directory pack_configs already exists`);
    }
  }
}
