import { info, error, runCommand, success } from '@/utils';
import { cocosBuild, selectPlatform } from './cocos';
import { Config } from './config';
import { updateFieldsInFile } from './semver';
import prompts from 'prompts';
import { prepareFastlaneDirectory } from './fastlane';
import { assetsCompressAndDeploy } from './deploy';

// Function to select a pipeline from available options
export async function selectPipeline(config: Config): Promise<string | null> {
  const choices = Object.keys(config.pipelines).map((key) => ({
    title: key,
    value: key,
  }));

  if (choices.length === 0) {
    console.log('No pipelines available.');
    return null;
  }

  const response = await prompts({
    type: 'select',
    name: 'pipeline',
    message: 'Please select a pipeline:',
    choices: choices,
  });

  return response.pipeline;
}
// Function to execute selected pipelines
export async function executePipelines(
  config: Config,
  targetPipeline: string,
  environment: string,
) {
  const { tasks, pipelines } = config;

  const pipelineNames = targetPipeline
    ? [targetPipeline]
    : Object.keys(pipelines);

  for (const pipelineName of pipelineNames) {
    if (!pipelines[pipelineName]) {
      error(`Pipeline ${pipelineName} not found in pipelines. Skipping...`);
      continue;
    }

    info(`Starting pipeline: ${pipelineName}`);
    console.log();

    for (const taskName of pipelines[pipelineName]) {
      const task = tasks[taskName];
      if (!task) {
        error(`Task ${taskName} not found in tasks. Skipping...`);
        continue;
      }

      info(`Starting task: ${taskName}`);
      if (typeof task === 'function') {
        await task();
      } else if (task.command) {
        const options = task.root ? { cwd: task.root } : {};
        await runCommand(task.command, options);
      } else if (task.type) {
        switch (task.type) {
          case 'updateManifestVersion': {
            await updateFieldsInFile(
              config.manifest.version.root,
              'version.manifest',
            );
            break;
          }
          case 'assetsCompressAndDeploy': {
            await assetsCompressAndDeploy(config);
            break;
          }
          case 'prepareFastlaneDirectory': {
            await prepareFastlaneDirectory(
              config.fastlane.settingRoot,
              config.fastlane.root,
              environment,
            );
            break;
          }
          case 'cocosBuild': {
            const platform = await selectPlatform();
            switch (platform) {
              case 'iOS': {
                await cocosBuild(config.cocos.iosBuildCommand || '');
                break;
              }
              case 'Android': {
                // 处理 Android 平台的逻辑
                await cocosBuild(config.cocos.androidBuildCommand || '');
                break;
              }
              default: {
                console.log('No platform selected.');
                break;
              }
            }

            break;
          }
          // 在这里添加其他任务类型...
          default: {
            error(`Unknown task type: ${task.type}`);
            break;
          }
        }
      } else {
        error(`Task ${taskName} has no command or type. Skipping...`);
      }

      success(`Finished task: ${taskName}`);
      console.log();
    }

    info(`Finished pipeline: ${pipelineName}`);
  }
}
