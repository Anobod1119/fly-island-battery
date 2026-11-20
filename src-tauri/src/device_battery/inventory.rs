use serde_json::{json, Value};

/// Retain a known receiver from the engine's sanitized inventory even when the
/// wireless mouse has not answered. USB presence proves neither radio link nor charge.
pub(super) fn append_unread_receivers(devices: &mut Vec<Value>, snapshot: &Value) {
    let Some(inventory) = snapshot["unadapted"].as_array() else { return; };
    for candidate in inventory.iter().take(16) {
        if candidate["vendorId"] != 0x36a7 || candidate["productId"] != 0xa868 { continue; }
        let Some(name) = candidate["product"].as_str().filter(|name| name.to_ascii_uppercase().contains("WLMOUSE MINI PRO")) else { continue; };
        let vendor_collection = candidate["collections"].as_array().is_some_and(|collections| collections.iter().any(|item| item["usagePage"] == 0xffff && item["usage"] == 0));
        if !vendor_collection { continue; }
        if devices.iter().any(|device| device["provider"] == "wlmouse"
            || device["vendorId"] == 0x36a7 && device["productId"] == 0xa868) { continue; }
        devices.push(json!({
            "id": "receiver-36a7-a868", "name": name, "kind": "mouse",
            "vendorId": 0x36a7, "productId": 0xa868, "provider": "wlmouse",
            "percent": null, "charging": null, "measurementState": "unknown",
            "receiverOnly": true, "approximate": false
        }));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn snapshot() -> Value {
        json!({"unadapted":[{"vendorId":0x36a7,"productId":0xa868,"product":"WLMOUSE MINI PRO 8K RECEIVER",
            "collections":[{"usagePage":0xffff,"usage":0}]}]})
    }
    #[test]
    fn present_receiver_keeps_unknown_battery_and_charging() {
        let mut devices = vec![];
        append_unread_receivers(&mut devices, &snapshot());
        assert_eq!(devices.len(), 1);
        assert!(devices[0]["percent"].is_null());
        assert!(devices[0]["charging"].is_null());
        assert_eq!(devices[0]["receiverOnly"], true);
    }
    #[test]
    fn repeated_inventory_or_real_measurements_do_not_duplicate_cards() {
        let mut value = snapshot();
        let duplicate = value["unadapted"][0].clone();
        value["unadapted"].as_array_mut().unwrap().push(duplicate);
        let mut devices = vec![];
        append_unread_receivers(&mut devices, &value);
        assert_eq!(devices.len(), 1);
        let mut measured = vec![json!({"provider":"wlmouse","percent":80})];
        append_unread_receivers(&mut measured, &value);
        assert_eq!(measured.len(), 1);
        assert_eq!(measured[0]["percent"], 80);
    }
    #[test]
    fn unknown_models_or_missing_descriptor_proof_are_not_guessed() {
        let mut devices = vec![];
        let mut candidate = snapshot();
        candidate["unadapted"][0]["productId"] = json!(0xa869);
        append_unread_receivers(&mut devices, &candidate);
        candidate["unadapted"][0]["productId"] = json!(0xa868);
        candidate["unadapted"][0]["collections"] = json!([]);
        append_unread_receivers(&mut devices, &candidate);
        assert!(devices.is_empty());
    }
}
