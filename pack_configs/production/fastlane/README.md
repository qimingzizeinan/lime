fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios custom_lane

```sh
[bundle exec] fastlane ios custom_lane
```

Description of what the lane does

### ios match_all

```sh
[bundle exec] fastlane ios match_all
```

下载所有需要的证书和描述文件到本地，不会重新创建证书和描述文件（只读方式）

### ios force_match

```sh
[bundle exec] fastlane ios force_match
```

同步证书，如果证书过期或新增了设备，会重新创建证书和描述文件

该方法仅限管理员使用，其他开发成员只需要使用 match_all 方法即可

### ios sync_devices

```sh
[bundle exec] fastlane ios sync_devices
```

注册设备，并更新描述文件

### ios beta

```sh
[bundle exec] fastlane ios beta
```



### ios release

```sh
[bundle exec] fastlane ios release
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
