import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAudio, normalizeBatteries, normalizeDeviceBatterySettings } from "../../src/features/device-battery/model.ts";

test("device battery plugin is off for missing, malformed and unconfigured settings", () => {
  for (const input of [null, 1, [], {}, { enabled: true }, { enabled: "true", directory: "D:\\plugin" }]) {
    assert.equal(normalizeDeviceBatterySettings(input).enabled, false);
  }
  assert.equal(normalizeDeviceBatterySettings({ enabled: true, directory: "D:\\plugin" }).enabled, true);
});
test("audio output selection excludes capture devices and preserves explicit operation failure", () => {
  const audio = normalizeAudio({ OperationSucceeded: false, Error: "rolled back", ConsoleOutputId: "a", Devices: [
    { Id: "a", Name: "Speakers", Flow: 0 }, { Id: "b", Name: "Microphone", Flow: 1 }, { Flow: 0 },
  ] });
  assert.deepEqual(audio.devices, [{ id: "a", name: "Speakers" }]);
  assert.equal(audio.succeeded, false);
  assert.equal(audio.error, "rolled back");
  assert.throws(() => normalizeAudio(null));
});
test("unknown and invalid percentages never turn into zero or full charge", () => {
  const result = normalizeBatteries({ devices: [null, { id: "a", percent: null }, { id: "b", percent: -1 },
    { id: "c", percent: 101 }, { id: "d", percent: "80" }, { id: "e", percent: 0, charging: null },
    { id: "f", percent: 60, measurementState: "cached", approximate: true }, { id: "f", percent: 100 }], errors: ["offline", 1] });
  assert.deepEqual(result.devices.map((d) => d.percent), [null, null, null, null, 0, 60]);
  assert.equal(result.devices.at(-1).state, "cached");
  assert.equal(result.devices.at(-1).approximate, true);
  assert.equal(result.devices[0].charging, null);
  assert.deepEqual(result.errors, ["offline"]);
});
