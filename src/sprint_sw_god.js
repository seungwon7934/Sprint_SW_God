import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import Stats from './jsm/libs/stats.module.js';


const clock = new THREE.Clock();

let mixer;



init();
animate();

function init() {
    let rot = 0; // 각도

    const container = document.createElement( 'div' );
				document.body.appendChild( container );
    const canvas = document.getElementById("canvas");
    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    });

    // Scene
    const scene = new THREE.Scene();


    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 5 );
				hemiLight.position.set( 0, 200, 0 );
				scene.add( hemiLight );

				const dirLight = new THREE.DirectionalLight( 0xffffff, 5 );
				dirLight.position.set( 0, 200, 100 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 180;
				dirLight.shadow.camera.bottom = - 100;
				dirLight.shadow.camera.left = - 120;
				dirLight.shadow.camera.right = 120;
				scene.add( dirLight );

    // Fog - 있으나 없으나 무방하나 일단 유지
    // scene.fog = new THREE.Fog(0xaaaaaa, 50, 2000);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

    // Camera start position - 출발 지점
    camera.position.x = 60;
    camera.position.z = 0;
    camera.position.y = 10;

    const loader = new FBXLoader();
    loader.load( 'models/fbx/Running.fbx', function ( object ) {
        object.position.set(0, 0.5, 0);
        object.scale.set(0.01, 0.01, 0.01);

        object.rotation.y = -7.8;
        mixer = new THREE.AnimationMixer( object );

        const action = mixer.clipAction( object.animations[ 0 ] );
        action.play();


        scene.add( object );

    } );

    // Geometry
    // const geometry = new THREE.Geometry();

    // for (let i = 0; i < 40000; i++) {
    //     const star = new THREE.Vector3();
    //     // 눈) x : 2000, y : 20000, 우주 여행) x : 20000, y : 2000
    //     star.x = THREE.Math.randFloatSpread(2000);
    //     star.y = THREE.Math.randFloatSpread(20000);
    //     star.z = THREE.Math.randFloatSpread(2000);

    //     geometry.vertices.push(star)
    // }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(40000 * 3);

    for (let i = 0; i < 40000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(20000);
        const z = THREE.MathUtils.randFloatSpread(2000);

        const offset = i * 3;

        vertices[offset] = x;
        vertices[offset + 1] = y;
        vertices[offset + 2] = z;
    }

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const boxGeomtery = new THREE.BoxGeometry(100, 1, 5);

    // Meterial
    const material = new THREE.PointsMaterial({
        color: 0xffffff
    });

    const boxMeterial = new THREE.MeshBasicMaterial({ color: 'white' });

    // Mesh and Add to Camera
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    const boxMesh = new THREE.Mesh(boxGeomtery, boxMeterial);
    scene.add(boxMesh);

    // AxesHelper - xyz축 표시
    const axexHelper = new THREE.AxesHelper(4);
    scene.add(axexHelper)

    // OrbitControls - 카메라 위치, 각도 조정 (마우스)
    const orbitControls = new OrbitControls(camera, canvas);


    // Render
    function render() {
        rot += 0.1;
        // 각도 변환
        const radian = rot * (Math.PI / 180);

        // 각도 변화에 따른 카메라 위치 설정
        // camera.position.x = 1000 * Math.sin(radian);
        // camera.position.z = 1000 * Math.cos(radian);

        // // 원점
        // camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))

        // 카메라 시점 변환 업데이트
        orbitControls.update()

        // 눈 - Mesh가 움직임
        starField.position.y = 9500 * Math.cos(radian / 4 % Math.PI);
        
        // 우주여행
        // starField.position.x = -9500 * Math.cos(radian / 4 % Math.PI);
        
        // 렌더링
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    // 창 크기조절 이벤트
    window.addEventListener("resize", onResize);

    function onResize() {
        // 현재 크기
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 렌더링에서의 크기 조정
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);


        // 카메라에서의 비율 조정
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    // 초기화
    onResize();
}

function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    

}