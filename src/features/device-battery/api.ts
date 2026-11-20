import { invoke } from "@tauri-apps/api/core";
import { normalizeAudio, normalizeBatteries, type AudioSnapshot, type BatterySnapshot, type DeviceBatterySettings } from "./model";

const audioRequests = new Map<string, Promise<AudioSnapshot>>();
const batteryRequests = new Map<string, Promise<BatterySnapshot>>();

// Rust: device_battery/mod.rs; underlying helper types: AudioReading and battery schema 2.
export function readDeviceAudio(settings: DeviceBatterySettings, target: "speaker" | "headset" | null = null) {
  const key = JSON.stringify([settings.directory, settings.speakerId, settings.headsetId, target]);
  const current = audioRequests.get(key);
  if (current) return current;
  const request = invoke<unknown>("device_battery_audio", {
    directory: settings.directory, speakerId: settings.speakerId, headsetId: settings.headsetId, target,
  }).then(normalizeAudio).finally(() => audioRequests.delete(key));
  audioRequests.set(key, request);
  return request;
}
export function readDeviceBatteries(directory: string) {
  const current = batteryRequests.get(directory);
  if (current) return current;
  const request = invoke<unknown>("device_battery_read", { directory }).then(normalizeBatteries).finally(() => batteryRequests.delete(directory));
  batteryRequests.set(directory, request);
  return request;
}
