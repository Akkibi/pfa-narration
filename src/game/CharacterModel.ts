import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const vertexShader = `
  // vertexShader.glsl
  varying vec2 vUv;

  void main() {
      vUv = uv; // Pass UV coordinates to fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;
const fragmentShader = `
  // fragmentShader.glsl
  uniform sampler2D albedo;
  uniform float time;

  varying vec2 vUv;

  void main() {
      vec4 texColor = texture2D(albedo, vUv);

      // Example modulation with time (just for demo)
      float pulse = 0.5 + 0.5 * sin(time);
      texColor.rgb *= pulse;

      gl_FragColor = texColor;
  }
  `;

export const loadGLTFModel = (src: string, imageSrc: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            `./${src}`,
            (gltf: { scene: THREE.Group }) => {
                const GLTFGroup = gltf.scene as THREE.Group;
                // GLTFMesh.material = this.material;

                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 1.0 },
                        albedo: { value: null },
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                });

                GLTFGroup.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.material = material;
                        console.log("set material to", object.name);
                    }
                });

                loadImage(imageSrc, (texture) => {
                    material.uniforms.albedo.value = texture;
                });
                resolve(GLTFGroup);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
                reject(error);
            },
        );
    });
};

export const loadImage = (url: string, onLoad: (texture: THREE.Texture) => void): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (texture: THREE.Texture) => {
                onLoad(texture);
                resolve();
            },
            undefined,
            (err) => {
                console.error(`Error loading texture from ${url}`, err);
                reject(err);
            },
        );
    });
};
