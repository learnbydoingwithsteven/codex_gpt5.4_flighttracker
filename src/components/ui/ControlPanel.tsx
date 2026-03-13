import { Gauge, Globe2, Layers3, RotateCcw } from "lucide-react";
import type { FlightBounds } from "../../types/flight";

interface ControlPanelProps {
  regions: FlightBounds[];
  activeRegionId: string;
  activeRegionDescription: string;
  planeLimit: number;
  autoRotate: boolean;
  onRegionChange: (regionId: string) => void;
  onLimitChange: (nextLimit: number) => void;
  onAutoRotateChange: (enabled: boolean) => void;
}

export function ControlPanel({
  regions,
  activeRegionId,
  activeRegionDescription,
  planeLimit,
  autoRotate,
  onRegionChange,
  onLimitChange,
  onAutoRotateChange,
}: ControlPanelProps) {
  return (
    <section className="hud-card control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Flight deck</p>
          <h2>Airspace controls</h2>
        </div>
        <Globe2 size={18} />
      </div>

      <label className="field">
        <span>
          <Layers3 size={16} />
          Region focus
        </span>
        <select value={activeRegionId} onChange={(event) => onRegionChange(event.target.value)}>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label}
            </option>
          ))}
        </select>
      </label>

      <p className="field-note">{activeRegionDescription}</p>

      <label className="field">
        <span>
          <Gauge size={16} />
          Visible aircraft cap
        </span>
        <input
          type="range"
          min={80}
          max={420}
          step={20}
          value={planeLimit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        />
        <strong className="range-value">{planeLimit}</strong>
      </label>

      <button
        type="button"
        className={`toggle-button ${autoRotate ? "active" : ""}`}
        onClick={() => onAutoRotateChange(!autoRotate)}
      >
        <RotateCcw size={16} />
        {autoRotate ? "Auto-rotation on" : "Auto-rotation off"}
      </button>
    </section>
  );
}

