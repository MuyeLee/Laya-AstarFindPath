import AStarPath from "./AStarPath";

export default class PointIndex {
    /**
     * 坐标点
     */
    public point: Laya.Vector3;

    /**
     * X轴索引
     */
    public x: number;

    /**
     * Y轴索引
     */
    public y: number;



    /**
     * 错误路径
     */
    public is_error_path: boolean;

    /**
     * 构造函数：计算坐标点附近节点索引
     * @param point 坐标点
     * @param col_interval 行间距
     * @param row_interval 列间距
     */
    constructor(point: Laya.Vector3, col_interval: number, row_interval: number, col_start: number, row_start: number) {
        this.point = point;
        let u: number = Math.abs(row_start - point.x + AStarPath.GetInstance().pd.half_width);
        let v: number = Math.abs(col_start - point.z - AStarPath.GetInstance().pd.half_heigt);
        let m: number = u / AStarPath.GetInstance().pd.width;
        let n: number = v / AStarPath.GetInstance().pd.heigt;
        this.x = Math.floor(m);
        this.y = Math.floor(n);
        
        this.is_error_path = AStarPath.GetInstance().pd.points[this.y][this.x] == 0
    }
}