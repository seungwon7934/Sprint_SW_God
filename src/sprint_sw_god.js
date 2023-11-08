import { OrbitControls } from './lib/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import Stats from './jsm/libs/stats.module.js';

window.onload = function init() {
    let rot = 0; // 각도

    const canvas = document.getElementById("canvas");
    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    });

    // Scene
    const scene = new THREE.Scene();

    // Fog - 있으나 없으나 무방하나 일단 유지
    // scene.fog = new THREE.Fog(0xaaaaaa, 50, 2000);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

    // Camera start position - 출발 지점
    camera.position.x = 60;
    camera.position.z = 0;
    camera.position.y = 10;

    // Geometry
    const geometry = new THREE.Geometry();

    for (let i = 0; i < 40000; i++) {
        const star = new THREE.Vector3();
        // 눈) x : 2000, y : 20000, 우주 여행) x : 20000, y : 2000
        star.x = THREE.Math.randFloatSpread(2000);
        star.y = THREE.Math.randFloatSpread(20000);
        star.z = THREE.Math.randFloatSpread(2000);

        geometry.vertices.push(star)
    }

    const boxGeomtery = new THREE.BoxGeometry(100, 1, 5);

    // Meterial
    const material = new THREE.PointsMaterial({
        color: 0xffffff
    });

    //add items to scene
	var numTrees=10;
	var newTree;
    
	for(var i=0;i<numTrees;i++){
		newTree=createTree();
		newTree.position.z=i*-3;
		newTree.rotation.z=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
        newTree.position.x = 50;  // 나무의 x 좌표를 boxGeometry의 x 좌표에 맞게 조정
        newTree.position.y =0;   // 나무의 y 좌표를 boxGeometry의 위에 맞게 조정
        
		scene.add(newTree);
	}

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
function createTree(){
	var sides=8;
	var tiers=6;
	var scalarMultiplier=(Math.random()*(0.25-0.1))+0.05;
	var midPointVector= new THREE.Vector3();
	var vertexVector= new THREE.Vector3();
	var treeGeometry = new THREE.ConeGeometry( 0.5, 1, sides, tiers);
	var treeMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading  } );
	var offset;
	midPointVector=treeGeometry.vertices[0].clone();
	var currentTier=0;
	var vertexIndex;
	blowUpTree(treeGeometry.vertices,sides,0,scalarMultiplier);
	tightenTree(treeGeometry.vertices,sides,1);
	blowUpTree(treeGeometry.vertices,sides,2,scalarMultiplier*1.1,true);
	tightenTree(treeGeometry.vertices,sides,3);
	blowUpTree(treeGeometry.vertices,sides,4,scalarMultiplier*1.2);
	tightenTree(treeGeometry.vertices,sides,5);
	var treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
	treeTop.castShadow=true;
	treeTop.receiveShadow=false;
	treeTop.position.y=0.9;
	treeTop.rotation.y=(Math.random()*(Math.PI));
	var treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.5);
	var trunkMaterial = new THREE.MeshStandardMaterial( { color: 0x886633,shading:THREE.FlatShading  } );
	var treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
	treeTrunk.position.y=0.25;
	var tree =new THREE.Object3D();
	tree.add(treeTrunk);
	tree.add(treeTop);
    
	return tree;
}


function blowUpTree(vertices,sides,currentTier,scalarMultiplier,odd){
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var midPointVector=vertices[0].clone();
	var offset;
	for(var i=0;i<sides;i++){
		vertexIndex=(currentTier*sides)+1;
		vertexVector=vertices[i+vertexIndex].clone();
		midPointVector.y=vertexVector.y;
		offset=vertexVector.sub(midPointVector);
		if(odd){
			if(i%2===0){
				offset.normalize().multiplyScalar(scalarMultiplier/6);
				vertices[i+vertexIndex].add(offset);
			}else{
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i+vertexIndex].add(offset);
				vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
			}
		}else{
			if(i%2!==0){
				offset.normalize().multiplyScalar(scalarMultiplier/6);
				vertices[i+vertexIndex].add(offset);
			}else{
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i+vertexIndex].add(offset);
				vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
			}
		}
	}
}


function tightenTree(vertices,sides,currentTier){
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var midPointVector=vertices[0].clone();
	var offset;
	for(var i=0;i<sides;i++){
		vertexIndex=(currentTier*sides)+1;
		vertexVector=vertices[i+vertexIndex].clone();
		midPointVector.y=vertexVector.y;
		offset=vertexVector.sub(midPointVector);
		offset.normalize().multiplyScalar(0.06);
		vertices[i+vertexIndex].sub(offset);
	}
}

