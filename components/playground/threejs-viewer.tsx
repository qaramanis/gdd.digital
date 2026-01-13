"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Box, AlertCircle } from "lucide-react";

interface ThreeJSViewerProps {
  url: string;
  format: string;
}

export function ThreeJSViewer({ url, format }: ThreeJSViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Clock for animations
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // Load model based on format
    const loadModel = async () => {
      setLoading(true);
      setError(null);
      setProgress(0);

      const onProgress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const onError = (err: unknown) => {
        console.error("Error loading model:", err);
        setError(`Failed to load ${format.toUpperCase()} file`);
        setLoading(false);
      };

      try {
        let object: THREE.Object3D | null = null;

        if (format === "fbx") {
          const loader = new FBXLoader();
          object = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(url, resolve, onProgress, reject);
          });

          // Handle FBX animations
          if ((object as THREE.Group).animations?.length > 0) {
            const mixer = new THREE.AnimationMixer(object);
            mixerRef.current = mixer;
            const action = mixer.clipAction((object as THREE.Group).animations[0]);
            action.play();
          }
        } else if (format === "obj") {
          const loader = new OBJLoader();
          object = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(url, resolve, onProgress, reject);
          });
        }

        if (object) {
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Center the model
          object.position.sub(center);

          // Scale to fit in view
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 5 / maxDim;
          object.scale.multiplyScalar(scale);

          // Apply default material if none exists
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // If no material or basic material, apply a better one
              if (!child.material || (child.material as THREE.Material).type === "MeshBasicMaterial") {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x808080,
                  roughness: 0.5,
                  metalness: 0.1,
                });
              }
            }
          });

          scene.add(object);

          // Adjust camera to fit model
          const distance = maxDim * scale * 2;
          camera.position.set(distance, distance, distance);
          controls.update();
        }

        setLoading(false);
      } catch (err) {
        onError(err);
      }
    };

    loadModel();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Update animations
      if (mixerRef.current && clockRef.current) {
        mixerRef.current.update(clockRef.current.getDelta());
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [url, format]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-16 w-16 text-destructive/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load model</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
          <Box className="h-12 w-12 text-muted-foreground/50 mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Loading {format.toUpperCase()} model...
          </p>
          {progress > 0 && (
            <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
          )}
        </div>
      )}
    </div>
  );
}
