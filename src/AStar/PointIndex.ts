import PathData from "./PathData";

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
     * @param col_start 行起始点位置
     * @param row_start 列起始点位置
     */
    constructor(point: Laya.Vector3, pd: PathData) {
        this.point = point;
        let u: number = Math.abs(pd.row_start - Math.round(point.x) - pd.offset_x);
        let v: number = Math.abs(pd.col_start - Math.round(point.z) - pd.offset_z);

        this.x = Math.floor(u * pd.width_s);
        this.y = Math.floor(v * pd.heigt_s);

        this.is_error_path = this.y < pd.points.length
            && this.x < pd.points[0].length
            && this.x > -1 && this.y > -1
            && pd.points[this.y][this.x] == 0
    }
}