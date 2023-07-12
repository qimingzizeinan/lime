# lime

主要功能为再 macos 下 cocos creator 3.7.3 ios 自动化打包。
用到了 fastlane. 所以需要先了解 fastlane 的功能。例如：如何更新证书，创建证书仓库等内容。

## 使用

##### 初始化

初始化相关内容： 检查 ruby 版本、xcode-select、fastlane 是否已安装。将 cocos 项目需要的基本配置复制进项目中

```
lime init
```

##### 更新 package.json

更新命令行执行目录下的 package.json 的 version 字段

```
lime upgrade package
```

##### 执行 pipeline

执行命令的当前目录下配置文件的 pipeline

```
lime pipeline
```

## 配置说明

```javascript
const project = {
  root: process.cwd(), // 项目根目录
};

const fastlane = {
  root: `${project.root}/build/ios/proj`, // fastlane执行时的目录
  settingRoot: `${project.root}/pack_configs`, // fastlane 配置存放目录
};

function cocosConfig() {
  const config = {
    editor:
      '/Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/MacOS/CocosCreator', // cocos editor的安装目录
    iosBuildConfig: '', // cocos 打包ios配置路径
    iosBuildCommand: '', // cocos 打包ios命令
    // android暂时不可用
    androidBuildConfig: '',
    androidBuildCommand: '',
  };

  // 初始化 iosBuildConfig
  config.iosBuildConfig = `${fastlane.settingRoot}/local/build/ios.json`;
  // 使用 config.editor 和 config.iosBuildConfig 初始化 iosBuildCommand
  config.iosBuildCommand = `${config.editor} --project ${project.root} --build 'configPath=${config.iosBuildConfig}'`;

  // 初始化 androidBuildConfig 和 androidBuildCommand
  config.androidBuildConfig = '';
  config.androidBuildCommand = '';

  return config;
}

const cocos = cocosConfig();

const manifest = {
  version: {
    root: `${project.root}/assets`, // 热更文件的manifest目录
  },
};

// 自定义任务,为了pipeline使用
// task是支持函数的
const tasks = {
  // 函数写法
  testFn() {
    console.log('testFn');
  },
  // fastlane强制更新证书
  fastlaneForceMatch: {
    root: `${fastlane.root}/fastlane`,
    command: 'fastlane force_match',
  },
  // fastlane 打包成ios的IPA
  fastlaneBuildIPA: {
    root: `${fastlane.root}/fastlane`,
    command: 'fastlane beta',
  },
  // fastlane 安装依赖
  installFastlaneDep: {
    root: `${fastlane.root}`,
    command: 'bundle install',
  },
  //   createTargetAndScheme: {
  //     type: 'createTargetAndScheme',
  //   },
  // 根据不同环境将fastlane copy到运行目录
  prepareFastlaneDirectory: {
    type: 'prepareFastlaneDirectory',
  },
  // 更新Manifest的Version字段,热更新时使用
  updateManifestVersion: {
    type: 'updateManifestVersion',
  },
  // 压缩与部署assets下的文件
  assetsCompressAndDeploy: {
    type: 'assetsCompressAndDeploy',
  },
  // cocos creator的build命令，依赖于上方的iosBuildCommand
  cocosBuild: {
    type: 'cocosBuild',
  },
};

const pipelines = {
  cocosBuild: ['cocosBuild'],
  // ipa打包的流程
  ipa: ['prepareFastlaneDirectory', 'installFastlaneDep', 'fastlaneBuildIPA'],
  // 更新Manifest的version字段
  version: ['updateManifestVersion'],
  // 基础包，即第一次打包，后续只需要使用更新Manifest的version字段后，重新部署热更文件
  base: [
    'updateManifestVersion',
    'cocosBuild',
    'cocosBuild',
    'prepareFastlaneDirectory',
    'installFastlaneDep',
    'fastlaneBuildIPA',
  ],
  // 热更新的cocos打包,得到热更的资源
  hotUpdate: ['cocosBuild'],
  // fastlane强制更新证书
  forceMatch: ['fastlaneForceMatch'],
  // 热更文件的部署
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
          // 本地文件打包命令，可为空
          buildCommand: 'pnpm test:commad',
          // 需要压缩的文件夹路径
          distDir: './remote-assets/ios',
          // 上面压缩后的文件存储路径和名称
          distZip: './ios.zip',
        },
        server: {
          // 部署服务器的名称
          name: '',
          // 服务器ip
          host: '',
          // 端口
          port: '22',
          // 登录服务器的用户名
          username: 'root',
          // 登录服务器的密码
          password: '',
          // 部署到服务器中的哪个目录
          distDir: '/root/game/frontend/remote-assets',
          // 要解压的的压缩包名称
          distZipName: 'ios',
          // 声明周期命令,暂时不支持函数，后续会支持函数
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
```

## 注意事项

1. ios 打包成 ipa 文件前，目前不支持代码添加 scheme,所以有需要添加的需要 scheme 要先手动添加
2. 在 cocos creator 导出 build 配置文件时，ios 平台一定要注意选择正确的 team,否则 fastlane 打包失败。

## TODO

1. 代码添加 scheme
2. deploy 的 server 的 command 支持函数
3. fastlane 的使用指南
4. 完整的打包流程使用指南
