export default class AStarNode {
    public node: Laya.Point;
    public prev: AStarNode;
    private next: Array<AStarNode>;

    public G: number;
    public H: number;

    constructor(node: Laya.Point) {
        this.node = node;
        this.next = new Array<AStarNode>();
        this.G = 0;
        this.H = 0;
    }

    /**
     * 添加子节点
     * @param child 子节点 
     */
    public AddChild(child: AStarNode) {
        if (this.next.indexOf(child) == -1) {
            child.prev = this;
            this.next.push(child);
        }
    }

    /**
     * 获取子节点
     * @param index 索引
     */
    public GetChildByIndex(index: number): AStarNode {
        if (this.next.length > index) {
            return this.next[index];
        }
        return null;
    }

    /**
     * 移除子节点
     * @param index 
     */
    public RemoveChidByIndex(index: number): AStarNode {
        if (this.next.length > index) {
            let temp = this.next.splice(index, 1)[0];
            temp.prev = null;
            return temp;
        }
        return null;
    }

    public GetF() {
        return this.G + this.H;
    }
}