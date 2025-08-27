import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DashboardCube() {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Auto-rotate the cube
  useFrame((state, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Create textures for each face with different chart types
  const createChartTexture = (type, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    // #AEAEAE
    
    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 236, 236);
    
    // Chart content based on type
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    switch (type) {
      case 'bar':
        // Bar chart
        for (let i = 0; i < 5; i++) {
          const height = 50 + Math.random() * 100;
          ctx.fillRect(30 + i * 40, 200 - height, 30, height);
        }
        break;
      case 'pie':
        // Pie chart
        const centerX = 128;
        const centerY = 128;
        const radius = 60;
        let startAngle = 0;
        const slices = [0.3, 0.25, 0.2, 0.15, 0.1];
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
        
        slices.forEach((slice, index) => {
          const endAngle = startAngle + slice * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = colors[index];
          ctx.fill();
          startAngle = endAngle;
        });
        break;
      case 'line':
        // Line chart
        ctx.beginPath();
        ctx.moveTo(30, 180);
        for (let i = 1; i < 8; i++) {
          const x = 30 + i * 30;
          const y = 100 + Math.random() * 80;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Add points
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const x = 30 + i * 30;
          const y = 100 + Math.random() * 80;
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
      case 'scatter':
        // Scatter plot
        for (let i = 0; i < 20; i++) {
          const x = 30 + Math.random() * 196;
          const y = 30 + Math.random() * 196;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
      case 'heatmap':
        // Heatmap
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            const intensity = Math.random();
            ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`;
            ctx.fillRect(30 + i * 24, 30 + j * 24, 20, 20);
          }
        }
        break;
      case 'area':
        // Area chart
        ctx.beginPath();
        ctx.moveTo(30, 200);
        for (let i = 1; i < 8; i++) {
          const x = 30 + i * 30;
          const y = 100 + Math.random() * 60;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(240, 200);
        ctx.closePath();
        ctx.globalAlpha = 0.6;
        ctx.fill();
        break;
    }
    
    // Add title
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), 128, 30);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const materials = [
    new THREE.MeshLambertMaterial({ map: createChartTexture('bar', '#3B82F6') }),
    new THREE.MeshLambertMaterial({ map: createChartTexture('pie', '#8B5CF6') }),
    new THREE.MeshLambertMaterial({ map: createChartTexture('line', '#10B981') }),
    new THREE.MeshLambertMaterial({ map: createChartTexture('scatter', '#F59E0B') }),
    new THREE.MeshLambertMaterial({ map: createChartTexture('heatmap', '#EF4444') }),
    new THREE.MeshLambertMaterial({ map: createChartTexture('area', '#06B6D4') }),
  ];

  return (
    <>
      <OrbitControls enableZoom={false} enablePan={false} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh
        ref={meshRef}
        material={materials}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[2, 2, 2]} />
      </mesh>
    </>
  );
}

export default DashboardCube;