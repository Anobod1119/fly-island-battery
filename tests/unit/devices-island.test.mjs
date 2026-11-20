import test from "node:test";
import assert from "node:assert/strict";
import { isPageEnabled, resolveIslandPage } from "../../src/windows/island/features.ts";
import { wheelPageOrder } from "../../src/windows/island/wheelPages.ts";

test("device page visibility and wheel navigation follow the optional plugin", () => {
  const base = { todo: true, music: true, clipboard: false, shelf: false, qq: false, wechat: false, qqMail: false, agents: false, translation: false };
  assert.equal(isPageEnabled("devices", base), false);
  assert.equal(resolveIslandPage("devices", base), "todo");
  const enabled = { ...base, devices: true };
  assert.equal(isPageEnabled("devices", enabled), true);
  assert.equal(resolveIslandPage("devices", enabled), "devices");
  assert.deepEqual(wheelPageOrder(["todo", "devices", "music"], enabled, false), ["todo", "devices", "music"]);
  assert.deepEqual(wheelPageOrder(["todo", "devices", "music"], base, false), ["todo", "music"]);
});
