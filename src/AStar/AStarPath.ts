import AStarNode from "./AStarNode";
import PathData from "./PathData";
import PointIndex from "./PointIndex";

export default class AStarPath {
    private static instance: AStarPath;
    public static GetInstance() {
        return this.instance;
    }

    //向上向量
    private VectorUp: Laya.Vector3;

    //路径节点的配置信息
    public pd: PathData;

    /**
     * 初始化寻路
     * @param path 路径节点信息配置文件位置
     * @param successed 初始化成功回调
     * @param failed 初始化失败回调
     */
    public init(path: string, successed: Laya.Handler, failed: Laya.Handler) {
        AStarPath.instance = this;
        this.VectorUp = new Laya.Vector3(0, 1, 0);
        Laya.loader.load(path, Laya.Handler.create(this, this.onLoadJson, [path, successed, failed]), null, "json");
    }

    /**
     * 加载配置文件成功
     * @param path 路径节点信息配置文件位置
     * @param successed 初始化成功回调
     * @param failed 初始化失败回调
     */
    private onLoadJson(path: string, successed: Laya.Handler, failed: Laya.Handler) {
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
            this.pd.points = new Array<Array<number>>();
            for (let i = 0; i < this.pd.col; i++) {
                let temp: Array<number> = new Array<number>();
                for (let j = 0; j < this.pd.row; j++) {
                    temp.push(res.points[i * this.pd.row + j]);
                }
                this.pd.points.push(temp);
            }
            if (successed) successed.run();
        } else {
            console.error("加载路径节点信息配置文件失败，请确定文件路径！");
            if (failed) failed.run();
        }
    }

    /**
     * 查询路径
     * @param start_pos 起始点
     * @param target_pos 目标点
     * @return 路径节点列表 
     */
    public FindPath(start_pos: Laya.Vector3, target_pos: Laya.Vector3, is_offset: boolean = false) {
        let path: Array<Laya.Vector3> = new Array<Laya.Vector3>();
        let open_list: Array<AStarNode> = new Array<AStarNode>();
        let close_list: Array<string> = new Array<string>();
        let start_pi: PointIndex = new PointIndex(start_pos, this.pd.col_start, this.pd.row_start);
        let target_pi: PointIndex = new PointIndex(target_pos, this.pd.col_start, this.pd.row_start);

        if (target_pi.is_error_path) {
            console.error("寻路失败，终点不存在有效索引！");
            return null;
        }
        let start_point = new Laya.Point();
        let target_point = new Laya.Point();

        if (target_pi.x == start_pi.x && target_pi.y == start_pi.y) {
            path.push(target_pos);
        } else {
            start_point.x = start_pi.x;
            start_point.y = start_pi.y;
            target_point.x = target_pi.x;
            target_point.y = target_pi.y;
            let arr: Array<Laya.Point> = new Array<Laya.Point>();
            let target = this.ClacPath(start_point, target_point, open_list, close_list);
            if (target) {
                while (target) {
                    arr.push(target.node);
                    target = target.prev;
                }


                let offset_x = 0;
                let offset_y = 0;
                let last_point: Laya.Point = null
                for (let i = arr.length - 2; i > 0; i--) {
                    let V = new Laya.Vector3(this.pd.row_start - arr[i].x * this.pd.width + (is_offset ? this.Random(-20, 20) * 0.01 : 0), 0, this.pd.col_start - this.pd.heigt * arr[i].y + (is_offset ? this.Random(-20, 20) * 0.02 : 0));
                    if (last_point != null) {
                        if (offset_x > -2 && offset_x < 2
                            && offset_y > -2 && offset_y < 2
                            && offset_x == last_point.x - arr[i].x
                            && offset_y == last_point.y - arr[i].y) {
                            path[path.length - 1] = V;
                        } else {
                            path.push(V);
                        }
                        offset_x = last_point.x - arr[i].x;
                        offset_y = last_point.y - arr[i].y;
                    } else {
                        path.push(V);
                    }
                    last_point = arr[i];
                }
                path.push(target_pos);
            } else {
                console.error("寻路失败，未找到目标点！");
            }

        }
        return path;
    }

    /**
     * 计算路径
     * @param start_point 起始节点
     * @param target_point 目标节点
     * @param open_list 路径节点列表
     * @param close_list 遗弃节点列表
     */
    private ClacPath(start_point: Laya.Point, target_point: Laya.Point, open_list: Array<AStarNode>, close_list: Array<string>) {
        open_list.push(new AStarNode(start_point));
        let target_node = new AStarNode(target_point);
        let count = 100000;
        while (open_list.length != 0 && count > 0) {
            count--;
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
                } else {
                    open_list.push(node);
                    current_point.AddChild(node);
                }
                node.G = G;
                node.H = (Math.abs(target_point.x - node.node.x) + Math.abs(target_point.y - node.node.y) - 1) * 10;
            }
            let target = this.OpenIsHas(target_node, open_list);
            if (target) return target;
        }
        return null;
    }

    /**
     * 查看路径节点列表是否包含某一个节点
     * @param node 
     * @param open_list 
     */
    private OpenIsHas(node: AStarNode, open_list: Array<AStarNode>): AStarNode {
        for (let i = 0; i < open_list.length; i++) {
            if (node.node.x == open_list[i].node.x && node.node.y == open_list[i].node.y) return open_list[i];
        }
        return null;
    }

    /**
    * 得到所有有效的相邻的节点并且加入到开放列表
    * @param point 求相邻节点的原始节点
    * @param close_list 遗弃节点列表
    */
    private GetNearNodes(point: AStarNode, close_list: Array<string>): Array<AStarNode> {
        let open_list = new Array<AStarNode>();
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

    /**
     * 移动到目标点
     * @param move_node 要移动的物体
     * @param rotate_node 要旋转的物体
     * @param start_pos 起始点
     * @param target_pos 目标点
     * @param speed 移动速度
     * @param finish 抵达目标点回调
     */
    public MoveToTarget(move_node: Laya.Sprite3D, rotate_node: Laya.Sprite3D, start_pos: Laya.Vector3, target_pos: Laya.Vector3, speed: number, finish: Laya.Handler, is_offset: boolean = false) {
        let path: Array<Laya.Vector3> = this.FindPath(start_pos, target_pos, is_offset);
        if (path == null) return;
        this.StopMove(move_node);
        this.Move(move_node, rotate_node, path, speed, finish);
    }

    /**
    * 移动到目标点
    * @param move_node 要移动的物体
    * @param rotate_node 要旋转的物体
    * @param path 路径节点列表
    * @param speed 移动速度
    * @param finish 抵达目标点回调
    */
    private Move(move_node: Laya.Sprite3D, rotate_node: Laya.Sprite3D, path: Array<Laya.Vector3>, speed: number, finish: Laya.Handler) {
        if (path.length > 0) {
            //获取到下个路径节点
            let next: Laya.Vector3 = path.splice(0, 1)[0];

            let timer = this.GetMoveTime(move_node.transform.position, next, speed);

            //朝向目标坐标点
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

            //移动动画
            Laya.Tween.to(move_node.transform, {
                localPositionX: next.x,
                localPositionZ: next.z
            }, timer,
                Laya.Ease.linearNone, new Laya.Handler(this, function () {
                    if (path.length > 0) this.Move(move_node, rotate_node, path, speed, finish);
                    else if (finish) finish.run();
                }), 0, true);
        }
    }

    private Rotate(rotate_node: Laya.Sprite3D, vector: Laya.Vector3) {
        rotate_node.transform.localRotationEulerY = vector.y;
    }

    /**
     * 移动到地图上某一个坐标点
     * @param move_node 要移动的物体
     * @param rotate_node 要旋转的物体
     * @param point 坐标点
     * @param speed 移动速度
     * @param finish 移动完成回调
     */
    public MoveToPoint(move_node: Laya.Sprite3D, rotate_node: Laya.Sprite3D, point: Laya.Vector3, speed: number, finish: Laya.Handler) {
        //获取到下个路径节点
        let next: Laya.Vector3 = point;

        let timer = this.GetMoveTime(move_node.transform.position, next, speed);

        //朝向目标坐标点
        if (rotate_node) {
            let temp = rotate_node.transform.rotationEuler.y;
            rotate_node.transform.lookAt(next, this.VectorUp, false);
            let next_rotate_y = rotate_node.transform.rotationEuler.y;
            rotate_node.transform.rotationEuler.y = temp;
            Laya.Tween.to(rotate_node.transform.rotationEuler, {
                y: next_rotate_y
            }, 500);
        }

        //移动动画
        Laya.Tween.to(move_node.transform, {
            localPositionX: next.x,
            localPositionZ: next.z
        }, timer,
            Laya.Ease.linearNone, new Laya.Handler(this, function () {
                if (finish) finish.run();
            }), 0, true);
    }

    /**
     * 停止移动
     * @param node 要停止移动的物体
     */
    public StopMove(node: Laya.Sprite3D) {
        Laya.Tween.clearAll(node.transform);
    }

    /**
     * 计算移动时间
     * @param start 初始位置 
     * @param target 目标位置
     * @param speed 速度
     */
    private GetMoveTime(start: Laya.Vector3, target: Laya.Vector3, speed: number): number {
        return Laya.Vector3.distance(start, target) * 60 / speed * 10;
    }

    /**
     * 随机数
     * @param min 最小值
     * @param max 最大值
     */
    public Random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

