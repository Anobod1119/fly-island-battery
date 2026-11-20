import { useState } from "react";
import { SettingsGroup } from "../../components/settings/SettingsGroup";
import { SettingsRow } from "../../components/settings/SettingsRow";
import { SettingsToggleRow } from "../../components/settings/SettingsToggleRow";
import { SettingsInput } from "../../components/settings/SettingsInput";
import { SettingsLinkButton } from "../../components/settings/SettingsLinkButton";
import { SettingsSelect } from "../../components/settings/SettingsSelect";
import { SettingsChoice } from "../../components/settings/SettingsChoice";
import { useTranslation } from "../../i18n";
import { saveDeviceBatterySettings, useDeviceBatterySettings } from "./storage";
import { useDeviceBattery } from "./useDeviceBattery";

const AUDIO_OUTPUTS = { speaker: "speakerId", headset: "headsetId" } as const;
const AUDIO_ROLES = ["speaker", "headset"] as const;

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
  // The device page controls audio; battery polling belongs to the Music panel.
  const { audio, audioBusy, audioError, refreshAudio } = useDeviceBattery(settings, false);
  const currentRole = AUDIO_ROLES.find((role) => settings[AUDIO_OUTPUTS[role]] && audio?.currentId === settings[AUDIO_OUTPUTS[role]]) ?? "";
  return <>
    {AUDIO_ROLES.map((role) => <SettingsRow key={role} title={t[role]} control={<SettingsSelect
      ariaLabel={t[role]} value={settings[AUDIO_OUTPUTS[role]]}
      disabled={audioBusy} options={[{ value: "", label: t.bind }, ...(audio?.devices ?? []).map((d) => ({ value: d.id, label: d.name }))]}
      onChange={(id) => { onSave({ ...settings, [AUDIO_OUTPUTS[role]]: id }); }}
    />} />)}
    <SettingsRow title={t.switchOutput}>
      <SettingsChoice ariaLabel={t.switchOutput} value={currentRole}
        options={AUDIO_ROLES.map((role) => ({
          value: role, label: t[role], disabled: audioBusy || !audio?.devices.some((device) => device.id === settings[AUDIO_OUTPUTS[role]]),
        }))}
        onChange={(target) => { if (target === "speaker" || target === "headset") void refreshAudio(target); }}
      />
    </SettingsRow>
    <SettingsRow title={t.current} description={audio?.devices.find((d) => d.id === audio.currentId)?.name ?? t.unknown}
      control={<SettingsLinkButton disabled={audioBusy} onClick={() => { void refreshAudio(); }}>{t.refresh}</SettingsLinkButton>} />
    {audioError && <p role="alert">{audioError}</p>}
  </>;
}
