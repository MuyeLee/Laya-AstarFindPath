import AStarPath from "./AStarPath";

export default class PointIndex {
    /**
     * 坐标点
     */
    public point: Laya.Vector3;

    /**
     * 坐标点左侧列索引
     */
    public row_left: number;
    /**
     * 坐标点右侧列索引
     */
    public row_right: number;

    /**
     * 坐标点上侧行索引
     */
    public col_top: number;

    /**
     * 坐标点下侧行索引
     */
    public col_down: number;


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
        let m: number = Math.abs(row_start - point.x) / row_interval;
        let n: number = Math.abs(col_start - point.z) / col_interval;

        this.row_left =  Math.floor(m);
        this.row_right = Math.ceil(m);

        this.col_top = Math.floor(n);
        this.col_down = Math.ceil(n);

        this.is_error_path = AStarPath.GetInstance().pd.points[this.col_top][this.row_left] == 0
            && AStarPath.GetInstance().pd.points[this.col_top][this.row_right] == 0
            && AStarPath.GetInstance().pd.points[this.col_down][this.row_left] == 0
            && AStarPath.GetInstance().pd.points[this.col_down][this.row_right] == 0;
    }
}