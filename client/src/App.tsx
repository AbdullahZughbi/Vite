import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

export default function Minecraft() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene & camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // light blue sky

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new PointerLockControls(camera, mount);
    mount.addEventListener("click", () => {
      controls.lock();
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Add a cube mesh so you can see something!
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    scene.add(cube);

    // Player movement variables
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let moveForward = false,
      moveBackward = false,
      moveLeft = false,
      moveRight = false;
    let canJump = false;

    function onKeyDown(event: KeyboardEvent) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward = true;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveLeft = true;
          break;
        case "ArrowDown":
        case "KeyS":
          moveBackward = true;
          break;
        case "ArrowRight":
        case "KeyD":
          moveRight = true;
          break;
        case "Space":
          if (canJump) velocity.y += 10;
          canJump = false;
          break;
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveLeft = false;
          break;
        case "ArrowDown":
        case "KeyS":
          moveBackward = false;
          break;
        case "ArrowRight":
        case "KeyD":
          moveRight = false;
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 10.0 * delta; // gravity

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.getObject().position.y += velocity.y * delta;

      if (controls.getObject().position.y < 2) {
        velocity.y = 0;
        controls.getObject().position.y = 2;
        canJump = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}