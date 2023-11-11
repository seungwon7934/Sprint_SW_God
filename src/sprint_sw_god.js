import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import Stats from './jsm/libs/stats.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.145.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://unpkg.com/three@0.145.0/examples/jsm/geometries/TextGeometry.js'
import gsap from './lib/gsap/index.js'

// 실행 절차:
// ready() -> 글자 클릭시 sprint_sw_god() 시작
// 코드 구조:
// 글로벌 변수 - 캔버스, 렌더링, Scene, Light, Camera, 
// Geometry, material, Mesh, Audio)
// 로컬 변수
// 모델 오브젝트 호출
// 이벤트 리스너 (창 크기조절, 좌우&위 방향키)
// 함수 (render, 모델 애니메이션, Mesh 애니메이션, 모델 좌우 방향, 점프)


// 글로벌 변수 
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
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 3, 500);

// Camera 위치 조정
camera.position.x = 5;
camera.position.y = 10;
camera.position.z = 0;

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

// 눈 생성 
const starGeometry = new THREE.BufferGeometry();
const starVertices = new Float32Array(40000 * 3);
const textureLoader = new THREE.TextureLoader();
const snowTexture = textureLoader.load("./src/imgs/alphaSnow.jpg");

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
const material = new THREE.PointsMaterial({});
material.size = 4;
material.transparent = true;
material.alphaMap = snowTexture;
material.depthTest = false;
const starField = new THREE.Points(starGeometry, material);
scene.add(starField);

// AxesHelper - xyz축 표시, 실제 영상에서는 제외
const axexHelper = new THREE.AxesHelper(4);
scene.add(axexHelper);

// OrbitControls - 카메라 위치, 각도 조정 (마우스)
const orbitControls = new OrbitControls(camera, canvas);

// 사용자가 카메라 임의로 수정 금지
orbitControls.enableRotate = false;
orbitControls.enableZoom = false;
orbitControls.enablePan = false;

// EventHandler
let mouseHandler = document.getElementById("canvas");

// window.addEventListener("mousedown", (e) => {
//     pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
//     pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
//     raycaster.setFromCamera(pointer, camera);
//     const intersects = raycaster.intersectObjects(scene.children);
//     if(intersects.length > 0){
//         if(oneIntersectMesh.length < 1){
//             oneIntersectMesh.push(intersects[0]);
//         }
//         console.log(oneIntersectMesh);
//         textMesh.visible = false;
//         startMesh.visible = false;
//         sprint_sw_god();
//     }
// }, {once: true})

// window.addEventListener("mousemove",(e) => {
//     pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
//     pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
//     raycaster.setFromCamera(pointer, camera);
//     const intersects = raycaster.intersectObjects(scene.children);
//     if(intersects.length > 0){
//         if(oneIntersectMesh.length < 1){
//             oneIntersectMesh.push(intersects[0]);
//         }
//         console.log(oneIntersectMesh);
//         gsap.to(oneIntersectMesh[0].object.scale, {
//             duration: 0.5,
//             x: 1.25,
//             y: 1.25,
//             z: 1.25
//         })
//     } else if(oneIntersectMesh[0]!== undefined){
//         gsap.to(oneIntersectMesh[0].object.scale, {
//             duration: 0.5,
//             x: 1,
//             y: 1,
//             z: 1
//         })
//         oneIntersectMesh.shift();
//     }
// });

// 시작

// default 모델 스킨
var modelPath = 'models/fbx/Running (2).fbx';

ready();
// setTimeout(() => {
//     sprint_sw_god();
// }, 1000)
// start();

