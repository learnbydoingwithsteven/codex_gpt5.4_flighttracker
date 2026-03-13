import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  Stars,
} from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import type { FlightRecord } from "../../types/flight";
import { AircraftLayer } from "./AircraftLayer";
import { Earth } from "./Earth";

interface FlightSceneProps {
  flights: FlightRecord[];
  selectedFlightId: string | null;
  autoRotate: boolean;
  onSelectFlight: (flightId: string | null) => void;
}

export function FlightScene({
  flights,
  selectedFlightId,
  autoRotate,
  onSelectFlight,
}: FlightSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelectFlight(null)}
    >
      <color attach="background" args={["#020611"]} />
      <fog attach="fog" args={["#020611", 12, 34]} />

      <PerspectiveCamera makeDefault position={[0, 0.8, 14.4]} fov={32} />
      <AdaptiveDpr pixelated={false} />

      <ambientLight intensity={0.35} />
      <hemisphereLight intensity={0.85} color="#8ad4ff" groundColor="#02111d" />
      <directionalLight
        castShadow
        position={[16, 10, 10]}
        intensity={3.4}
        color="#fff2d6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-14, -8, -10]} intensity={18} distance={40} color="#2e7cff" />

      <Stars radius={90} depth={60} count={7000} factor={4} saturation={0} fade speed={0.8} />
      <Sparkles
        count={160}
        size={3.2}
        scale={[28, 28, 28]}
        speed={0.12}
        opacity={0.6}
        color="#9ed8ff"
      />

      <group rotation={[0.28, 2.5, 0]}>
        <Earth />
        <AircraftLayer
          flights={flights}
          selectedFlightId={selectedFlightId}
          onSelect={(flightId) => onSelectFlight(flightId)}
        />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.45}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        minDistance={8}
        maxDistance={22}
      />

      <EffectComposer multisampling={0}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.55}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[0.00025, 0.00035]}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.04} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette offset={0.24} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  );
}
