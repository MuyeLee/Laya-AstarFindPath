(function () {
    'use strict';

    class AStarNode {
        constructor(node) {
            this.node = node;
            this.next = new Array();
            this.G = 0;
            this.H = 0;
        }
        AddChild(child) {
            if (this.next.indexOf(child) == -1) {
                child.prev = this;
                this.next.push(child);
            }
        }
        GetChildByIndex(index) {
            if (this.next.length > index) {
                return this.next[index];
            }
            return null;
        }
        RemoveChidByIndex(index) {
            if (this.next.length > index) {
                let temp = this.next.splice(index, 1)[0];
                temp.prev = null;
                return temp;
            }
            return null;
        }
        GetF() {
            return this.G + this.H;
        }
    }

    class PathData {
    }

    class PointIndex {
        constructor(point, col_start, row_start) {
            this.point = point;
            let u = Math.abs(row_start - Math.round(point.x));
            let v = Math.abs(col_start - Math.round(point.z));
            this.x = Math.floor(u / AStarPath.GetInstance().pd.width);
            this.y = Math.floor(v / AStarPath.GetInstance().pd.heigt);
            this.is_error_path = this.y < AStarPath.GetInstance().pd.points.length
                && this.x < AStarPath.GetInstance().pd.points[0].length
                && this.x > -1 && this.y > -1
                && AStarPath.GetInstance().pd.points[this.y][this.x] == 0;
        }
    }

    class AStarPath {
        static GetInstance() {
            return this.instance;
        }
        init(path, successed, failed) {
            AStarPath.instance = this;
            this.VectorUp = new Laya.Vector3(0, 1, 0);
            Laya.loader.load(path, Laya.Handler.create(this, this.onLoadJson, [path, successed, failed]), null, "json");
        }
        onLoadJson(path, successed, failed) {
            let res = Laya.loader.getRes(path);
            if (res) {
                this.pd = new PathData();
                this.pd.col = res.col;
                this.pd.row = res.row;
                this.pd.col_interval = res.col_interval;
                this.pd.row_interval = res.row_interval;
                this.pd.width = Number.parseFloat(res.width);
                this.pd.heigt = Number.parseFloat(res.height);
                this.pd.col_start = Number.parseFloat(res.col_start);
                this.pd.row_start = Number.parseFloat(res.row_start);
                this.pd.half_heigt = this.pd.heigt * 0.5;
                this.pd.half_width = this.pd.width * 0.5;
                this.pd.points = new Array();
                for (let i = 0; i < this.pd.col; i++) {
                    let temp = new Array();
                    for (let j = 0; j < this.pd.row; j++) {
                        temp.push(res.points[i * this.pd.row + j]);
                    }
                    this.pd.points.push(temp);
                }
                if (successed)
                    successed.run();
            }
            else {
                console.error("?????????????????????????????????????????????????????????????????????");
                if (failed)
                    failed.run();
            }
        }
        FindPath(start_pos, target_pos, is_offset = false) {
            let path = new Array();
            let open_list = new Array();
            let close_list = new Array();
            let start_pi = new PointIndex(start_pos, this.pd.col_start, this.pd.row_start);
            let target_pi = new PointIndex(target_pos, this.pd.col_start, this.pd.row_start);
            if (target_pi.is_error_path) {
                console.error("?????????????????????????????????????????????");
                return null;
            }
            let start_point = new Laya.Point();
            let target_point = new Laya.Point();
            if (target_pi.x == start_pi.x && target_pi.y == start_pi.y) {
                path.push(target_pos);
            }
            else {
                start_point.x = start_pi.x;
                start_point.y = start_pi.y;
                target_point.x = target_pi.x;
                target_point.y = target_pi.y;
                let arr = new Array();
                let target = this.ClacPath(start_point, target_point, open_list, close_list);
                if (target) {
                    while (target) {
                        arr.push(target.node);
                        target = target.prev;
                    }
                    let offset_x = 0;
                    let offset_y = 0;
                    let last_point = null;
                    for (let i = arr.length - 2; i > 0; i--) {
                        let V = new Laya.Vector3(this.pd.row_start + arr[i].x * this.pd.width + (is_offset ? this.Random(-this.pd.half_width * 50, this.pd.half_width * 50) * 0.01 : 0), 0, this.pd.col_start - this.pd.heigt * arr[i].y + (is_offset ? this.Random(-20, 20) * 0.02 : 0));
                        if (last_point != null) {
                            if (offset_x > -2 && offset_x < 2
                                && offset_y > -2 && offset_y < 2
                                && offset_x == last_point.x - arr[i].x
                                && offset_y == last_point.y - arr[i].y) {
                                path[path.length - 1] = V;
                            }
                            else {
                                path.push(V);
                            }
                            offset_x = last_point.x - arr[i].x;
                            offset_y = last_point.y - arr[i].y;
                        }
                        else {
                            path.push(V);
                        }
                        last_point = arr[i];
                    }
                    path.push(target_pos);
                }
                else {
                    console.error("????????????????????????????????????");
                }
            }
            return path;
        }
        ClacPath(start_point, target_point, open_list, close_list) {
            open_list.push(new AStarNode(start_point));
            let target_node = new AStarNode(target_point);
            while (open_list.length != 0) {
                let current_point = open_list[0];
                let temp_index = -1;
                let index = 0;
                open_list.forEach(point => {
                    temp_index++;
                    if (current_point.GetF() > point.GetF()) {
                        index = temp_index;
                        current_point = point;
                    }
                });
                let temp_close = open_list.splice(index, 1)[0];
                close_list.push(temp_close.node.x + "_" + temp_close.node.y);
                let arr = this.GetNearNodes(current_point, close_list);
                for (let i = 0; i < arr.length; ++i) {
                    let node = arr[i];
                    let G = (Math.abs(current_point.node.x - node.node.x) + Math.abs(current_point.node.y - node.node.y)) == 1 ? 10 : 14;
                    if (this.OpenIsHas(node, open_list)) {
                        if (G < node.G)
                            current_point.AddChild(node);
                    }
                    else {
                        open_list.push(node);
                        current_point.AddChild(node);
                    }
                    node.G = G;
                    node.H = (Math.abs(target_point.x - node.node.x) + Math.abs(target_point.y - node.node.y) - 1) * 10;
                }
                let target = this.OpenIsHas(target_node, open_list);
                if (target)
                    return target;
            }
            return null;
        }
        OpenIsHas(node, open_list) {
            for (let i = 0; i < open_list.length; i++) {
                if (node.node.x == open_list[i].node.x && node.node.y == open_list[i].node.y)
                    return open_list[i];
            }
            return null;
        }
        GetNearNodes(point, close_list) {
            let open_list = new Array();
            for (let i = -1; i <= 1; ++i) {
                for (let j = -1; j <= 1; ++j) {
                    if (!(i == 0 && j == 0)) {
                        let col = point.node.y + j;
                        let row = point.node.x + i;
                        if (row >= 0 && col >= 0 && col < this.pd.points.length && row < this.pd.points[0].length
                            && this.pd.points[col][row]
                            && this.pd.points[col][row] != 0
                            && close_list.indexOf(row + "_" + col) == -1) {
                            let _point = new Laya.Point(row, col);
                            open_list.push(new AStarNode(_point));
                        }
                    }
                }
            }
            return open_list;
        }
        MoveToTarget(move_node, rotate_node, start_pos, target_pos, speed, finish, is_offset = false) {
            let path = this.FindPath(start_pos, target_pos, is_offset);
            if (path == null)
                return;
            this.StopMove(move_node);
            this.Move(move_node, rotate_node, path, speed, finish);
        }
        Move(move_node, rotate_node, path, speed, finish) {
            if (path.length > 0) {
                let next = path.splice(0, 1)[0];
                let timer = this.GetMoveTime(move_node.transform.position, next, speed);
                if (rotate_node) {
                    let temp = rotate_node.transform.localRotationEulerY;
                    rotate_node.transform.lookAt(next, this.VectorUp, false);
                    let next_rotate_y = rotate_node.transform.localRotationEulerY - 180;
                    rotate_node.transform.localRotationEulerY = temp;
                    rotate_node.clearTimer(this, this.Rotate);
                    let v1 = new Laya.Vector3();
                    v1.y = temp;
                    rotate_node.frameLoop(1, this, this.Rotate, [rotate_node, v1]);
                    Laya.Tween.to(v1, {
                        y: next_rotate_y
                    }, timer - (timer * 0.8), Laya.Ease.linearNone, new Laya.Handler(this, function () {
                        rotate_node.clearTimer(this, this.Rotate);
                    }), 0, true);
                }
                Laya.Tween.to(move_node.transform, {
                    localPositionX: next.x,
                    localPositionZ: next.z
                }, timer, Laya.Ease.linearNone, new Laya.Handler(this, function () {
                    if (path.length > 0)
                        this.Move(move_node, rotate_node, path, speed, finish);
                    else if (finish)
                        finish.run();
                }), 0, true);
            }
        }
        Rotate(rotate_node, vector) {
            rotate_node.transform.localRotationEulerY = vector.y;
        }
        MoveToPoint(move_node, rotate_node, point, speed, finish) {
            let next = point;
            let timer = this.GetMoveTime(move_node.transform.position, next, speed);
            if (rotate_node) {
                let temp = rotate_node.transform.rotationEuler.y;
                rotate_node.transform.lookAt(next, this.VectorUp, false);
                let next_rotate_y = rotate_node.transform.rotationEuler.y;
                rotate_node.transform.rotationEuler.y = temp;
                Laya.Tween.to(rotate_node.transform.rotationEuler, {
                    y: next_rotate_y
                }, 500);
            }
            Laya.Tween.to(move_node.transform, {
                localPositionX: next.x,
                localPositionZ: next.z
            }, timer, Laya.Ease.linearNone, new Laya.Handler(this, function () {
                if (finish)
                    finish.run();
            }), 0, true);
        }
        StopMove(node) {
            Laya.Tween.clearAll(node.transform);
        }
        GetMoveTime(start, target, speed) {
            return Laya.Vector3.distance(start, target) * 60 / speed * 10;
        }
        Random(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    class GameManager extends Laya.Scene {
        constructor() {
            super(...arguments);
            this.point = new Laya.Vector2();
        }
        onAwake() {
            let astar = new AStarPath();
            astar.init("res/nav/astar.json", Laya.Handler.create(this, this.OnAstarConfigLoaded), null);
            this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.out_hit = new Laya.HitResult();
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnMouseDown);
        }
        OnAstarConfigLoaded() {
            Laya.Scene3D.load('res/LayaScene_astar/Conventional/astar.ls', Laya.Handler.create(this, function (scene) {
                this.OnCreateComplete(scene);
            }));
        }
        OnCreateComplete(scene) {
            this.this_scene = scene;
            Laya.stage.addChild(scene);
            this.player = scene.getChildByName("player");
            this.camera = scene.getChildByName("Main Camera");
        }
        OnMouseDown() {
            this.point.x = Laya.MouseManager.instance.mouseX;
            this.point.y = Laya.MouseManager.instance.mouseY;
            this.camera.viewportPointToRay(this.point, this.ray);
            this.this_scene.physicsSimulation.rayCast(this.ray, this.out_hit);
            if (this.out_hit.succeeded) {
                if (this.out_hit.collider.owner.name == "ground_01") {
                    AStarPath.GetInstance().MoveToTarget(this.player, this.player, this.player.transform.position, this.out_hit.point, 2, Laya.Handler.create(this, this.MoveFinish));
                }
            }
        }
        MoveFinish() {
            console.log("??????????????????");
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("Test/GameManager.ts", GameManager);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
