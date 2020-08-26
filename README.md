# Laya A星寻路

#### 介绍

layaA星寻路Demo,Laya引擎版本 2.6.1，理论上兼容所有版本的Laya，也适用于2D项目，但是需要将所有Vector3改成Point

#### 使用说明

1.	将AStar文件夹直接拖入Laya工程中
2.  通过Unity导出配置文件
3.	将配置文件放入/bin/res/nav/文件夹下
4.	Laya中调用初始化方法并读取配置文件
5.	寻路脚本的调用

#### API说明

1.	AStarPath.ts A星寻路的管理类
1.1	init(path: string, successed: Laya.Handler, failed: Laya.Handler)
	初始化方法 	path:配置文件路径	successed:初始化成功的回调	failed:初始化失败的回调
1.2	FindPath(start_pos: Laya.Vector3, target_pos: Laya.Vector3, is_offset: boolean = false)
	获取寻路路径节点	start_pos:起始点坐标	target_pos:目标点坐标	is_offset:是否对各个节点的坐标做轻微的随机偏移
1.3	MoveToTarget(node: Laya.Sprite3D, start_pos: Laya.Vector3, target_pos: Laya.Vector3, speed: number, finish: Laya.Handler, is_lookat: boolean = false, is_offset: boolean = false)
	移动到目标点	node:要移动的物体	start_pos:起始点坐标	target_pos:目标点坐标	speed:移动速度 is_lookat:是否旋转并朝向下一个节点	is_offset:是否对各个节点的坐标做轻微的随机偏移

2.	AStarNode.ts A星寻路的节点类

3.	PathData	A星寻路的配置参数

4.	PointIndex	A星寻路的节点计算类
