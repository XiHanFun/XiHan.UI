// 分层依赖门禁的单一权威。规则由 tooling/eslint-config/src/layers.json 生成：
// 层级越低越基础，只能依赖其 canDependOn 列出的包。
const { readdirSync } = require('node:fs')
const { layers } = require('./tooling/eslint-config/src/layers.json')

// 库包允许引用的第三方运行时依赖，与 tooling/scripts/check-runtime-deps.mjs 的 ALLOWLIST 对应。
const RUNTIME_DEP_ALLOWLIST = ['@internationalized/date']

const names = Object.keys(layers)

// 登记表必须与 packages/ 逐个对上。
// 规则是按键生成的：键多出来（指向不存在的包）不生成任何有效规则，键少一个（新包没登记）
// 则那个包既不受约束、也不出现在任何 forbidden 列表里——两种漂移都让 depcruise 报绿。
// 真发生过：i18n 与 pro 两个键在 packages/ 下根本不存在，长期无人发现。
{
  const dirs = readdirSync('packages', { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
  const missing = dirs.filter(dir => !names.includes(dir))
  const ghost = names.filter(name => !dirs.includes(name))
  if (missing.length || ghost.length) {
    throw new Error(
      `layers.json 与 packages/ 对不上：${
        missing.length ? `未登记 [${missing.join(', ')}]` : ''
      }${missing.length && ghost.length ? '；' : ''}${
        ghost.length ? `登记了不存在的 [${ghost.join(', ')}]` : ''
      }`,
    )
  }
}

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
      from: { path: '^packages/' },
      to: { couldNotResolve: true },
    },
    {
      name: 'styled-no-js-deps',
      severity: 'error',
      comment: 'packages/styled 是纯 CSS，不得依赖任何 JS 包',
      from: { path: '^packages/styled/' },
      to: { path: '^packages/' },
    },
    {
      name: 'no-external-in-packages',
      severity: 'error',
      comment: '库包的运行时代码不得引第三方；确需保留的登记进 RUNTIME_DEP_ALLOWLIST 与 check-runtime-deps.mjs',
      // 只管 src，与分层规则同一道理：测试要引 vitest 与 jsdom，那是工具不是产物。
      from: { path: '^packages/[^/]+/src/' },
      to: {
        // 只咬会随包发出去的与压根没声明的。peer 不算：适配器引宿主框架正是它的契约。
        dependencyTypes: ['npm', 'npm-optional', 'npm-bundled', 'npm-no-pkg', 'npm-unknown'],
        pathNot: RUNTIME_DEP_ALLOWLIST.map(d => `node_modules/${d}/`),
      },
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
    // 也不 exclude node_modules：那会在规则求值前就把第三方的边从图里删掉，
    // no-external-in-packages 便看不见任何东西。doNotFollow 已经保证不往里遍历。
  },
}
