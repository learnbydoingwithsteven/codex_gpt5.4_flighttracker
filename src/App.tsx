import { useDeferredValue, useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, RadioTower, Satellite } from "lucide-react";
import { FlightScene } from "./components/scene/FlightScene";
import { ControlPanel } from "./components/ui/ControlPanel";
import { FlightDetailsCard } from "./components/ui/FlightDetailsCard";
import { StatsStrip } from "./components/ui/StatsStrip";
import { formatTime } from "./lib/format";
import { REGION_PRESETS } from "./lib/regions";
import { useLiveFlights } from "./hooks/useLiveFlights";

export default function App() {
  const [activeRegionId, setActiveRegionId] = useState(REGION_PRESETS[0].id);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [planeLimit, setPlaneLimit] = useState(260);
  const [autoRotate, setAutoRotate] = useState(true);
  const deferredPlaneLimit = useDeferredValue(planeLimit);
  const activeRegion = REGION_PRESETS.find((region) => region.id === activeRegionId) ?? REGION_PRESETS[0];
  const { flights, totalMatching, isLoading, isRefreshing, error, lastSuccessfulFetchMs } =
    useLiveFlights(activeRegion, deferredPlaneLimit);
  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) ?? null;
  const highAltitudeCount = flights.filter((flight) => flight.altitudeMeters >= 10000).length;

  useEffect(() => {
    if (selectedFlightId && !flights.some((flight) => flight.id === selectedFlightId)) {
      setSelectedFlightId(null);
    }
  }, [flights, selectedFlightId]);

  const stats = [
    {
      label: "Visible traffic",
      value: flights.length.toLocaleString(),
      tone: "accent" as const,
    },
    {
      label: "Matching in region",
      value: totalMatching.toLocaleString(),
      tone: "cool" as const,
    },
    {
      label: "Cruising above FL330",
      value: highAltitudeCount.toLocaleString(),
      tone: "neutral" as const,
    },
    {
      label: "Last refresh",
      value: lastSuccessfulFetchMs ? formatTime(lastSuccessfulFetchMs) : "Waiting",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <div className="background-glow background-glow-one" />
      <div className="background-glow background-glow-two" />

      <main className="layout">
        <section className="hero-copy">
          <div className="hero-badge">
            <Satellite size={14} />
            Real-time OpenSky airspace telemetry
          </div>
          <h1>Orbital Airspace</h1>
          <p>
            Explore live aircraft motion on a tactile 3D Earth with altitude-accurate positioning,
            predictive interpolation, and cinematic rendering tuned for command-center readability.
          </p>
        </section>

        <StatsStrip stats={stats} />

        <section className="experience-frame">
          <div className="scene-shell">
            <FlightScene
              flights={flights}
              selectedFlightId={selectedFlightId}
              autoRotate={autoRotate}
              onSelectFlight={setSelectedFlightId}
            />

            <div className="scene-overlay top-left">
              <div className="status-pill">
                <RadioTower size={14} />
                <span>{activeRegion.label}</span>
              </div>
            </div>

            <div className="scene-overlay top-right">
              {isLoading || isRefreshing ? (
                <div className="status-pill loading">
                  <LoaderCircle size={14} className="spin" />
                  <span>{isLoading ? "Acquiring feed" : "Refreshing feed"}</span>
                </div>
              ) : null}

              {error ? (
                <div className="status-pill error">
                  <AlertTriangle size={14} />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="sidebar">
            <ControlPanel
              regions={REGION_PRESETS}
              activeRegionId={activeRegion.id}
              activeRegionDescription={activeRegion.description}
              planeLimit={planeLimit}
              autoRotate={autoRotate}
              onRegionChange={setActiveRegionId}
              onLimitChange={setPlaneLimit}
              onAutoRotateChange={setAutoRotate}
            />
            <FlightDetailsCard flight={selectedFlight} />
          </aside>
        </section>
      </main>
    </div>
  );
}
