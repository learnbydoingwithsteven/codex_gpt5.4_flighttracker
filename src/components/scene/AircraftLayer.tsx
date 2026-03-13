import type { FlightRecord } from "../../types/flight";
import { AircraftMarker } from "./AircraftMarker";

interface AircraftLayerProps {
  flights: FlightRecord[];
  selectedFlightId: string | null;
  onSelect: (flightId: string) => void;
}

export function AircraftLayer({ flights, selectedFlightId, onSelect }: AircraftLayerProps) {
  return (
    <group>
      {flights.map((flight) => (
        <AircraftMarker
          key={flight.id}
          flight={flight}
          isSelected={flight.id === selectedFlightId}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

