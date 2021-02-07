export default class PathData {
    public col: number;//寻路节点行数
    public row: number;//寻路节点列数
    public col_start: number;//行起点位置
    public row_start: number;//列起点位置
    public width: number;//寻路节点宽度
    public heigt: number;//寻路节点高度
    public width_s: number;//寻路节点宽度
    public heigt_s: number;//寻路节点高度
    public half_width: number;//寻路节点宽度
    public half_heigt: number;//寻路节点高度
    public offset_x: number;//x轴位移
    public offset_z: number;//z轴位移
    public points: Array<Array<number>>;
}