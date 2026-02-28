"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { computeGeometry } from "../core/geometry.js";
import { triangleToShape } from "../three/geometry.js";
import { getMaterialPreset } from "../three/materials.js";

export interface SriYantra3DProps {
  width?: number;
  height?: number;
  materialPreset?: "gold" | "copper" | "crystal";
  extrusionDepth?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Z_OFFSETS: Record<string, number> = {
  D1: 0, U1: 0, U2: 0.3, D2: 0.3,
  U3: 0.5, D3: 0.5, U4: 0.7, D4: 0.7, D5: 0.85,
};

function SriYantraModel({
  materialPreset = "gold",
  extrusionDepth = 0.02,
  autoRotate = true,
  autoRotateSpeed = 0.05,
}: Pick<SriYantra3DProps, "materialPreset" | "extrusionDepth" | "autoRotate" | "autoRotateSpeed">) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => computeGeometry(), []);
  const materials = useMemo(() => getMaterialPreset(materialPreset), [materialPreset]);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * autoRotateSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {geometry.triangles.map((tri) => {
        const shape = triangleToShape(tri.vertices);
        const zOffset = (Z_OFFSETS[tri.id] ?? 0) * extrusionDepth * 4;
        const material = tri.tattva === "shiva" ? materials.shiva : materials.shakti;

        return (
          <mesh key={tri.id} position={[0, 0, zOffset]} scale={[2, 2, 1]}>
            <extrudeGeometry
              args={[
                shape,
                {
                  depth: extrusionDepth,
                  bevelEnabled: true,
                  bevelThickness: 0.003,
                  bevelSize: 0.002,
                  bevelSegments: 2,
                },
              ]}
            />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}

      {/* Bindu sphere */}
      <mesh position={[0, 0, extrusionDepth * 5]}>
        <sphereGeometry args={[0.025, 32, 32]} />
        <primitive object={materials.bindu} attach="material" />
      </mesh>

      {/* Bindu glow */}
      <pointLight
        position={[0, 0, extrusionDepth * 5 + 0.05]}
        intensity={0.6}
        distance={2}
        color="#D4A843"
      />
    </group>
  );
}

/**
 * React Three Fiber component for 3D Sri Yantra rendering.
 */
export function SriYantra3D({
  width = 600,
  height = 600,
  materialPreset = "gold",
  extrusionDepth = 0.02,
  autoRotate = true,
  autoRotateSpeed = 0.05,
  className,
  style,
}: SriYantra3DProps) {
  return (
    <div className={className} style={{ width, height, ...style }}>
      <Canvas camera={{ position: [0, -0.3, 1.8], fov: 45 }}>
        <ambientLight intensity={0.4} color="#fff5e6" />
        <directionalLight position={[2, 3, 4]} intensity={1.0} />
        <directionalLight position={[-2, -1, 2]} intensity={0.3} color="#e6f0ff" />
        <SriYantraModel
          materialPreset={materialPreset}
          extrusionDepth={extrusionDepth}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
        <OrbitControls enableZoom enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
