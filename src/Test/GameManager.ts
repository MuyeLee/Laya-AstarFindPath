import AStarPath from "../AStar/AStarPath";

export default class GameManager extends Laya.Scene {
    private ray: Laya.Ray;
    private camera: Laya.Camera;
    private player: Laya.Sprite3D;
    private out_hit: Laya.HitResult;
    private this_scene: Laya.Scene3D;
    private point: Laya.Vector2 = new Laya.Vector2();

    onAwake(): void {
        let astar = new AStarPath();
        //初始化A星寻路
        astar.init("res/nav/astar.json", Laya.Handler.create(this, this.OnAstarConfigLoaded), null);

        //射线初始化
        this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
        this.out_hit = new Laya.HitResult();

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnMouseDown);
    }

    /**
     * A星寻路配置文件加载完成
     */
    private OnAstarConfigLoaded() {
        Laya.Scene3D.load('res/LayaScene_astar/Conventional/astar.ls', Laya.Handler.create(this, function (scene: Laya.Scene3D) {
            this.OnCreateComplete(scene);
        }));
    }

    /**
     * 3D场景加载完成
     * @param scene 
     */
    private OnCreateComplete(scene: Laya.Scene3D) {
        this.this_scene = scene;
        Laya.stage.addChild(scene);
        this.player = scene.getChildByName("player") as Laya.Sprite3D;
        this.camera = scene.getChildByName("Main Camera") as Laya.Camera;
    }

    private OnMouseDown() {
        this.point.x = Laya.MouseManager.instance.mouseX;
        this.point.y = Laya.MouseManager.instance.mouseY;
        //产生射线
        this.camera.viewportPointToRay(this.point, this.ray);
        //获取射线碰撞的物体
        this.this_scene.physicsSimulation.rayCast(this.ray, this.out_hit);

        //如果碰撞到物体
        if (this.out_hit.succeeded) {
            if (this.out_hit.collider.owner.name == "ground_01") {
                AStarPath.GetInstance().MoveToTarget(this.player, this.player, this.player.transform.position, this.out_hit.point, 2, Laya.Handler.create(this, this.MoveFinish));
            }
        }
    }

    private MoveFinish() {
        console.log("移动到坐标点");
    }
}