export function formatAltitude(meters: number) {
  const feet = meters * 3.28084;
  return `${Math.round(feet).toLocaleString()} ft`;
}

export function formatSpeed(mps: number) {
  const knots = mps * 1.94384;
  return `${Math.round(knots).toLocaleString()} kt`;
}

export function formatVerticalRate(mps: number) {
  const feetPerMinute = mps * 196.850394;
  const rounded = Math.round(feetPerMinute);
  return `${rounded >= 0 ? "+" : ""}${rounded.toLocaleString()} fpm`;
}

export function formatCoordinates(latitude: number, longitude: number) {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

export function formatLastSeen(timestampMs: number) {
  const deltaSeconds = Math.max(0, Math.round((Date.now() - timestampMs) / 1000));

  if (deltaSeconds < 5) {
    return "just now";
  }

  if (deltaSeconds < 60) {
    return `${deltaSeconds}s ago`;
  }

  const minutes = Math.round(deltaSeconds / 60);
  return `${minutes}m ago`;
}

export function formatTime(timestampMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestampMs);
}

