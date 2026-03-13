import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { getLocalFrame, predictFlightPosition } from "../../lib/geo";
import type { FlightRecord } from "../../types/flight";

interface AircraftMarkerProps {
  flight: FlightRecord;
  isSelected: boolean;
  onSelect: (flightId: string) => void;
}

const planeGeometry = new THREE.ConeGeometry(0.08, 0.28, 8, 1);
planeGeometry.rotateX(Math.PI / 2);
planeGeometry.translate(0, 0, 0.12);

export function AircraftMarker({ flight, isSelected, onSelect }: AircraftMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const craftRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const beamCenter = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!groupRef.current || !craftRef.current || !beamRef.current || !haloRef.current) {
      return;
    }

    const prediction = predictFlightPosition(flight, Date.now());
    const { origin, north, east, up } = getLocalFrame(
      prediction.latitude,
      prediction.longitude,
      prediction.altitudeMeters,
    );
    targetQuaternion.current.setFromRotationMatrix(new THREE.Matrix4().makeBasis(east, up, north));

    const smoothing = 1 - Math.exp(-delta * 6);
    groupRef.current.position.lerp(origin, smoothing);
    groupRef.current.quaternion.slerp(targetQuaternion.current, smoothing);

    const surface = origin.clone().normalize().multiplyScalar(origin.length() * 0.988);
    const beamDirection = origin.clone().sub(surface);
    const beamLength = Math.max(beamDirection.length(), 0.001);
    beamCenter.current.copy(origin).add(surface).multiplyScalar(0.5);
    beamRef.current.position.copy(beamCenter.current);
    beamRef.current.scale.set(1, beamLength / 2, 1);
    beamRef.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      beamDirection.normalize(),
    );
    beamRef.current.visible = isSelected;

    haloRef.current.lookAt(state.camera.position);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4 + flight.headingDeg) * 0.12;
    haloRef.current.scale.setScalar((isSelected ? 1.45 : hovered ? 1.05 : 0.75) * pulse);
    craftRef.current.rotation.y = THREE.MathUtils.degToRad(flight.headingDeg);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(flight.id);
      }}
    >
      <mesh ref={craftRef} geometry={planeGeometry} castShadow>
        <meshStandardMaterial
          color={isSelected ? "#f6c15c" : hovered ? "#7cd9ff" : "#ff8c3f"}
          emissive={isSelected ? "#ffb347" : "#44b6ff"}
          emissiveIntensity={isSelected ? 1.8 : 0.75}
          roughness={0.28}
          metalness={0.18}
        />
      </mesh>

      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.008, 0.018, 1, 6, 1, true]} />
        <meshBasicMaterial color="#7cd9ff" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      <mesh ref={haloRef}>
        <ringGeometry args={[0.13, 0.19, 24]} />
        <meshBasicMaterial
          color={isSelected ? "#ffd47f" : "#8fe4ff"}
          transparent
          opacity={isSelected ? 0.95 : 0.52}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

