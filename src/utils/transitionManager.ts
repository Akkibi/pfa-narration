import * as THREE from "three";

export class TransitionManager {
    private transitionMesh: THREE.Mesh;
    private transitionMaterial: THREE.ShaderMaterial;
    private transitionScene: THREE.Scene;
    private transitionCamera: THREE.OrthographicCamera;
    private currentScene: THREE.Scene | null = null;
    private nextScene: THREE.Scene | null = null;
    private progress: number = 0;
    public isTransitioning: boolean = false;
    private transitionDuration: number = 1.0; // in seconds
    private currentRenderTarget: THREE.WebGLRenderTarget | null = null;
    private nextRenderTarget: THREE.WebGLRenderTarget | null = null;

    constructor() {
        // Create orthographic camera for rendering the transition
        this.transitionCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Create scene for transition
        this.transitionScene = new THREE.Scene();

        // Create shader material for transition
        this.transitionMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tCurrentScene: { value: null },
                tNextScene: { value: null },
                transitionFactor: { value: new THREE.Texture() },
                progress: { value: 0.0 },
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform sampler2D tCurrentScene;
        uniform sampler2D tNextScene;
        uniform sampler2D transitionFactor;
        uniform float progress;
        varying vec2 vUv;

        void main() {
          vec4 factorColor = texture2D(transitionFactor, vUv);
          float threshold = factorColor.r; // Use red channel as threshold

          vec4 currentColor = texture2D(tCurrentScene, vUv);
          vec4 nextColor = texture2D(tNextScene, vUv);

          // Compare factor threshold with progress
          float mixFactor = step(threshold, progress);

          gl_FragColor = mix(currentColor, nextColor, mixFactor);
        }
      `,
            transparent: true,
        });

        // Create a full-screen quad for rendering the transition
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.transitionMesh = new THREE.Mesh(geometry, this.transitionMaterial);
        this.transitionScene.add(this.transitionMesh);
    }

    public loadTransitionTexture(path: string): Promise<void> {
        return new Promise((resolve) => {
            new THREE.TextureLoader().load(path, (texture) => {
                this.transitionMaterial.uniforms.transitionFactor.value = texture;
                resolve();
            });
        });
    }

    public startTransition(
        currentScene: THREE.Scene,
        nextScene: THREE.Scene,
        duration: number = 1.0,
    ): void {
        if (this.isTransitioning) return;

        this.currentScene = currentScene;
        this.nextScene = nextScene;
        this.progress = 0;
        this.isTransitioning = true;
        this.transitionDuration = duration;

        // Create render targets with the correct size and format
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        // Clean up existing render targets
        if (this.currentRenderTarget) this.currentRenderTarget.dispose();
        if (this.nextRenderTarget) this.nextRenderTarget.dispose();

        // Create new render targets with the correct parameters
        this.currentRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: true,
        });

        this.nextRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: true,
        });
    }

    public update(renderer: THREE.WebGLRenderer, deltaTime: number): boolean {
        if (!this.isTransitioning || !this.currentScene || !this.nextScene)
            return false;
        if (!this.currentRenderTarget || !this.nextRenderTarget) return false;

        // Update progress
        this.progress += deltaTime / this.transitionDuration;

        if (this.progress >= 1.0) {
            this.isTransitioning = false;
            this.progress = 1.0;

            // Clean up
            if (this.currentRenderTarget) {
                this.currentRenderTarget.dispose();
                this.currentRenderTarget = null;
            }

            if (this.nextRenderTarget) {
                this.nextRenderTarget.dispose();
                this.nextRenderTarget = null;
            }

            return true; // Transition complete
        }

        // Set progress uniform
        this.transitionMaterial.uniforms.progress.value = this.progress;

        // Store the current render target and renderer state
        const originalRenderTarget = renderer.getRenderTarget();
        const originalClearColor = new THREE.Color();
        const originalClearAlpha = renderer.getClearAlpha();
        renderer.getClearColor(originalClearColor);

        // Render current scene to target
        // Important: We need to set the clear color to match the scene background
        if (this.currentScene.background instanceof THREE.Color) {
            renderer.setClearColor(this.currentScene.background, 1.0);
        }
        renderer.setRenderTarget(this.currentRenderTarget);
        renderer.clear();
        renderer.render(this.currentScene, this.currentScene.userData.camera);

        // Render next scene to target
        if (this.nextScene.background instanceof THREE.Color) {
            renderer.setClearColor(this.nextScene.background, 1.0);
        }
        renderer.setRenderTarget(this.nextRenderTarget);
        renderer.clear();
        renderer.render(this.nextScene, this.nextScene.userData.camera);

        // Restore original render target and clear color
        renderer.setRenderTarget(originalRenderTarget);
        renderer.setClearColor(originalClearColor, originalClearAlpha);

        // Set textures to material
        this.transitionMaterial.uniforms.tCurrentScene.value =
            this.currentRenderTarget.texture;
        this.transitionMaterial.uniforms.tNextScene.value =
            this.nextRenderTarget.texture;

        // Render transition scene
        renderer.render(this.transitionScene, this.transitionCamera);

        return false; // Transition not complete yet
    }

    // Called when window is resized
    public handleResize(): void {
        if (!this.isTransitioning) return;

        // Resize render targets if they exist
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        if (this.currentRenderTarget) {
            this.currentRenderTarget.setSize(width, height);
        }

        if (this.nextRenderTarget) {
            this.nextRenderTarget.setSize(width, height);
        }
    }

    // Clean up resources
    public dispose(): void {
        if (this.currentRenderTarget) {
            this.currentRenderTarget.dispose();
        }

        if (this.nextRenderTarget) {
            this.nextRenderTarget.dispose();
        }

        this.transitionMaterial.dispose();
        (this.transitionMesh.geometry as THREE.BufferGeometry).dispose();
    }
}
