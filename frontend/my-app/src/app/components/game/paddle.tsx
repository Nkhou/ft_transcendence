"use client";
import React, { forwardRef, useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import * as THREE from "three";

type PaddleProps = {
  position: [number, number, number];
};

const Paddle = forwardRef<THREE.Object3D, PaddleProps>(({ position }, ref) => {
  // Load the MTL file
  const materials = useLoader(MTLLoader, "/paddle.mtl");

  // Preload the materials to optimize rendering
//   useEffect(() => {
//     if (materials) {
//       materials.preload();
//     }
//   }, [materials]);

  // Load the OBJ file
  const obj = useLoader(OBJLoader, "/paddle.obj", (loader) => {
    if ("setMaterials" in loader) {
      (loader as any).setMaterials(materials);
    }
  }) as THREE.Object3D;

  // Internal ref to attach debugging helpers or other features
  const internalRef = useRef<THREE.Object3D | null>(null);

  // Scale and position adjustments
  useEffect(() => {
    if (obj) {
      obj.scale.set(0.1, 0.1, 0.1); // Adjust the scale to fit the game
      obj.position.set(0, 0, 0); // Reset the position to ensure alignment
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  // Debugging: Attach a BoxHelper to visualize the paddle's bounding box
  useEffect(() => {
    if (internalRef.current) {
      const helper = new THREE.BoxHelper(internalRef.current, 0xff0000); // Red box for debugging
      internalRef.current.add(helper);
    }
  }, []);

  return (
    <mesh
      ref={(group) => {
        if (group) {
          group.attach(obj);
            (internalRef as React.MutableRefObject<THREE.Object3D | null>).current = group;
          if (ref) {
            if (typeof ref === "function") {
              ref(group);
            } else {
              ref.current = group;
            }
          }
        }

      }
        }
      position={position}
    >
      {obj && <primitive object={obj} />}
    </mesh>
  );
});

Paddle.displayName = "Paddle";

export default Paddle;
