import * as THREE from "three";
import type { FlightRecord } from "../types/flight";

export const EARTH_RADIUS_KM = 6371;
export const EARTH_RADIUS_UNITS = 5.4;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;

export interface PredictedFlightPosition {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export function predictFlightPosition(
  flight: FlightRecord,
  timestampMs: number,
): PredictedFlightPosition {
  const elapsedSeconds = clamp((timestampMs - flight.lastContactMs) / 1000, 0, 90);
  const distanceMeters = flight.velocityMps * elapsedSeconds;
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;

  const latitude1 = THREE.MathUtils.degToRad(flight.latitude);
  const longitude1 = THREE.MathUtils.degToRad(flight.longitude);
  const bearing = THREE.MathUtils.degToRad(flight.headingDeg);

  const latitude2 = Math.asin(
    Math.sin(latitude1) * Math.cos(angularDistance) +
      Math.cos(latitude1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const longitude2 =
    longitude1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude1),
      Math.cos(angularDistance) - Math.sin(latitude1) * Math.sin(latitude2),
    );

  return {
    latitude: THREE.MathUtils.radToDeg(latitude2),
    longitude: normalizeLongitude(THREE.MathUtils.radToDeg(longitude2)),
    altitudeMeters: Math.max(0, flight.altitudeMeters + flight.verticalRateMps * elapsedSeconds),
  };
}

export function latLonToVector3(
  latitude: number,
  longitude: number,
  altitudeMeters = 0,
  radiusUnits = EARTH_RADIUS_UNITS,
) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);
  const radius = radiusUnits * (1 + altitudeMeters / EARTH_RADIUS_METERS);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function getLocalFrame(latitude: number, longitude: number, altitudeMeters = 0) {
  const origin = latLonToVector3(latitude, longitude, altitudeMeters);
  const north = latLonToVector3(latitude + 0.15, longitude, altitudeMeters)
    .sub(origin)
    .normalize();
  const east = latLonToVector3(latitude, longitude + 0.15, altitudeMeters)
    .sub(origin)
    .normalize();
  const up = origin.clone().normalize();

  if (north.lengthSq() === 0) {
    north.set(0, 0, 1);
  }

  if (east.lengthSq() === 0) {
    east.set(1, 0, 0);
  }

  return { origin, north, east, up };
}

