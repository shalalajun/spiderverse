import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/test/vertex.glsl'
import shadowFragmentShader from './shaders/test/fragment.glsl'
import fragmentShader from './shaders/test/styleFragmentshader.glsl'
import { ShadowMapViewer } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

let box;
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#eff62e')
const group = new THREE.Group()
scene.add(group)
const meshProp = []
const helpers = []
const intensity_0 = new THREE.Vector4(1, 0, 0, 0);
const clock = new THREE.Clock();
const lightColor = new THREE.Color(0xffffff)
let monkey;
let boy;
let mixer;
let animations = {};

let start = Date.now();
let current = start;
let elapsed = 0;
let elapsedScalar = 0;
let delta = 16;
let deltaScalar = delta * 0.001;
let material;

const loader = new GLTFLoader();

const tex = new THREE.TextureLoader().load('gwenTex.png' )
tex.flipY = false;
tex.encoding = THREE.sRGBEncoding;
console.log(tex)

loader.load('gwen.glb', function(gltf) {
    boy = gltf.scene;
    boy.scale.set(5.3, 5.3, 5.3);
    boy.position.set(0.2, -6.9, 0);
    console.log(gltf.animations)
    scene.add(boy);


    animations.mixer = new THREE.AnimationMixer(boy);
    animations.action = animations.mixer.clipAction(gltf.animations[0])
    animations.action.reset()
    animations.action.play()


    console.log('Animations:', gltf.animations); // 애니메이션 클립 확인

    boy.traverse(function(node) {
        if (node.isMesh) {
            const { material, shadowMaterial } = createMaterial(
                params.color, 
                params.colorThresholds, 
                params.colorSmooth, 
                params.shadowColor, 
                params.shadowThresholds, 
                params.shadowSmooth, 
                params.reflectColor, 
                params.reflectThresholds, 
                params.reflectSmooth, 
                vertexShader, 
                fragmentShader
            );
            node.material = material;
            meshProp.push({
                mesh: node,
                material: material,
                shadowMaterial: shadowMaterial,
            });

            // node.castShadow = true
            // node.receiveShadow = true
        }
    });
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-10, -2.5, 2 );
//camera.lookAt(scene.position);
scene.add(camera)


//light
const light = new THREE.DirectionalLight( lightColor, 1.0 );
// The light is directed from the light's position to the origin of the world coordinates.
light.position.set(2, 8, -4);

scene.add(light);


const lightHelper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add(lightHelper);

//shadowCamera
const frustumSize = 10;

const shadowCamera = light.shadow.camera = new THREE.OrthographicCamera(
    -frustumSize / 2,
    frustumSize / 2,
    frustumSize / 2,
    -frustumSize / 2,
    1,
    20
);
light.shadow.bias =  0.005
light.shadow.normalBias = 0.001; 
light.shadow.radius = 1.2;
// Same position as LIGHT position.
light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(scene.position);
scene.add(light.shadow.camera);

const shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( shadowCameraHelper );


light.shadow.mapSize.x = 2048;
light.shadow.mapSize.y = 2048;

var pars = { 
            minFilter: THREE.NearestFilter, 
            magFilter: THREE.NearestFilter, 
            format: THREE.RGBAFormat 
          };
//버퍼(Buffer)는 데이터를 일시적으로 저장하는 메모리 공간입니다. 여기서 웹지엘렌더 타겟도 그림자를 그리기위한 버퍼이다.
light.shadow.map = new THREE.WebGLRenderTarget( light.shadow.mapSize.x, light.shadow.mapSize.y, pars );


const shadowMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: shadowFragmentShader
});


const params = {
    color: 0xffffff,
    colorThresholds: 0,
    colorSmooth: 0,
    shadowColor: 0xbd00ad,
    shadowThresholds: 0.518,
    shadowSmooth: 0.0,
    reflectColor: 0xaf40ce,
    reflectThresholds: 0.447,
    reflectSmooth: 0.053,
};


