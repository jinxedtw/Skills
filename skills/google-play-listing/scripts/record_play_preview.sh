#!/usr/bin/env bash
# Record an MP4 screen preview from a connected Android device via adb.
# Usage:
#   ./record_play_preview.sh /path/to/out.mp4 [seconds] [serial]
# seconds default 180 (1–180, adb max). Switch app UI to English and cover as many features as practical.
# Exit codes:
#   2 adb missing
#   3 unauthorized
#   4 no device
#   5 multiple devices and no serial
#   6 pull failed

set -euo pipefail

OUT_FILE="${1:-}"
SECONDS_N="${2:-180}"
SERIAL="${3:-}"

if [[ -z "$OUT_FILE" ]]; then
  echo "Usage: $0 /path/to/out.mp4 [seconds] [serial]" >&2
  exit 1
fi

if [[ "$SECONDS_N" -lt 1 || "$SECONDS_N" -gt 180 ]]; then
  echo "Seconds must be between 1 and 180 (adb screenrecord max is 180)." >&2
  exit 1
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found on PATH." >&2
  exit 2
fi

adb_cmd() {
  if [[ -n "$SERIAL" ]]; then
    adb -s "$SERIAL" "$@"
  else
    adb "$@"
  fi
}

ready=()
while IFS= read -r line; do
  [[ -z "${line// }" ]] && continue
  serial=$(awk '{print $1}' <<<"$line")
  state=$(awk '{print $2}' <<<"$line")
  if [[ "$state" == "unauthorized" ]]; then
    echo "Device $serial is unauthorized. Ask the user to accept the RSA prompt." >&2
    exit 3
  fi
  if [[ "$state" == "device" ]]; then
    ready+=("$serial")
  fi
done < <(adb devices | tail -n +2)

if [[ ${#ready[@]} -eq 0 ]]; then
  echo "No adb device in 'device' state. Ask the user to connect a phone." >&2
  exit 4
fi

if [[ -z "$SERIAL" && ${#ready[@]} -gt 1 ]]; then
  echo "Multiple devices: ${ready[*]}. Pass serial as \$3." >&2
  exit 5
fi

mkdir -p "$(dirname "$OUT_FILE")"
remote="/sdcard/Download/play_preview_${RANDOM}.mp4"
cleanup() { adb_cmd shell rm -f "$remote" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "Recording ${SECONDS_N}s to $remote — drive the English main flow on device now."
adb_cmd shell screenrecord --time-limit "$SECONDS_N" "$remote"
adb_cmd pull "$remote" "$OUT_FILE" >/dev/null

if [[ ! -f "$OUT_FILE" ]]; then
  echo "Video was not written to $OUT_FILE" >&2
  exit 6
fi

echo "Saved $OUT_FILE"
