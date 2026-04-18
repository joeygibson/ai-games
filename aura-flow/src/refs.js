import * as THREE from 'three'

// Shared mutable state between components (no re-renders)
export const playerPosition = new THREE.Vector3(0, 2, 0)
export const playerVelocity = new THREE.Vector3(0, 0, 0)