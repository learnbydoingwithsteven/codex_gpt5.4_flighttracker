import { Activity, ArrowUpDown, Clock3, MapPinned, Radar } from "lucide-react";
import {
  formatAltitude,
  formatCoordinates,
  formatLastSeen,
  formatSpeed,
  formatVerticalRate,
} from "../../lib/format";
import type { FlightRecord } from "../../types/flight";

interface FlightDetailsCardProps {
  flight: FlightRecord | null;
}

export function FlightDetailsCard({ flight }: FlightDetailsCardProps) {
  if (!flight) {
    return (
      <section className="hud-card details-card empty">
        <p className="eyebrow">Selected aircraft</p>
        <h2>Tap a marker to inspect its live telemetry.</h2>
        <p>
          The active target card shows callsign, altitude, speed, climb rate, and last contact timing
          sourced from the current OpenSky stream.
        </p>
      </section>
    );
  }

  return (
    <section className="hud-card details-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Selected aircraft</p>
          <h2>{flight.callsign}</h2>
        </div>
        <Radar size={18} />
      </div>

      <dl className="detail-grid">
        <div>
          <dt>
            <MapPinned size={14} />
            Origin country
          </dt>
          <dd>{flight.country}</dd>
        </div>
        <div>
          <dt>
            <Activity size={14} />
            Altitude
          </dt>
          <dd>{formatAltitude(flight.altitudeMeters)}</dd>
        </div>
        <div>
          <dt>
            <ArrowUpDown size={14} />
            Ground speed
          </dt>
          <dd>{formatSpeed(flight.velocityMps)}</dd>
        </div>
        <div>
          <dt>
            <ArrowUpDown size={14} />
            Vertical rate
          </dt>
          <dd>{formatVerticalRate(flight.verticalRateMps)}</dd>
        </div>
        <div>
          <dt>
            <MapPinned size={14} />
            Position
          </dt>
          <dd>{formatCoordinates(flight.latitude, flight.longitude)}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={14} />
            Last contact
          </dt>
          <dd>{formatLastSeen(flight.lastContactMs)}</dd>
        </div>
      </dl>
    </section>
  );
}

