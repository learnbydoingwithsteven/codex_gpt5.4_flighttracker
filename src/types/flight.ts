export interface FlightBounds {
  id: string;
  label: string;
  description: string;
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export interface FlightRecord {
  id: string;
  callsign: string;
  country: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  velocityMps: number;
  headingDeg: number;
  verticalRateMps: number;
  lastContactMs: number;
  positionTimeMs: number;
  squawk: string | null;
  positionSource: number;
  onGround: boolean;
}

export interface FlightsResponse {
  flights: FlightRecord[];
  fetchedAt: number;
  totalMatching: number;
  sourceLabel: string;
}

export interface FlightPanelStat {
  label: string;
  value: string;
  tone?: "accent" | "cool" | "neutral";
}

