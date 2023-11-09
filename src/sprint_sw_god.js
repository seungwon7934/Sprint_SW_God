import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import Stats from './jsm/libs/stats.module.js';

// 코드 구조
// init() -> function init() 실행
// function init() 구조
// 변수 (시간, 모델 움직임, 캔버스, 렌더링, Scene, Light, Camera, 
// Geometry, material, Mesh, Audio)
// 모델 오브젝트 호출
// 이벤트 리스너 (창 크기조절, 좌우&위 방향키)
// 함수 (render, 모델 애니메이션, Mesh 애니메이션, 모델 좌우 방향, 점프)


// 시작
init();

function init() {

    // 애니메이션 변화를 위한 time 변수 
    const clock = new THREE.Clock();

    // 모델 자연스러운 좌우 움직임을 위한 변수
    let lastUpdateTime = 0;
    const updateInterval = 1; // 1초
    const movementSpeed = 0.05;
    var targetZ, currentZ;
    let mixer;
    var player;
    var game = {
        input: { left: false, right: false }
    };

    // 캔버스 오브젝트
    const container = document.createElement('div');
    document.body.appendChild(container);
    const canvas = document.getElementById("canvas");


    // Render 변수 
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    });

    // Scene 변수
    const scene = new THREE.Scene();

    // Light 변수
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // Camera 변수
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
    // Camera 위치 조정
    camera.position.x = 5;
    camera.position.z = 0;
    camera.position.y = 10;

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

    // Star Object
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = new Float32Array(40000 * 3);

    for (let i = 0; i < 20000; i++) {

        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloatSpread(20000);
        const z = THREE.MathUtils.randFloatSpread(1000);

        const offset = i * 3;

        starVertices[offset] = x;
        starVertices[offset + 1] = y;
        starVertices[offset + 2] = z;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starVertices, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff
    });
    const starField = new THREE.Points(starGeometry, material);

    // Road Object - 모델이 약 2분동안 달릴수 있게 설정
    const RoadGeomtery = new THREE.BoxGeometry(2000, 1, 10);
    const RoadMeterial = new THREE.MeshBasicMaterial({ color: 'white' });
    const roadMesh = new THREE.Mesh(RoadGeomtery, RoadMeterial);
    roadMesh.position.x = -999;

    // Add to camera
    scene.add(starField);
    scene.add(roadMesh);

    // AxesHelper - xyz축 표시, 실제 영상에서는 제외
    const axexHelper = new THREE.AxesHelper(4);
    scene.add(axexHelper)

    // OrbitControls - 카메라 위치, 각도 조정 (마우스)
    const orbitControls = new OrbitControls(camera, canvas);
    // 사용자가 카메라 임의로 수정 금지
    orbitControls.enableRotate = false;
    orbitControls.enableZoom = false;
    orbitControls.enablePan = false;

    // AudioListener를 생성하여 카메라에 추가
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // 글로벌 오디오 소스 생성
    const sound = new THREE.Audio(listener);

    // 사운드를 로드하고 오디오 객체의 버퍼로 설정
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./src/sounds/Duggy-Colors.ogg', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.25);
        sound.play();
    });


    // 모델 호출
    const loader = new FBXLoader();
    loader.load('models/fbx/Running (2).fbx', function (object) {
        object.position.set(0, 0.5, 0);
        object.scale.set(0.01, 0.01, 0.01);

        object.rotation.y = -7.8;
        mixer = new THREE.AnimationMixer(object);

        const action = mixer.clipAction(object.animations[0]);
        action.play();

        player = object;
        scene.add(player);
    });

    // 키보드 좌, 우, 윗방향키 클릭 시 모델 위치 수정을 위한 이벤트 리스너
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 37) game.input.left = true;
        if (event.keyCode === 39) game.input.right = true;
        if (event.keyCode === 38) {
            if (player.position.y == 0.5) jumpPlayer();
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.keyCode === 37) game.input.left = false;
        if (event.keyCode === 39) game.input.right = false;
    });

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
    onResize();

    // 각도계산을 위해 필요한 변수 선언
    let rot = 0;
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
        orbitControls.update();

        // 눈 - Mesh가 움직임, 약 2분가량 동작 후 재시작
        starField.position.y = 9500 * Math.cos(radian / 4 % Math.PI);

        // 우주여행
        // starField.position.x = -9500 * Math.cos(radian / 4 % Math.PI);
        
        camera.lookAt(new THREE.Vector3(-2, 7, 0));
        updatePlayer();

        // 렌더링
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    var x;
    // 모델 애니메이션 작동을 위한 함수
    function animate() {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        renderer.render(scene, camera);
        x = requestAnimationFrame(animate);
        
        // road x좌표가 1000이상 증가시 모델 정지
        if(roadMesh.position.x > 1000)
        cancelAnimationFrame(x);
    }
    animate()

    var id;
    // Mesh 애니메이션 함수
    function meshAnimate() {

        
        // 도로 움직이는 애니메이션
        const elapsedTime = clock.getElapsedTime();
        roadMesh.position.x += elapsedTime * 0.01;
        console.log(roadMesh.position.x);
        renderer.render(scene, camera);

        id = requestAnimationFrame(meshAnimate);

        // 1000이상 증가시 mesh 정지
        if(roadMesh.position.x > 1000)
            cancelAnimationFrame(id);
    }
    meshAnimate();

    // 뚝뚝 끊기는 좌우 이동 함수
    function updatePlayer(currentTime) {
        if (currentTime - lastUpdateTime >= updateInterval) {
            lastUpdateTime = currentTime;

            // 23/11/08 - 좌우 범위 증가 + 좌우 이동시 부드럽게 이동
            if (game.input.right) {
                if (player.position.z > -4) player.position.z -= 0.1;
                // player.rotation.y = 0.05;
            } else if (game.input.left) {
                if (player.position.z < 4) player.position.z += 0.1;
                // player.rotation.y = -0.05;
            }
        }
        requestAnimationFrame(updatePlayer);
    }

    // 모델 점프 함수
    function jumpPlayer() {
        var initialY = player.position.y;
        var jumpHeight = 3;
        var jumpDuration = 1000; // 1 second (you can adjust this as needed)
        var startTime = Date.now();

        function animateJump() {
            var currentTime = Date.now();
            var elapsed = currentTime - startTime;
            if (elapsed < jumpDuration) {
                // Calculate the new Y position
                var newY = initialY + (Math.sin((elapsed / jumpDuration) * Math.PI) * jumpHeight);
                player.position.y = newY;
                requestAnimationFrame(animateJump);
            } else {
                // Jump animation is complete, reset the player's Y position
                player.position.y = initialY;
            }
        }
        animateJump();
    }
}

