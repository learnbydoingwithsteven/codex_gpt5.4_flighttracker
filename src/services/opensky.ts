import type { FlightBounds, FlightRecord, FlightsResponse } from "../types/flight";

const DEFAULT_LIMIT = 280;
const OPENSKY_BASE_URL = (import.meta.env.VITE_OPENSKY_BASE_URL as string | undefined) ?? "/api/opensky";

type OpenSkyTuple = [
  string,
  string | null,
  string,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean,
  number,
];

function buildRequestUrl(bounds?: FlightBounds) {
  const path = `${OPENSKY_BASE_URL.replace(/\/$/, "")}/states/all`;
  const url = new URL(path, window.location.origin);

  if (bounds) {
    url.searchParams.set("lamin", String(bounds.lamin));
    url.searchParams.set("lomin", String(bounds.lomin));
    url.searchParams.set("lamax", String(bounds.lamax));
    url.searchParams.set("lomax", String(bounds.lomax));
  }

  return url.toString();
}

function normalizeFlight(tuple: OpenSkyTuple): FlightRecord | null {
  const [
    icao24,
    callsign,
    originCountry,
    timePosition,
    lastContact,
    longitude,
    latitude,
    baroAltitude,
    onGround,
    velocity,
    trueTrack,
    verticalRate,
    _sensors,
    geoAltitude,
    squawk,
    _spi,
    positionSource,
  ] = tuple;

  if (
    latitude === null ||
    longitude === null ||
    lastContact === null ||
    onGround ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const altitudeMeters = Math.max(0, geoAltitude ?? baroAltitude ?? 0);
  const trimmedCallsign = callsign?.trim() ?? "";
  const positionTimeMs = (timePosition ?? lastContact) * 1000;
  const lastContactMs = lastContact * 1000;

  if (Date.now() - lastContactMs > 3 * 60 * 1000) {
    return null;
  }

  return {
    id: icao24,
    callsign: trimmedCallsign || icao24.toUpperCase(),
    country: originCountry,
    latitude,
    longitude,
    altitudeMeters,
    velocityMps: Math.max(0, velocity ?? 0),
    headingDeg: ((trueTrack ?? 0) + 360) % 360,
    verticalRateMps: verticalRate ?? 0,
    lastContactMs,
    positionTimeMs,
    squawk,
    positionSource,
    onGround,
  };
}

function scoreFlight(flight: FlightRecord) {
  const recency = Math.max(0, 180 - (Date.now() - flight.lastContactMs) / 1000);
  const altitudeScore = Math.min(flight.altitudeMeters / 1000, 14);
  const velocityScore = Math.min(flight.velocityMps / 30, 12);
  return recency * 1.4 + altitudeScore + velocityScore;
}

export async function fetchOpenSkyFlights(options: {
  bounds?: FlightBounds;
  limit?: number;
  signal?: AbortSignal;
} = {}): Promise<FlightsResponse> {
  const { bounds, signal, limit = DEFAULT_LIMIT } = options;
  const response = await fetch(buildRequestUrl(bounds), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenSky request failed with ${response.status}`);
  }

  const data = (await response.json()) as { states?: OpenSkyTuple[] };
  const normalized = (data.states ?? [])
    .map(normalizeFlight)
    .filter((flight): flight is FlightRecord => flight !== null)
    .sort((left, right) => scoreFlight(right) - scoreFlight(left));

  return {
    flights: normalized.slice(0, limit),
    fetchedAt: Date.now(),
    totalMatching: normalized.length,
    sourceLabel: bounds?.label ?? "Global",
  };
}

