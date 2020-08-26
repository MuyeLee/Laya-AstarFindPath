export default class PathData {
    public col: number;//寻路节点行数
    public row: number;//寻路节点列数
    public col_interval: number;//行间距
    public row_interval: number;//列间距
    public col_start: number;//行起点位置
    public row_start: number;//列起点位置
    public points: Array<Array<number>>;
}