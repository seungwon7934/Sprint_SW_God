import * as THREE from 'three';
//표지판을 생성하는 코드
export function createRoadSign() {
	const signRadius = 2.5;
	const signHeight = 1;

	const poleHeight = 3;
	const poleRadius = 0.2;

	const signGroup = new THREE.Group();

	function createSign() {
		const signGeometry = new THREE.CircleGeometry(signRadius, 32);
		const signMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, side: THREE.DoubleSide });
		const signMesh = new THREE.Mesh(signGeometry, signMaterial);
		signMesh.position.z += 0.3;
		signMesh.position.y += 2;

		const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 32);
		const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
		const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
		poleMesh.position.y = -signHeight / 2 - poleHeight / 2;

		const signGroupInstance = new THREE.Group();
		signGroupInstance.add(signMesh);
		signGroupInstance.add(poleMesh);

		return signGroupInstance;
	}

	for (let i = 1; i < 100; i++) {
		const sign = createSign();
		sign.position.z = -7;
		sign.position.x = -i * 100;
		sign.position.y += 3;
		sign.rotation.y = Math.PI / 2;
		signGroup.add(sign);
		
		const sign2 = createSign();
		sign2.position.z = 7;
		sign2.position.x = -i * 100;
		sign2.position.y += 3;
		sign2.rotation.y = Math.PI / 2;
		signGroup.add(sign2);
	}
	
	return signGroup;

	// scene.add(signGroup);
	
}