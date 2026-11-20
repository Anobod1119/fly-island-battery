# 设备电量与音频插件

源码、构建与使用说明见 [plugins/device-battery/README.md](../plugins/device-battery/README.md)。插件默认关闭，提供独立本地插件包，源项目保留不变。

## 集成边界

- 设置 → 插件：本地目录、启用开关、扬声器和耳机绑定。
- 音乐页：只在启用时挂载紧凑控制条，电量详情为浮层，避免挤占歌词。
- IPC：`device_battery_audio(directory, speakerId, headsetId, target)`、`device_battery_read(directory)`；无新增宿主权限、窗口、发布开关或版本号变更。
- 领域实现和 UI 可整体移除，接入点只有对应设置页、音乐面板、Rust 组装和 i18n 汇总。

## 自测记录

2026-11-20，Windows x64：

| 验证 | 结果 |
| --- | --- |
| `pnpm plugin:device-battery` | .NET 桥接编译、便携 Python / hidapi 构建成功，SHA-256 与 Python Windows 签名校验通过 |
| `powershell.exe -NoProfile -File plugins/device-battery/test.ps1` | 固定快照中的 978 项离线设备协议测试通过（使用插件自己的便携 Python） |
| `pnpm check` | 类型、回归页类型、ESLint、文件行数和 459 项单元测试通过 |
| `pnpm build` | 前端生产构建成功；保留原有大分块提示 |
| `cargo test --manifest-path src-tauri/Cargo.toml` | 468 通过，14 个环境依赖测试按声明忽略；测试前已构建 example-hello |
| `cargo test --manifest-path src-tauri/Cargo.toml device_battery::tests::local -- --ignored` | 配置 `FLY_ISLAND_DEVICE_BATTERY_TEST_DIR` 后，2 个本地桥接与隔离进程运行库探测测试通过；不修改实际音源 |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | 通过 |
| `pnpm tauri build --no-bundle` | 桌面 release 构建成功 |
| `pnpm test:regression` | 首轮 59/62 页通过；3 页因新增回归页残留启用状态而失败，已修复测试清理逻辑 |
| `pnpm test:regression device-battery music-lyrics plugins-settings` | 修复后相关 8 页全部通过（新增窄布局场景使当前全集为 63 页）；未重复执行完整全集 |

另以无头 Edge 查看深色中文、浅色英文、300px 英文的音乐页和电量详情，确认 234px 高度内播放按钮和插件控制条完整，无横向溢出。真实只读探测成功枚举音频输出并读到一台无线鼠标电量；本机耳机电量没有成功读出，蓝牙读取存在 timeout，界面保留未知 / 错误，不算该硬件验证通过。没有自动切换用户当前音源，也没有录制或上传真实小岛演示。

硬件逐型号兼容性、真实音源往返切换、完整小岛录屏和正式市场分发需另行验收。本实现没有创建上游 PR，也没有变更任何发布开关或版本号。
