import React, { useRef, useEffect, useState } from 'react';
import Gradient from '../material/default';
import GreenForest from '../material/Greenforest';
import RedInferno from '../material/inferno';
import Black from '../material/black';
import * as THREE from 'three';
import { Button } from '@mui/material';
import { usePathname } from 'next/navigation';
import BlackPurple from '../material/purple';
interface BackgroundProps {
    theme?: 'default' | 'greenforest' | 'redinferno' | 'black' | 'purple';

}

const Background: React.FC<BackgroundProps> = ({ theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const [toggle, setToggle] = useState<boolean>(false);
    const path = usePathname();
   

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if(path === '/dashboard' )
        {
            setToggle(true);
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas });

        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 5;

        let material = Gradient;
        let coloros = 0xffffff;
        // if (theme === 'greenforest') {
        //     material = GreenForest;

        // } else if (theme === 'redinferno') {
        //     material = RedInferno;
        //     coloros = "0xFF0000";
        // }
        // else if (theme === 'black') {
        //     material = Black;
        //     coloros = "0x000000";
        // }
        // else if (theme === 'purple') {
        //     material = BlackPurple;
        //     coloros = "0x800080";
        // }

        // Create background geometry and mesh
        const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
        const backgroundMesh = new THREE.Mesh(backgroundGeometry, material);

        if (material.uniforms) {
            material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        }
        backgroundMesh.position.z = -1;
        material.depthTest = false;

        // Create star field
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = new Float32Array(2000 * 3);
        for (let i = 0; i < 5000; i++) 
        {
            starVertices[i * 3] = (Math.random() - 0.5) * 10000;
            starVertices[i * 3 + 1] = (Math.random() - 0.5) * 10000;
            starVertices[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: new THREE.Color(coloros) ,
            size: 1,
            sizeAttenuation: true,
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.position.z = 2;

        scene.add(backgroundMesh);
        scene.add(stars);

        const animate = (time: number) => {
            requestAnimationFrame(animate);
            if (material.uniforms) {
                material.uniforms.time.value = time / 1000;
            }
            stars.rotation.x += 0.004;
            stars.rotation.y += 0.005;

            renderer.render(scene, camera);
        };
        animate(0);

        rendererRef.current = renderer;
        cameraRef.current = camera;

        const onResize = () => {
            if (rendererRef.current && cameraRef.current) {
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                if (material.uniforms) {
                    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
                }
            }
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            renderer.dispose();
        };
    }, [theme]);


    return (
        
                <canvas ref={canvasRef} className="fixed inset-0 top-0 left-0 w-screen h-screen z-[-1] " >
         {/* {
            !toggle && (
                <div className=" fixed top-2 left-99 z-[9999999999999999999]">
                    <Button onClick={() => setTheme('default')} variant="contained" color="primary">Default</Button>
                    <Button onClick={() => setTheme('greenforest')} variant="contained" color="success">Green Forest</Button>
                    <Button onClick={() => setTheme('redinferno')} variant="contained" color="error">Red Inferno</Button>
                </div>
            )
         } */}
                    
                </canvas>
      
    );
}

export default Background;
