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
    constructor(point: Laya.Vector3, col_start: number, row_start: number) {
        this.point = point;
        let u: number = Number.parseInt((row_start - Math.round(point.x)).toFixed(0));
        let v: number = Number.parseInt((col_start - Math.round(point.z)).toFixed(0));

        this.x = u / AStarPath.GetInstance().pd.width;
        this.y = v / AStarPath.GetInstance().pd.heigt;

        this.is_error_path = this.y < AStarPath.GetInstance().pd.points.length
            && this.x < AStarPath.GetInstance().pd.points[0].length
            && this.x > -1 && this.y > -1
            && AStarPath.GetInstance().pd.points[this.y][this.x] == 0
    }
}