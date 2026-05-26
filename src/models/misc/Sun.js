import * as THREE from 'three';

export function createSun() {
  const group = new THREE.Group();

  function fogless(mat) { mat.fog = false; return mat; }

  const coreMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffe866),
    emissiveIntensity: 5.0,
    roughness: 0.0,
    metalness: 0.0,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), coreMat));

  const innerMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: new THREE.Color(0xff8800),
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.38,
    side: THREE.BackSide,
    depthWrite: false,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(8, 32, 32), innerMat));

  const outerMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: new THREE.Color(0xff4400),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    depthWrite: false,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(14, 24, 24), outerMat));

  const light = new THREE.DirectionalLight(0xfff2d0, 2.8);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 230;
  light.shadow.camera.left = light.shadow.camera.bottom = -30;
  light.shadow.camera.right = light.shadow.camera.top = 30;
  light.shadow.bias = -0.0005;
  light.shadow.normalBias = 0.01;
  
  let t = 0;
  function update(delta) {
    t += delta;
    coreMat.emissiveIntensity = 4.8 + Math.sin(t * 1.10) * 0.40;
    innerMat.opacity = 0.34 + Math.sin(t * 0.70) * 0.07;
    innerMat.emissiveIntensity = 2.2 + Math.sin(t * 0.90 + 0.5) * 0.40;
    outerMat.opacity = 0.10 + Math.sin(t * 0.50 + 1.2) * 0.04;
  }

  return { mesh: group, light, update };
}
