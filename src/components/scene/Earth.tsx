import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { EARTH_RADIUS_UNITS } from "../../lib/geo";

function fractalNoise(longitude: number, latitude: number) {
  return (
    Math.sin(longitude * 2.6 + Math.sin(latitude * 2.2) * 0.6) * 0.35 +
    Math.cos(latitude * 4.1 - longitude * 1.1) * 0.27 +
    Math.sin((longitude + latitude) * 1.4) * 0.18 +
    Math.cos(longitude * 7.6) * Math.sin(latitude * 4.7) * 0.12 +
    Math.sin(longitude * 13.2 + latitude * 2.9) * 0.08
  );
}

function createEarthTextures() {
  const width = 1024;
  const height = 512;
  const colorCanvas = document.createElement("canvas");
  const emissiveCanvas = document.createElement("canvas");
  const cloudCanvas = document.createElement("canvas");
  colorCanvas.width = emissiveCanvas.width = cloudCanvas.width = width;
  colorCanvas.height = emissiveCanvas.height = cloudCanvas.height = height;

  const colorContext = colorCanvas.getContext("2d")!;
  const emissiveContext = emissiveCanvas.getContext("2d")!;
  const cloudContext = cloudCanvas.getContext("2d")!;
  const colorImage = colorContext.createImageData(width, height);
  const emissiveImage = emissiveContext.createImageData(width, height);
  const cloudImage = cloudContext.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    const latitude = (y / height) * Math.PI - Math.PI / 2;
    const latitudeWeight = Math.cos(latitude);

    for (let x = 0; x < width; x += 1) {
      const longitude = (x / width) * Math.PI * 2 - Math.PI;
      const noise = fractalNoise(longitude, latitude);
      const landMask = noise + latitudeWeight * 0.14;
      const cloudNoise =
        Math.sin(longitude * 5.8 + latitude * 3.1) * 0.42 +
        Math.cos(longitude * 9.2 - latitude * 1.9) * 0.31 +
        Math.sin(longitude * 14.5 + latitude * 5.4) * 0.17;
      const index = (y * width + x) * 4;
      const polarCap = Math.abs(latitude) > 1.18 ? 1 : 0;

      let red = 8;
      let green = 34;
      let blue = 68;

      if (landMask > 0.13) {
        const mountainBlend = THREE.MathUtils.clamp((landMask - 0.28) * 3, 0, 1);
        red = 44 + mountainBlend * 58;
        green = 88 + mountainBlend * 44;
        blue = 46 + mountainBlend * 20;
      }

      if (polarCap) {
        red = 210;
        green = 225;
        blue = 234;
      }

      const shading = 0.82 + latitudeWeight * 0.28;
      colorImage.data[index] = Math.round(red * shading);
      colorImage.data[index + 1] = Math.round(green * shading);
      colorImage.data[index + 2] = Math.round(blue * shading);
      colorImage.data[index + 3] = 255;

      const emissiveStrength =
        landMask > 0.2 && cloudNoise < 0.1 ? THREE.MathUtils.clamp(landMask * 1.5, 0, 1) : 0;
      emissiveImage.data[index] = Math.round(255 * emissiveStrength);
      emissiveImage.data[index + 1] = Math.round(165 * emissiveStrength);
      emissiveImage.data[index + 2] = Math.round(64 * emissiveStrength);
      emissiveImage.data[index + 3] = 255;

      const cloudAlpha =
        cloudNoise > 0.38 ? THREE.MathUtils.clamp((cloudNoise - 0.38) * 255, 0, 180) : 0;
      cloudImage.data[index] = 240;
      cloudImage.data[index + 1] = 246;
      cloudImage.data[index + 2] = 255;
      cloudImage.data[index + 3] = cloudAlpha;
    }
  }

  colorContext.putImageData(colorImage, 0, 0);
  emissiveContext.putImageData(emissiveImage, 0, 0);
  cloudContext.putImageData(cloudImage, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  const cloudMap = new THREE.CanvasTexture(cloudCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = emissiveMap.wrapS = cloudMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = emissiveMap.wrapT = cloudMap.wrapT = THREE.ClampToEdgeWrapping;

  return { colorMap, emissiveMap, cloudMap };
}

export function Earth() {
  const [textures] = useState(createEarthTextures);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group>
      <mesh receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 96, 96]} />
        <meshPhysicalMaterial
          map={textures.colorMap}
          emissiveMap={textures.emissiveMap}
          emissive="#ff7d3b"
          emissiveIntensity={0.45}
          metalness={0.08}
          roughness={0.84}
          clearcoat={0.28}
          clearcoatRoughness={0.5}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.013, 80, 80]} />
        <meshStandardMaterial
          map={textures.cloudMap}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.07, 64, 64]} />
        <meshBasicMaterial
          color="#58a6ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