function createMesh() {
    //createGround()

    const sphere_s = createObj(new THREE.SphereGeometry(1, 32, 32), params.color, params.colorThresholds, params.colorSmooth, params.shadowColor, params.shadowThresholds, params.shadowSmooth, params.reflectColor, params.reflectThresholds, params.reflectSmooth);
    sphere_s.position.set(-4, 2, 0);
    sphere_s.visible=false;

    const cylinder = createObj(new THREE.CylinderGeometry(10, 10, 40, 32), params.color, params.colorThresholds, params.colorSmooth, params.shadowColor, params.shadowThresholds, params.shadowSmooth, params.reflectColor, params.reflectThresholds, params.reflectSmooth);
    cylinder.position.set(-20, 20, 40);
    cylinder.visible = false;

    const sphere = createObj(new THREE.SphereGeometry(24, 32, 32), params.color, params.colorThresholds, params.colorSmooth, params.shadowColor, params.shadowThresholds, params.shadowSmooth, params.reflectColor, params.reflectThresholds, params.reflectSmooth);
    sphere.position.set(-60, 24, 0);
    sphere.visible = false;

    box = createObj(new THREE.BoxGeometry(20, 20, 20), params.color, params.colorThresholds, params.colorSmooth, params.shadowColor, params.shadowThresholds, params.shadowSmooth, params.reflectColor, params.reflectThresholds, params.reflectSmooth);
    box.position.set(40, 10, -30);
    box.visible = false;

    const cone = createObj(new THREE.ConeGeometry(20, 30, 32), params.color, params.colorThresholds, params.colorSmooth, params.shadowColor, params.shadowThresholds, params.shadowSmooth, params.reflectColor, params.reflectThresholds, params.reflectSmooth)
    cone.position.set(37, 15, 25);
    cone.visible=false;
}

function createObj(geometry, color, colorThresholds, colorSmooth, shadowColor, shadowThresholds, shadowSmooth,reflectColor, reflectThresholds, reflectSmooth){

    const {material, shadowMaterial} = createMaterial(color, colorThresholds, colorSmooth, shadowColor, shadowThresholds, shadowSmooth,reflectColor, reflectThresholds, reflectSmooth, vertexShader, fragmentShader);

    const mesh = new THREE.Mesh(geometry, material);

    group.add(mesh);

    meshProp.push({
        mesh,
        material,
        shadowMaterial,
    });

    return mesh;
}

function createMaterial(color, colorThresholds, colorSmooth, shadowColor, shadowThresholds, shadowSmooth,reflectColor, reflectThresholds, reflectSmooth, vertexShader, fragmentShader){
    const uniforms = {


        uTime: {
            value: 0
        },

        uTex: {
            value : tex
        },

        uResolution : {

            value : new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
        },

        uLightColor: {
            value: lightColor
        },

        uColor: {
            value: new THREE.Color(color)
        },
        uColorThresholds: {
            value: colorThresholds
        },
        uColorSmooth: {
            value: colorSmooth
        },


        uShadowColor: {
            value: new THREE.Color(shadowColor)
        },
        uShadowThresholds: {
            value: shadowThresholds
        },
        uShadowSmooth: {
            value: shadowSmooth
        },


        uReflectColor: {
            value: new THREE.Color(reflectColor)
        },
        uReflectThresholds: {
            value: reflectThresholds
        },
        uReflectSmooth: {
            value: reflectSmooth
        },
        
        
        uLightPos: {
            value: light.position
        },

        uBias: {
            value: light.shadow.bias
        },  

        uNormalBias: {
            value: light.shadow.normalBias
        },  

        uShadowRadius : {
            value: light.shadow.radius
        },

        uDepthMap: {
            value: light.shadow.map.texture
        },
        uShadowCameraP: {
            value: shadowCamera.projectionMatrix
        },
        uShadowCameraV: {
            value: shadowCamera.matrixWorldInverse
        },
        uCameraPosition : {
            value: camera.position
        },

        uIntensity_0: {
            value: intensity_0
        },

    }
    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });

    // const material = new THREE.MeshStandardMaterial({});

    const shadowMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: shadowFragmentShader,
        uniforms,
        // side: THREE.BackSide
    });

    return {material, shadowMaterial}
}