function ready() {

    // 마우스 감지
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const oneIntersectMesh = [];

    // 텍스트 띄우는 코드
    let fontLoader = new FontLoader();
    fontLoader.load("./src/font/Do Hyeon_Regular.json", (font) => {
        let textGeometry = new TextGeometry(
            "Sprint SW Runner",
            {
                font: font,
                size: 0.7,
                height: 0,
                curveSegments: 12
            }
        );
        textGeometry.computeBoundingBox();
        let testXMid = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        textGeometry.translate(testXMid, 0, 0);

        let textMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.y = 10;
        textMesh.lookAt(new THREE.Vector3(5, 10, 0));
        scene.add(textMesh);


        // 스킨 선택 : 제임스
        let modelJamesGeometry = new TextGeometry(
            "James",
            {
                font: font,
                size: 0.5,
                height: 0,
                curveSegments: 12
            }
        );
        modelJamesGeometry.computeBoundingBox();
        let modelJamesXMid = -0.5 * (modelJamesGeometry.boundingBox.max.x - modelJamesGeometry.boundingBox.min.x);
        modelJamesGeometry.translate(modelJamesXMid, 0, 0);

        let modelJamesMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });
        const modelJamesMesh = new THREE.Mesh(modelJamesGeometry, modelJamesMaterial);
        modelJamesMesh.position.y = 9;
    
        modelJamesMesh.lookAt(new THREE.Vector3(5, 10, 0));
        scene.add(modelJamesMesh);

        // 스킨 선택 : 레미
        let modelRemyGeometry = new TextGeometry(
            "Remy",
            {
                font: font,
                size: 0.5,
                height: 0,
                curveSegments: 12
            }
        );
        modelRemyGeometry.computeBoundingBox();
        let modelRemyXMid = -0.5 * (modelRemyGeometry.boundingBox.max.x - modelRemyGeometry.boundingBox.min.x);
        modelRemyGeometry.translate(modelRemyXMid, 0, 0);

        let modelRemyMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });
        const modelRemyMesh = new THREE.Mesh(modelRemyGeometry, modelRemyMaterial);
        modelRemyMesh.position.y = 8;
        
        
        modelRemyMesh.lookAt(new THREE.Vector3(5, 10, 0));
        scene.add(modelRemyMesh);



        // 메쉬 안보이게하는 코드
        // textMesh.visible = false;

        let startGeometry = new TextGeometry(
            "Start!",
            {
                font: font,
                size: 0.7,
                height: 0,
                curveSegments: 12
            }
        );
        startGeometry.computeBoundingBox();
        let startXMid = -0.5 * (startGeometry.boundingBox.max.x - startGeometry.boundingBox.min.x);
        startGeometry.translate(startXMid, 0, 0);

        let startMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b00ff
        });
        const startMesh = new THREE.Mesh(startGeometry, startMaterial);
        startMesh.position.x = 2;
        startMesh.position.y = 7;
        startMesh.lookAt(new THREE.Vector3(5, 10, 0));
        scene.add(startMesh);

        // 마우스가 텍스트에 닿으면 텍스트 커짐
        function mousemoveListener(e) {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects.length > 0) {
                if (oneIntersectMesh.length < 1) {
                    oneIntersectMesh.push(intersects[0]);
                }
                console.log(oneIntersectMesh);
                gsap.to(oneIntersectMesh[0].object.scale, {
                    duration: 0.5,
                    x: 1.25,
                    y: 1.25,
                    z: 1.25
                })
            } else if (oneIntersectMesh[0] !== undefined) {
                gsap.to(oneIntersectMesh[0].object.scale, {
                    duration: 0.5,
                    x: 1,
                    y: 1,
                    z: 1
                })
                oneIntersectMesh.shift();
            }
        }

        // 텍스트 클릭시 시작하는 코드
        function mousedownListener(e) {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects.length > 0) {
                if (oneIntersectMesh.length < 1) {
                    oneIntersectMesh.push(intersects[0]);
                }
                console.log(oneIntersectMesh);

                // 각 버튼에 대한 처리
                if (oneIntersectMesh[0].object === textMesh) {
                    textMesh.visible = false;
                    startMesh.visible = false;
                    modelJamesMesh.visible = false;
                    modelRemyMesh.visible = false;

                    mouseHandler.removeEventListener("mousemove", mousemoveListener);
                    mouseHandler.removeEventListener("mousedown", mousedownListener);
                    sprint_sw_god();
                    Option.once = true;
                } else if (oneIntersectMesh[0].object === modelJamesMesh) {
                    modelPath = 'models/fbx/Running (1).fbx';
                }
                else if (oneIntersectMesh[0].object === modelRemyMesh) {
                    modelPath = 'models/fbx/Running (2).fbx';
                }   
                 else if (oneIntersectMesh[0].object === startMesh) {
                    textMesh.visible = false;
                    startMesh.visible = false;
                    modelJamesMesh.visible = false;
                    modelRemyMesh.visible = false;

                    mouseHandler.removeEventListener("mousemove", mousemoveListener);
                    mouseHandler.removeEventListener("mousedown", mousedownListener);
                    sprint_sw_god();
                    Option.once = true;
                }

                // 공통 처리
                // textMesh.visible = false;
                // startMesh.visible = false;
                // textMesh2.visible = false;

                // mouseHandler.removeEventListener("mousemove", mousemoveListener);
                // mouseHandler.removeEventListener("mousedown", mousedownListener);
                // sprint_sw_god();
                // Option.once = true;
            }
        }

        // 이벤트 등록
        mouseHandler.addEventListener("mousemove", mousemoveListener);
        mouseHandler.addEventListener("mousedown", mousedownListener);
    });

    // 창 크기조절 이벤트
    window.addEventListener("resize", onResize);
    onResize();

    var rot = 0;
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

        // 렌더링
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}

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


