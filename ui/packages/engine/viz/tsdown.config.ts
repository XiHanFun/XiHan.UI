import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    // 层级、桑基与关系图的布局各走一条子路径：只画直角坐标图的应用不为它们付字节
    hierarchy: 'src/layout/hierarchy/index.ts',
    sankey: 'src/layout/sankey/index.ts',
    graph: 'src/layout/graph/index.ts',
    // 大数据：列式数据仓与降采样、画布绘制原语，只画小数据的图不为它们付字节
    columns: 'src/columns/index.ts',
    canvas: 'src/canvas/index.ts',
  },
})
