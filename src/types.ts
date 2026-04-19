export type TodoNode = GroupNode | ItemNode

export interface GroupNode {
  kind: 'group'
  level: 1 | 2           // ## = 1, ### = 2；虚拟未分组也用 1
  title: string          // 去掉 # 前缀与首个 emoji 后的纯标题
  emoji?: string         // 抽取到的首个 emoji（装饰用）
  line: number           // 标题所在行 0-based；虚拟分组为 -1
  children: TodoNode[]
  totalOpen: number      // 递归统计未完成 ItemNode 数
}

export interface ItemNode {
  kind: 'item'
  checked: boolean
  text: string           // 去掉 `- [ ] ` 前缀的正文
  line: number           // 条目所在行 0-based
  lineHash: string       // 原始行 sha256 前 8 位
  indent: number         // 缩进层级（每 2 空格 / 1 tab 算一层）
}
