import { Command } from 'commander';
import { parseConfigFile, Config, selectConfigFile } from '@/config';
import { prepareEnvironmentConfigsBeforeBuild } from './fastlane';
import {
  checkFastlane,
  checkRubyVersion,
  checkXcodeSelect,
  error,
  extractPart,
  success,
} from '@/utils';
import { checkAndCopyYamlFiles } from './cocos';
import { updateFieldsInFile } from './semver';
import { executePipelines, selectPipeline } from './pipeline';
import packageJSON from '../package.json';

async function init() {
  const program = new Command();

  // Set the version of the program
  program.version(packageJSON.version);

  // Add a custom help option
  program.helpOption('-h, --help', 'Display help information');

  // Add a custom help command
  program.addHelpCommand(
    'help [command]',
    'Display help information for a specific command'
  );

  program
    .command('init')
    .description('Initialize the project, check the environment and copy files')
    .addHelpText('after', '\nExample:\n  $ program init')
    .action(async () => {
      // Check the environment
      success('Checking environment...');
      const root = process.cwd();

      // Check various dependencies and configurations
      await checkRubyVersion();
      await checkXcodeSelect();
      await checkFastlane();
      console.log('');
      await checkAndCopyYamlFiles(root);
      console.log('');
      await prepareEnvironmentConfigsBeforeBuild(root);

      success('Initialization complete!');
    });

  program
    .command('upgrade package')
    .description('Upgrade version field in package.json')
    .addHelpText('after', '\nExample:\n  $ program upgrade package')
    .action(async () => {
      // Update fields in the package.json file
      await updateFieldsInFile(process.cwd());
    });

  program
    .command('pipeline')
    .description('Execute pipeline packaging')
    .addHelpText('after', '\nExample:\n  $ program pipeline')
    .action(async () => {
      // Execute cocos pipeline packaging
      const envFilePath = await selectConfigFile();
      const environment = extractPart(envFilePath);

      let config: Config | null = null;
      // Set environment variables
      try {
        config = await parseConfigFile(envFilePath);
        const pipeline = await selectPipeline(config);

        if (!pipeline) {
          error(
            'Please check if the pipelines field in the configuration file is configured correctly'
          );
          return;
        }

        await executePipelines(config, pipeline, environment!);
      } catch (error) {
        console.error('error', error);
      }
    });

  // Parse command line arguments
  program.parse(process.argv);
}

// Initialize the program
init();
