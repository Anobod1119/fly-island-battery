# 设备电量与音频 / Device battery & audio

Fly Island 源码插件：音乐页增加扬声器 / 耳机切换和无线设备电量。默认关闭，在「设置 → 插件 → 设备电量与音频」配置；它独立于尚未上线的 AI 数据接入插件市场，不改变 `release-features.json`。

## 构建与使用

Windows x64，使用系统 .NET Framework 编译器；首次构建需要网络。

```powershell
pnpm install --frozen-lockfile
pnpm plugin:device-battery
pnpm tauri dev
```

1. 复制构建输出的绝对目录（默认 `artifacts/device-battery`）。
2. 在「设置 → 插件」的本地插件目录中粘贴、保存，再启用。
3. 从活动音频输出中分别绑定扬声器和耳机；不自动猜测设备，不修改麦克风。
4. 在设备设置的「切换输出」中直接选择扬声器 / 耳机；音乐页保留相同的切换入口。音乐页点击电量按钮展开设备列表，刷新按钮重新查询。
5. 关闭插件即隐藏音乐页入口并停止后续查询。已开始的单次读取最多约 62 秒内结束；宿主退出时查询进程及其子进程一并结束。

这是可关闭的源码集成与本地独立插件包，尚未发布到在线市场，不支持直接用现有 JSON-RPC「本地插件目录」加载。需要另一个小岛安装使用时，复制**整个**输出文件夹，在新的设备插件设置中指定该目录。仅信任自己的构建或可信来源；目录内程序具有当前用户权限。

`build.ps1 -SkipRuntime` 仅适合音频和两个原生电量读取器调试；缺少便携 Python 时明确报告通用读取器不可用，不显示虚构电量。发行插件应运行完整构建。exe、下载缓存和 Python 运行库不进入 Git。

## 复用范围与接入点

- 上游：`wushuai0802/myfinder-device-battery`，固定提交 `73d99e2087dd70ae8eef4199854e0c495a66f0bc`（本地提供的源码）。`upstream/engine/`、三个 C# 读取 / 控制文件和两个构建辅助脚本原样保留。
- `SOURCE.json` 记录 151 个上游文件的 SHA-256；另保留原测试依赖的 `upstream/tests/test_engine_reliability.py`。离线协议自测运行 `powershell.exe -NoProfile -File plugins/device-battery/test.ps1`。
- 新增 `Bridge.cs` 和最小音频绑定类：只开放查询、枚举、音源切换；不开放 DPI、固件、配对、更新、托盘或自启接口。不读 MyFinder 用户配置。
- `src/features/device-battery/`：设置持久化、请求、状态与音乐页 UI。`src-tauri/src/device_battery/`：固定入口、参数检查、互斥、输出上限与进程树超时回收。
- 原有文件接入点：`PluginsSettingsPage.tsx`、`MusicPlayerPanel.tsx`、`src-tauri/src/lib.rs`、i18n 汇总和构建 / 测试入口。
- 插件目录由用户显式指定；后端只调用其中固定名称的 helper 和便携 Python，以参数数组启动、不经 shell。

音频切换沿用上游：只改变 Console 和 Multimedia 默认输出，读回核验，失败尝试恢复，Communications 与录音默认设备保持不变。绑定端点不在活动列表时按钮禁用。音频端点在线不代表无线耳机已开机。

设备协议、型号限制和验证等级沿用上游，不保证全品牌全系列；未知值保留为未知，历史值和估算单独标记。只在音乐页显示时按 60 秒间隔读取；设置只枚举音频。引擎单次进程不保留跨轮设备缓存，系统自身缓存依然可能存在。多个窗口同时查询由后端互斥保护，忙时需重试。

## 文件、网络与许可

运行时仅访问用户指定的插件目录、Windows 音频 API 与 HID / 蓝牙设备；不联网、不读取账号，不启用数据包在线更新。用户偏好存到新的 `focusd-island-device-battery` localStorage key。

首次构建由上游锁文件下载固定版本 CPython 和 hidapi，校验 SHA-256，并验证 Python 可执行文件的 Windows 签名；原始许可与第三方声明位于 `upstream/LICENSE`、`upstream/THIRD_PARTY_NOTICES.md`、`upstream/engine/licenses/`。MyFinder 部分保留 AGPL-3.0-only，上游 HaloBattery 部分保留原 MIT 许可，不修改 Fly Island 根许可证。独立进程插件分发时必须保留相应源码和许可。

验证命令与实际结果见 [集成说明](../../docs/device-battery.md)。在向上游提交插件 PR 之前，仍需真实小岛交互录屏、设备与厂商软件共存验收，以及作者和公开联系方式；本次不会代填私人信息或宣称所有硬件已验证。

## English

An optional Fly Island source plugin adds speaker/headphone switching and wireless-device battery readings to Music. Build with `pnpm plugin:device-battery`, save the generated folder under Settings → Plugins → Device battery & audio, enable it and bind two active outputs. Switch directly from the device settings' Switch output buttons or the Music toolbar. Click the battery indicator for device details. Default is off; the existing JSON-RPC loader and release flags are unchanged. This local package has not been published to the online market.

The independent headless bridge preserves the pinned MyFinder implementation and licenses. It exposes only audio enumeration/switching and battery queries, with verified audio readback, rollback, timeouts and owned process-tree cleanup. It preserves communications/recording defaults and never launches the MyFinder UI. Unknown values are not fabricated; estimates and cached readings are labelled. Hardware support and verification limits remain those of the upstream source.

Only visible panels poll (60 seconds); disabling prevents subsequent queries. Active one-shot reads can take up to approximately 62 seconds. Runtime operations are offline. The initial build downloads hash-pinned Python/hidapi and verifies the Python signature. Copy the complete output directory for another installation; load only trusted local code. Generated binaries, runtimes and downloads are excluded from Git. Keep the AGPL and MIT notices/source obligations when distributing the plugin.
