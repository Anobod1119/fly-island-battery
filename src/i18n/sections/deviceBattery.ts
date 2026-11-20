export type DeviceBatteryText = {
  title: string; description: string; enabled: string; directory: string; directoryHint: string; deviceSettings: string; automatic: string;
  save: string; saveFailed: string; refresh: string; refreshing: string; speaker: string; headset: string; bind: string;
  receiverOnly: string;
  current: string; switchOutput: string; batteries: string; empty: string; unknown: string; cached: string; charging: string; checked: string; unconfirmed: string; trust: string;
};
export const zhCN: DeviceBatteryText = {
  title: "设备电量与音频", description: "查看无线设备电量，切换扬声器与耳机。音乐页也保留快捷入口。默认关闭。",
  deviceSettings: "设备设置",
  receiverOnly: "已检测到接收器，尚未读到鼠标电量",
  automatic: "设备选择自动保存，状态自动更新。",
  enabled: "启用插件", directory: "本地插件目录", directoryHint: "先运行 pnpm plugin:device-battery，再填入输出的插件目录。",
  save: "保存", saveFailed: "设置未能保存，请检查存储空间。", refresh: "刷新", refreshing: "读取中…",
  speaker: "扬声器", headset: "耳机", bind: "请选择活动输出设备", current: "当前输出", switchOutput: "切换输出", empty: "没有可读取的无线设备",
  batteries: "设备电量", unknown: "未知", cached: "历史读数", charging: "充电中", checked: "上次确认", unconfirmed: "待确认",
  trust: "仅加载自己构建或信任的本地插件。切换只更改系统和媒体输出，保留通讯输出与麦克风；关闭后停止后续查询，已开始的查询会在超时内结束。",
};
export const en: DeviceBatteryText = {
  title: "Device battery & audio", description: "Read wireless-device batteries and switch speakers/headphones. Music also keeps a shortcut. Off by default.",
  deviceSettings: "Device settings",
  receiverOnly: "Receiver detected; mouse battery unavailable",
  automatic: "Device selections are saved and refreshed automatically.",
  enabled: "Enable plugin", directory: "Local plugin folder", directoryHint: "Run pnpm plugin:device-battery, then enter the output folder.",
  save: "Save", saveFailed: "Could not save settings. Check available storage.", refresh: "Refresh", refreshing: "Reading…",
  speaker: "Speakers", headset: "Headphones", bind: "Choose an active output", current: "Current output", switchOutput: "Switch output", empty: "No readable wireless devices",
  batteries: "Device batteries", unknown: "Unknown", cached: "Previous reading", charging: "Charging", checked: "Last confirmed", unconfirmed: "Unconfirmed",
  trust: "Load only local plugins you built or trust. Switching changes system/media output, preserving communications and microphones. Disabling stops future queries; an active query finishes within its timeout.",
};
