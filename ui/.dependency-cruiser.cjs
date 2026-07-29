// 分层依赖门禁的单一权威。规则由 tooling/eslint-config/src/layers.json 生成。
// 见 §2 依赖矩阵：层级越低越基础，只能依赖其 canDependOn 列出的包。
const { layers } = require('./tooling/eslint-config/src/layers.json')

const names = Object.keys(layers)

// 为每个包生成一条"禁止依赖其 canDependOn 之外的兄弟包"的规则。
const layerRules = names
  .map((from) => {
    const allowed = new Set([from, ...layers[from].canDependOn])
    const forbidden = names.filter(n => !allowed.has(n))
    if (forbidden.length === 0)
      return null
    return {
      name: `layer-${from}`,
      severity: 'error',
      comment: `packages/${from} 只能依赖 [${[...allowed].join(', ')}]`,
      // 只管 src：分层约束的是发出去的那份实现。
      // 测试要跨层取材（浏览器态无障碍扫描必须加载 styled 的皮肤才量得到对比度），
      // 把 tests 一起管住只会逼人把跨层依赖藏进别处。
      from: { path: `^packages/${from}/src/` },
      to: { path: `^packages/(${forbidden.join('|')})/` },
    }
  })
  .filter(Boolean)

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止循环依赖',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-unresolvable',
      severity: 'error',
      comment: '解析不出来的 import。最常见的成因正是"伸手够了邻层却没在 package.json 里声明依赖"',
      // icons 是冻结的遗留包：不进构建图、不发布，源码里还引着早已删除的 @xihan-ui/utils
      // 与一批没声明的第三方。它重建之前放它一马，否则这条规则天天红，红久了就没人看了
      from: { path: '^packages/', pathNot: '^packages/icons/' },
      to: { couldNotResolve: true },
    },
    {
      name: 'styled-no-js-deps',
      severity: 'error',
      comment: 'packages/styled 是纯 CSS，不得依赖任何 JS 包',
      from: { path: '^packages/styled/' },
      to: { path: '^packages/' },
    },
    ...layerRules,
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'types'],
    },
    // 不用 includeOnly 收窄图：它会把"解析不出来"的边整条滤掉，
    // 于是最该拦的那种越界——伸手够了邻层却没在 package.json 里声明依赖——反而报绿。
    // 改成把第三方摘掉，解析失败的边留在图里交给 no-unresolvable 咬。
    exclude: { path: 'node_modules' },
  },
}