function createGround(){
    //const geometry = new THREE.BoxGeometry(250, 250, 250);
    const geometry = new THREE.PlaneGeometry(200,200)
    geometry.rotateX(-Math.PI / 2);

    const {material, shadowMaterial} = createMaterial(0xffffff,  1.0, 1.0, 0xff4200, 0.44, 0.0, 0x00f6ff, 0.324, 0.0, vertexShader, fragmentShader);

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.y = -3

    meshProp.push({
        mesh: mesh,
        material: material,
        shadowMaterial: shadowMaterial,
    });

    group.add(mesh);
}




const depthViewer = new ShadowMapViewer(light);
depthViewer.size.set( 300, 300 );


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
  
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
//renderer.shadowMap.enabled = true
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const updateLight=()=>{
    const delta = clock.getDelta()

    let x = light.position.x;
    let z = light.position.z;

    const s = Math.sin(delta * 0.2);
    const c = Math.cos(delta * 0.2);

    const nx = x * c - z * s;
    const nz = x * s + z * c;

    light.position.x = nx;
    light.position.z = nz;

    light.shadow.camera.position.copy(light.position);
    light.shadow.camera.lookAt(scene.position);
   // console.log(light.position.x)
}

function updateMesh() {
    for (let i = 0; i < meshProp.length; i++) {
        const { material, shadowMaterial } = createMaterial(
            params.color, 
            params.colorThresholds, 
            params.colorSmooth, 
            params.shadowColor, 
            params.shadowThresholds, 
            params.shadowSmooth, 
            params.reflectColor, 
            params.reflectThresholds, 
            params.reflectSmooth, 
            vertexShader, 
            fragmentShader
        );

        meshProp[i].material = material;
        meshProp[i].shadowMaterial = shadowMaterial;
        meshProp[i].mesh.material = material;
    }
}


/**
 * Animate
 */
const tick = () => {

    const currentTime = Date.now();
    delta = currentTime - current;
    deltaScalar = delta * 0.001;
    current = currentTime;
    elapsed = current - start;
    elapsedScalar = elapsed * 0.001;
    // Update controls
    controls.update();
    //updateLight()

  

    // Render shadow map
    for (let i = 0; i < meshProp.length; i++) {
        const meshProps = meshProp[i];
        meshProps.mesh.material = meshProps.shadowMaterial;
    }

    for (let i = 0; i < helpers.length; i++) {
        helpers[i].visible = false;
    }

    renderer.setRenderTarget(light.shadow.map);
    renderer.render(scene, light.shadow.camera);

    // Render scene
    for (let i = 0; i < meshProp.length; i++) {
        const meshProps = meshProp[i];
        meshProps.mesh.material = meshProps.material;
    }

    // if (monkey) {
    //     monkey.rotation.y += 0.01;
    // }

      // Update mixer for animations
      if (animations.mixer) {
        animations.mixer.update(deltaScalar);
      }
       


    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};


gui.addColor(params, 'color').name('Color').onChange(updateMesh);
gui.add(params, 'colorThresholds', 0, 1).name('Color Thresholds').onChange(updateMesh);
gui.add(params, 'colorSmooth', 0, 1).name('Color Smooth').onChange(updateMesh);
gui.addColor(params, 'shadowColor').name('Shadow Color').onChange(updateMesh);
gui.add(params, 'shadowThresholds', 0, 1).name('Shadow Thresholds').onChange(updateMesh);
gui.add(params, 'shadowSmooth', 0, 1).name('Shadow Smooth').onChange(updateMesh);
gui.addColor(params, 'reflectColor').name('Reflect Color').onChange(updateMesh);
gui.add(params, 'reflectThresholds', 0, 1).name('Reflect Thresholds').onChange(updateMesh);
gui.add(params, 'reflectSmooth', 0, 1).name('Reflect Smooth').onChange(updateMesh);


createMesh()
tick()