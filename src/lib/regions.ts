import type { FlightBounds } from "../types/flight";

export const REGION_PRESETS: FlightBounds[] = [
  {
    id: "global",
    label: "Global",
    description: "Worldwide traffic with a curated live cap for smooth rendering.",
    lamin: -60,
    lomin: -180,
    lamax: 85,
    lomax: 180,
  },
  {
    id: "north-america",
    label: "North America",
    description: "US, Canada, Mexico, and ocean approaches.",
    lamin: 5,
    lomin: -170,
    lamax: 75,
    lomax: -45,
  },
  {
    id: "europe",
    label: "Europe",
    description: "Dense intercontinental and regional traffic across Europe.",
    lamin: 30,
    lomin: -25,
    lamax: 72,
    lomax: 45,
  },
  {
    id: "asia-pacific",
    label: "Asia Pacific",
    description: "Major corridors from East Asia through Oceania.",
    lamin: -48,
    lomin: 95,
    lamax: 60,
    lomax: 180,
  },
];

