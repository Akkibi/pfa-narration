import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";

export class NpcMaterial {
    private material: THREE.ShaderMaterial;
    private scene_id: string;

    constructor(scene_id: string) {
        this.scene_id = scene_id;

        this.material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    vUv = uv;

                    // Pass world normal and world position to fragment shader
                    vNormal = normalize(normalMatrix * normal);
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    // Compute view direction
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    vec3 normal = normalize(vNormal);

                    // Fresnel term: higher at grazing angles
                    float fresnel = pow(0.1 - dot(normal, viewDirection), 1.4); // Use a higher exponent for a softer falloff

                    // Color transition: from black (center) to purple (edges)
                    vec3 edgeColor = vec3(0.5, 0.2, 1.0); // Purple (adjust as needed)
                    vec3 finalColor = mix( edgeColor, vec3(0.0) , fresnel); // Mix from black to purple based on fresnel

                    gl_FragColor = vec4(finalColor, fresnel);
                }
            `,

            side: THREE.FrontSide,
            transparent: true,
        });

        eventEmitterInstance.on(
            `characterPositionChanged-${this.scene_id}`,
            this.updateUniform.bind(this),
        );
    }

    private updateUniform() {
        // this.material.uniforms.cameraPosition.value.copy(this.camera.position);
    }

    getMaterial() {
        return this.material;
    }
}