// 자연스러운 좌우 이동 (작동에 문제는 없지만, 콘솔에 에러가 떠서 임시 주석처리, 최종본에 이 코드를 사용했을 때 이상 없으면 수정 예정)
// function updatePlayer(currentTime) {


//     if (currentTime - lastUpdateTime >= updateInterval) {
//          targetZ = player.position.z; // 목표 위치
//          currentZ = player.position.z;
//         lastUpdateTime = currentTime;

//         if (game.input.right && targetZ > -1.5) {
//             targetZ -= 1.5;
//         } else if (game.input.left && targetZ < 1.5) {
//             targetZ += 1.5;
//         }

//         // 서서히 위치를 변경
//         if (currentZ < targetZ) {
//             currentZ = Math.min(currentZ + movementSpeed, targetZ);
//         } else if (currentZ > targetZ) {
//             currentZ = Math.max(currentZ - movementSpeed, targetZ);
//         }

//         player.position.z = currentZ;
//         // player.rotation.y = 0.05;
//     }

//     // 다음 프레임을 요청
//     requestAnimationFrame(updatePlayer);
// }

// requestAnimationFrame(updatePlayer);

// // 모델 애니메이션 작동을 위한 함수
// function animate() {

//     const delta = clock.getDelta();

//     if (mixer) mixer.update(delta);

//     // 도로 움직이는 애니메이션 - 작동 안됨

//     // const elapsedTime = clock.getElapsedTime();
//     // if(roadMesh) roadMesh.rotation.x = elapsedTime * Math.PI * 0.25;

//     requestAnimationFrame(animate);

// }