function sprint_sw_god() {
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

    // // Scene 변수
    // const scene = new THREE.Scene();

    // Camera 변수
    // const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500);
    // // Camera 위치 조정
    // camera.position.x = 5;
    // camera.position.y = 10;
    // camera.position.z = 0;

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

    // // Star Object
    // const starGeometry = new THREE.BufferGeometry();
    // const starVertices = new Float32Array(40000 * 3);

    // for (let i = 0; i < 20000; i++) {

    //     const x = THREE.MathUtils.randFloatSpread(1000);
    //     const y = THREE.MathUtils.randFloatSpread(20000);
    //     const z = THREE.MathUtils.randFloatSpread(1000);

    //     const offset = i * 3;

    //     starVertices[offset] = x;
    //     starVertices[offset + 1] = y;
    //     starVertices[offset + 2] = z;
    // }

    // starGeometry.setAttribute('position', new THREE.BufferAttribute(starVertices, 3));
    // const material = new THREE.PointsMaterial({
    //     color: 0xffffff
    // });
    // const starField = new THREE.Points(starGeometry, material);

    // Road Texture - 길 모양 텍스처를 불러오는 부분
    
    const problemGroup = new THREE.Group();
    const numOfProlblem = 10;
    for(let i = 1; i <= numOfProlblem; i++){
        const problemGeometry = new THREE.BoxGeometry(100, 50, 1)
        const problemMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        const problemMesh = new THREE.Mesh(problemGeometry, problemMaterial);
        problemMesh.position.x = - i * 500;
        problemMesh.position.y = 40;
        problemMesh.position.z = 0;
        problemMesh.lookAt(new THREE.Vector3(5, 10, 0))
        problemGroup.add(problemMesh);
    }
    scene.add(problemGroup);

    const textureLoader = new THREE.TextureLoader();
    const roadTexture = textureLoader.load('./src/imgs/roadTexture.png');
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(100, 1);

    var roadDistance = 20000
    // Road Object - 모델이 약 2분동안 달릴수 있게 설정
    const RoadGeomtery = new THREE.BoxGeometry(roadDistance, 1, 15);
    const RoadMeterial = new THREE.MeshBasicMaterial({
        map: roadTexture,
        roughness: 0.5,
        metalness: 0.5,
    });
    const roadMesh = new THREE.Mesh(RoadGeomtery, RoadMeterial);
    roadMesh.position.x = -roadDistance / 2 + 1 ;

    // Add to camera
    scene.add(roadMesh);

    // const modelPath = 'models/fbx/Running (2).fbx';
    // 모델 호출
    const loader = new FBXLoader();
    loader.load(modelPath, function (object) {
        object.position.set(0, 0.5, 0);
        if (modelPath == 'models/fbx/Running (2).fbx') object.scale.set(0.01, 0.01, 0.01);
        if (modelPath == 'models/fbx/Running (1).fbx') object.scale.set(0.02, 0.02, 0.02);

        object.rotation.y = -7.8;
        mixer = new THREE.AnimationMixer(object);

        const action = mixer.clipAction(object.animations[0]);
        action.play();

        player = object;
        scene.add(player);
    });

    // 키보드 좌, 우, 윗방향키 클릭 시 모델 위치 수정을 위한 이벤트 리스너
    // keydown - keyup 같이 수정해줘야함
    // A,D,W 키 추가 - 23/11/10
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 37) game.input.left = true;
        if (event.keyCode === 39) game.input.right = true;
        if (event.keyCode === 38) {
            if (player.position.y == 0.5) jumpPlayer();
        }

        if (event.keyCode === 65) game.input.left = true;
        if (event.keyCode === 68) game.input.right = true;
        if (event.keyCode === 87) {
            if (player.position.y == 0.5) jumpPlayer();
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.keyCode === 37) game.input.left = false;
        if (event.keyCode === 39) game.input.right = false;
        
        if (event.keyCode === 65) game.input.left = false;
        if (event.keyCode === 68) game.input.right = false;

    });

    // 창 크기조절 이벤트
    window.addEventListener("resize", onResize);
    onResize();

    // 각도계산을 위해 필요한 변수 선언
    let rot = 0;
    // Render
    function render() {
        rot += 0.1;
        // 각도 변환
        const radian = rot * (Math.PI / 180)

        // 카메라 시점 변환 업데이트
        orbitControls.update();

        // 눈 - Mesh가 움직임, 약 2분가량 동작 후 재시작
        starField.position.y = 9500 * Math.cos(radian / 4 % Math.PI);
        // 우주여행
        // starField.position.x = -9500 * Math.cos(radian / 4 % Math.PI);
        
        camera.lookAt(new THREE.Vector3(-10, 5, 0));
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
        if (problemGroup.position.x > 5000){
            let winMesh;
            let fontLoader = new FontLoader();
            fontLoader.load("./src/font/Do Hyeon_Regular.json", (font) => {
                let winGeometry = new TextGeometry(
                    "Congratulation!",
                    {
                        font: font,
                        size: 0.7,
                        height: 0,
                        curveSegments: 12
                    }
                );
                winGeometry.computeBoundingBox();
                let winXMid = -0.5 * (winGeometry.boundingBox.max.x - winGeometry.boundingBox.min.x);
                winGeometry.translate(winXMid, 0, 0);
        
                let winMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                });
                winMesh = new THREE.Mesh(winGeometry, winMaterial);
                winMesh.position.y = 11;
                winMesh.lookAt(new THREE.Vector3(5, 10, 0));
                scene.add(winMesh);
            });
            camera.position.x += 0.02;
        }
}
animate()

var id;
// Mesh 애니메이션 함수
function meshAnimate() {
    
    // 도로 움직이는 애니메이션
    roadMesh.position.x += 1;
    problemGroup.position.x += 0.7 * 20;
    renderer.render(scene, camera);
    id = requestAnimationFrame(meshAnimate);
    // console.log(problemGroup.position.x);
    // 1000이상 증가시 mesh 정지
        if (roadMesh.position.x > roadDistance / 2 - 1)
            cancelAnimationFrame(id);
}
meshAnimate();

    // 뚝뚝 끊기는 좌우 이동 함수
    function updatePlayer(currentTime) {
        if (currentTime - lastUpdateTime >= updateInterval) {
            lastUpdateTime = currentTime;

            // 23/11/08 - 좌우 범위 증가 + 좌우 이동시 부드럽게 이동
            if (game.input.right) {
                if (player.position.z > -5) player.position.z -= 0.15;
                // player.rotation.y = 0.05;
            } else if (game.input.left) {
                if (player.position.z < 5) player.position.z += 0.15;
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

// 흰 실선 범위
// -1.5 - 2.5
// 1.5 - 2.5

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
