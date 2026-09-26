#!/usr/bin/env node
// 门禁：liquid 只给导航层。连接层投影 data-xh-liquid 的部件、皮肤里与 [data-xh-liquid] 写在同一个
// 复合选择器上的部件，都必须在登记表里。
//
// liquid 是导航层材质：浮在内容之上、内容会从它下面滚过、自身内容很短的控制面——浮动钮、媒体控制、
// 悬浮栏。瞬态浮层、模态、Toast / Notification、Card、Table、表单与正文容器都不用：它们是阅读与决策面，
// 透景会与内容抢对比度。新接一个部件，先想清楚它是不是导航层，是就在这里登记一行，写明它浮在什么之上。
// 液态面不嵌液态面（两次折射放大失真、层级不清）是运行时结构，由浏览器用例逐个消费者断言。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'

/** 组件:部件 → 它为什么是导航层。每条都要真有连接层投影，过期的条目判失败。 */
const REGISTRY = {
  'back-top:trigger': '回到顶部，浮在页面内容之上',
  'float-button:trigger': '浮动钮，浮在页面内容之上',
  'float-button:list': '浮动钮的展开组：给里面的动作供液态面的私有槽，动作与触发器结成液态组',
  'message-feed:scroll-to-end-trigger': '回到底部，浮在消息之上',
  'log:scroll-to-end-trigger': '回到底部，浮在日志之上',
  'carousel:prev-trigger': '翻页钮，浮在媒体之上',
  'carousel:next-trigger': '翻页钮，浮在媒体之上',
  'carousel:autoplay-trigger': '播放开关，浮在媒体之上',
  'carousel:indicator-group': '分页条，浮在媒体之上',
  'image-viewer:toolbar': '工具条，浮在图上',
  'image-viewer:counter': '计数，浮在图上',
  'image-viewer:prev-trigger': '翻页钮，浮在图上',
  'image-viewer:next-trigger': '翻页钮，浮在图上',
  'image-viewer:close-trigger': '关闭钮，浮在图上',
  'layout:header': '顶栏：只在吸顶时投影，内容从它下面滚过',
}

const MARK = `'data-xh-liquid'`
// 标记归哪个部件：往前找最近的一处部件属性展开，或看图那种按部件名造钮的工厂调用
const OWNER = /\.\.\.parts\[['"]([\w-]+)['"]\]\.attrs|\.\.\.parts\.(\w+)\.attrs|toolButton\(['"]([\w-]+)['"]/g

const problems = []
const used = new Set()

for (const entry of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory())) {
  const component = entry.name
  let src
  try {
    src = await readFile(join(HEADLESS, component, `${component}.connect.ts`), 'utf8')
  }
  catch {
    continue
  }
  for (let at = src.indexOf(MARK); at !== -1; at = src.indexOf(MARK, at + MARK.length)) {
    let part = null
    for (const match of src.slice(0, at).matchAll(OWNER))
      part = match[1] ?? match[2] ?? match[3]
    const line = src.slice(0, at).split('\n').length
    if (!part) {
      problems.push(`${component}.connect.ts:${line}  认不出 data-xh-liquid 投影在哪个部件上`)
      continue
    }
    const key = `${component}:${part}`
    if (key in REGISTRY)
      used.add(key)
    else problems.push(`${component}.connect.ts:${line}  ${key} 投影了 data-xh-liquid 却没登记——它是浮在内容之上的导航层吗？是就在 REGISTRY 写明浮在什么之上`)
  }
}

/** 去块注释，保留换行。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))

for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css') && f !== 'liquid.css')) {
  const component = file.replace(/\.css$/, '')
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  for (const rule of src.matchAll(/([^{}]+)\{/g)) {
    for (const selector of rule[1].split(/,(?![^()]*\))/)) {
      if (!selector.includes('[data-xh-liquid]'))
        continue
      // 与标记写在同一个复合选择器里的部件（含 :is() 里列举的）
      const compound = selector.trim().split(/\s+|\s*>\s*/).find(c => c.includes('[data-xh-liquid]')) ?? ''
      const parts = [...compound.matchAll(/\[data-part=['"]([\w-]+)['"]\]/g)].map(m => m[1])
      const line = src.slice(0, rule.index).split('\n').length
      if (!parts.length)
        problems.push(`${file}:${line}  [data-xh-liquid] 没与部件写在同一个复合选择器上，认不出落在哪个部件`)
      for (const part of parts) {
        if (!(`${component}:${part}` in REGISTRY))
          problems.push(`${file}:${line}  ${component}:${part} 的皮肤按 liquid 画，部件却没登记`)
      }
    }
  }
}

for (const key of Object.keys(REGISTRY)) {
  if (!used.has(key))
    problems.push(`REGISTRY 的 ${key} 已经没有连接层投影 data-xh-liquid——过期的登记删掉`)
}

if (problems.length) {
  console.error(`[check-material-scope] ✗ liquid 落在没登记的部件上：\n${problems.map(p => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`[check-material-scope] 通过：${used.size} 个部件投影 data-xh-liquid，全部是登记过的导航层（浮动钮、媒体控制、悬浮栏）；皮肤的液态规则都落在它们身上`)
