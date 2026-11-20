import { useState } from "react";
import { SettingsGroup } from "../../components/settings/SettingsGroup";
import { SettingsRow } from "../../components/settings/SettingsRow";
import { SettingsToggleRow } from "../../components/settings/SettingsToggleRow";
import { SettingsInput } from "../../components/settings/SettingsInput";
import { SettingsLinkButton } from "../../components/settings/SettingsLinkButton";
import { SettingsSelect } from "../../components/settings/SettingsSelect";
import { useTranslation } from "../../i18n";
import { saveDeviceBatterySettings, useDeviceBatterySettings } from "./storage";
import { useDeviceBattery } from "./useDeviceBattery";

export function DeviceBatterySettings() {
  const settings = useDeviceBatterySettings();
  const t = useTranslation().deviceBattery;
  const [directory, setDirectory] = useState<string | null>(null);
  const [error, setError] = useState("");
  const save = (next: typeof settings) => { if (!saveDeviceBatterySettings(next)) setError(t.saveFailed); else setError(""); };
  return <SettingsGroup title={t.title} footer={t.trust}>
    <SettingsToggleRow title={t.enabled} description={t.description} checked={settings.enabled} disabled={!settings.directory} onChange={(enabled) => save({ ...settings, enabled })} />
    <SettingsRow title={t.directory} description={t.directoryHint} control={<SettingsLinkButton onClick={() => { save({ ...settings, directory: (directory ?? settings.directory).trim(), enabled: false, speakerId: "", headsetId: "" }); setDirectory(null); }}>{t.save}</SettingsLinkButton>}>
      <SettingsInput aria-label={t.directory} value={directory ?? settings.directory} onChange={(e) => setDirectory(e.target.value)} />
    </SettingsRow>
    {settings.enabled && <DeviceAudioBindings key={JSON.stringify(settings)} settings={settings} onSave={save} />}
    {error && <p role="alert">{error}</p>}
  </SettingsGroup>;
}
function DeviceAudioBindings({ settings, onSave }: {
  settings: ReturnType<typeof useDeviceBatterySettings>;
  onSave: (settings: ReturnType<typeof useDeviceBatterySettings>) => void;
}) {
  const t = useTranslation().deviceBattery;
  // Battery polling belongs to the Music panel; settings only enumerates outputs.
  const { audio, audioBusy, audioError, refreshAudio } = useDeviceBattery(settings, false);
  return <>
    {(["speaker", "headset"] as const).map((role) => <SettingsRow key={role} title={t[role]} control={<SettingsSelect
      ariaLabel={t[role]} value={settings[role === "speaker" ? "speakerId" : "headsetId"]}
      disabled={audioBusy} options={[{ value: "", label: t.bind }, ...(audio?.devices ?? []).map((d) => ({ value: d.id, label: d.name }))]}
      onChange={(id) => { onSave({ ...settings, [role === "speaker" ? "speakerId" : "headsetId"]: id }); }}
    />} />)}
    <SettingsRow title={t.current} description={audio?.devices.find((d) => d.id === audio.currentId)?.name ?? t.unknown}
      control={<SettingsLinkButton disabled={audioBusy} onClick={() => { void refreshAudio(); }}>{t.refresh}</SettingsLinkButton>} />
    {audioError && <p role="alert">{audioError}</p>}
  </>;
}
