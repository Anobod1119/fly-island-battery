import { useCallback, useEffect, useRef, useState } from "react";
import { readDeviceAudio, readDeviceBatteries } from "./api";
import type { AudioSnapshot, BatterySnapshot, DeviceBatterySettings } from "./model";

export function useDeviceBattery(settings: DeviceBatterySettings, queryBattery = true) {
  const [audio, setAudio] = useState<AudioSnapshot | null>(null);
  const [battery, setBattery] = useState<BatterySnapshot | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [batteryBusy, setBatteryBusy] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [batteryError, setBatteryError] = useState("");
  const generation = useRef(0);
  const pending = useRef({ audio: -1, battery: -1 });
  const refreshAudio = useCallback(async (target: "speaker" | "headset" | null = null) => {
    const version = generation.current;
    if (!settings.enabled || pending.current.audio === version) return;
    pending.current.audio = version; setAudioBusy(true);
    try {
      const value = await readDeviceAudio(settings, target);
      if (version === generation.current) { setAudio(value); setAudioError(value.error); }
    } catch (e) { if (version === generation.current) { setAudio(null); setAudioError(String(e)); } }
    finally { if (pending.current.audio === version) pending.current.audio = -1; if (version === generation.current) setAudioBusy(false); }
  }, [settings]);
  const refreshBattery = useCallback(async () => {
    const version = generation.current;
    if (!settings.enabled || !queryBattery || pending.current.battery === version) return;
    pending.current.battery = version; setBatteryBusy(true);
    try {
      const value = await readDeviceBatteries(settings.directory);
      if (version === generation.current) { setBattery(value); setBatteryError(value.errors.join(" · ")); }
    } catch (e) { if (version === generation.current) { setBattery(null); setBatteryError(String(e)); } }
    finally { if (pending.current.battery === version) pending.current.battery = -1; if (version === generation.current) setBatteryBusy(false); }
  }, [settings, queryBattery]);
  useEffect(() => {
    const version = ++generation.current;
    setAudio(null); setBattery(null); setAudioBusy(false); setBatteryBusy(false);
    void refreshAudio(); void refreshBattery();
    const timer = settings.enabled ? window.setInterval(() => { void refreshAudio(); void refreshBattery(); }, 60_000) : undefined;
    return () => { generation.current = version + 1; window.clearInterval(timer); };
  }, [settings, refreshAudio, refreshBattery]);
  return { audio, battery, audioBusy, batteryBusy, audioError, batteryError, refreshAudio, refreshBattery };
}
