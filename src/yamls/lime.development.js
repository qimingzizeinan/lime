const project = {
  root: process.cwd(),
};

function cocosConfig() {
  const config = {
    editor:
      '/Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/MacOS/CocosCreator',
    iosBuildConfig: '',
    iosBuildCommand: '',
    androidBuildConfig: '',
    androidBuildCommand: '',
  };

  // 初始化 iosBuildConfig
  config.iosBuildConfig = `${project.root}/build-config/buildConfig_ios.json`;
  // 使用 config.editor 和 config.iosBuildConfig 初始化 iosBuildCommand
  config.iosBuildCommand = `${config.editor} --project ${project.root} --build 'configPath=${config.iosBuildConfig}'`;

  // 初始化 androidBuildConfig 和 androidBuildCommand
  config.androidBuildConfig = '';
  config.androidBuildCommand = '';

  return config;
}

const cocos = cocosConfig();

const fastlane = {
  root: `${project.root}/build/ios/proj`,
  settingRoot: `${project.root}/pack_configs`,
};

const manifest = {
  version: {
    root: `${project.root}/assets`,
  },
};

const tasks = {
  fastlaneForceMatch: {
    root: `${fastlane.root}/fastlane`,
    command: 'fastlane force_match',
  },
  fastlaneBuildIPA: {
    root: `${fastlane.root}/fastlane`,
    command: 'fastlane beta',
  },
  installFastlaneDep: {
    root: `${fastlane.root}`,
    command: 'bundle install',
  },
  createTargetAndScheme: {
    type: 'createTargetAndScheme',
  },
  prepareFastlaneDirectory: {
    type: 'prepareFastlaneDirectory',
  },
  updateManifestVersion: {
    type: 'updateManifestVersion',
  },
  assetsCompressAndDeploy: {
    type: 'assetsCompressAndDeploy',
  },
  cocosBuild: {
    type: 'cocosBuild',
  },
};

const pipelines = {
  cocosBuild: ['cocosBuild'],
  ipa: ['prepareFastlaneDirectory', 'installFastlaneDep', 'fastlaneBuildIPA'],
  version: ['updateManifestVersion'],
  base: [
    'updateManifestVersion',
    'cocosBuild',
    'cocosBuild',
    'prepareFastlaneDirectory',
    'installFastlaneDep',
    'fastlaneBuildIPA',
  ],
  hotUpdate: ['cocosBuild'],
  forceMatch: ['fastlaneForceMatch'],
  deploy: ['assetsCompressAndDeploy'],
};

module.exports = function () {
  return {
    project,
    cocos,
    fastlane,
    manifest,
    deploy: [
      {
        local: {
          buildCommand: 'pnpm test:commad',
          distDir: './remote-assets/ios',
          distZip: './ios.zip',
        },
        server: {
          name: '',
          host: '',
          port: '',
          username: '',
          password: '',
          distDir: '',
          distZipName: 'ios',
          backup: false,
          command: {
            beforePutFile: {
              command: '',
            },
            afterPutFile: {
              command: '',
            },
            beforeBackup: {
              command: '',
            },
            afterBackup: {
              command: '',
            },
            beforeRmOldFile: {
              command: '',
            },
            afterRmOldFile: {
              command: '',
            },
            beforeUnzip: {
              command: '',
            },
            afterUnzip: {
              command: '',
            },
            success: {
              command: '',
            },
          },
        },
      },
    ],
    tasks,
    pipelines,
  };
};
