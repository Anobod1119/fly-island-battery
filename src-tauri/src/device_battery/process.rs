use crate::win32::process_job::ProcessJob;
use serde_json::Value;
use std::{io::Read, os::windows::process::CommandExt, path::Path, process::{Command, Stdio}, time::{Duration, Instant}};

pub(super) fn run(program: &Path, args: &[String], seconds: u64) -> Result<Value, String> {
    let mut child = Command::new(program).args(args).creation_flags(0x08000000)
        .stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::null())
        .spawn().map_err(|e| format!("Could not start device reader: {e}"))?;
    let job = match ProcessJob::attach(&child) {
        Ok(job) => job,
        Err(e) => { let _ = child.kill(); let _ = child.wait(); return Err(format!("Could not isolate device reader: {e}")); }
    };
    let stdout = child.stdout.take().ok_or("Device reader output unavailable")?;
    let reader = std::thread::spawn(move || {
        let mut bytes = Vec::new();
        stdout.take(2 * 1024 * 1024 + 1).read_to_end(&mut bytes).map(|_| bytes)
    });
    let deadline = Instant::now() + Duration::from_secs(seconds);
    let outcome = loop {
        match child.try_wait() {
            Ok(Some(status)) => break if status.success() { Ok(()) } else { Err("Device reader failed; refresh or rebuild the local plugin".to_string()) },
            Ok(None) if Instant::now() < deadline => std::thread::sleep(Duration::from_millis(25)),
            Ok(None) => break Err("Device reader timed out; try refreshing".to_string()),
            Err(e) => break Err(format!("Device reader failed: {e}")),
        }
    };
    drop(job); // Also stops isolated grandchildren on success, error and timeout.
    let _ = child.wait();
    let bytes = reader.join().map_err(|_| "Device reader output failed")?
        .map_err(|e| format!("Device reader output failed: {e}"))?;
    outcome?;
    if bytes.len() > 2 * 1024 * 1024 { return Err("Device reader output exceeded its limit".into()); }
    serde_json::from_slice(&bytes).map_err(|_| "Invalid device reader response".into())
}
