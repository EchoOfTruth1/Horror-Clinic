export class Player {
  constructor(camera, scene, walls) {
    this.camera = camera;
    this.scene = scene;
    this.walls = walls;
    this.yawObject = new THREE.Object3D();
    this.yawObject.add(camera);
    this.scene.add(this.yawObject);

    this.pitch = 0;
    this.keys = {};

    this.battery = 100;

    // Flashlight
    this.flashlight = new THREE.SpotLight(0xaaaaaa, 8, 50, Math.PI / 10, 0.5, 2);
    this.flashlight.castShadow = true;
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.target.position.set(0, 0, -1);
    camera.add(this.flashlight);
    camera.add(this.flashlight.target);

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);

    document.addEventListener("mousemove", event => {
      if (document.pointerLockElement === renderer.domElement) {
        this.yawObject.rotation.y -= event.movementX * 0.002;
        this.pitch -= event.movementY * 0.002;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.camera.rotation.x = this.pitch;
      }
    });
  }

  move() {
    const speed = 0.1;
    const dir = new THREE.Vector3();
    if(this.keys["w"]) dir.z -= 1;
    if(this.keys["s"]) dir.z += 1;
    if(this.keys["a"]) dir.x -= 1;
    if(this.keys["d"]) dir.x += 1;

    if(dir.length() > 0) {
      dir.normalize();
      const move = new THREE.Vector3(dir.x, 0, dir.z).applyAxisAngle(new THREE.Vector3(0,1,0), this.yawObject.rotation.y).multiplyScalar(speed);
      const newPos = this.yawObject.position.clone().add(move);
      if(!this.checkCollision(newPos)) {
        this.yawObject.position.copy(newPos);
      }
    }
    this.camera.position.y = 1.5;
  }

  checkCollision(newPos) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x-0.3,newPos.y-1.5,newPos.z-0.3),
      new THREE.Vector3(newPos.x+0.3,newPos.y+1.5,newPos.z+0.3)
    );
    for(let wall of this.walls){
      if(wall.intersectsBox(playerBox)) return true;
    }
    return false;
  }

  drainBattery() {
    this.battery -= 0.01;
    this.battery = Math.max(0, this.battery);
    this.flashlight.intensity = this.battery > 0 ? 8 : 0;
  }
}
