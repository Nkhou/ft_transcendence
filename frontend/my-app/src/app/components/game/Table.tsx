import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

interface TableProps {
  color: string;
  texture: string | null;
}

const Table: React.FC<TableProps> = ({ color, texture }) => {
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (texture) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(texture, (loaded) => {
        setLoadedTexture(loaded);
      });
    } else {
      setLoadedTexture(null); // Clear texture if none is provided
    }
  }, [texture]); // Re-run when the texture changes

  return (
    <>
      {/* Table Base */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 6]} />
        <meshStandardMaterial
          color={loadedTexture ? undefined : color} // Use color if no texture
          map={loadedTexture} // Apply texture if available
        />
      </mesh>
      
      {/* Table Net */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3, 0.2, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
};

export default Table;
