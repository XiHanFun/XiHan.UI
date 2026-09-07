#!/usr/bin/env node
// 门禁：connect 派的不冒泡事件，React 侧必须改装成原生监听器。
//
// React 的合成事件全部委派在根容器上、只在冒泡阶段派发。connect 是按 DOM 语义写的，
// 它点名 focus / pointerenter / pointerleave 时要的就是这三个事件本身：
// onFocus 在 React 那里挂的是冒泡的 focusin（「后代得焦」会被算成「本节点得焦」），
// onPointerEnter / onPointerLeave 是从 pointerover / pointerout 合出来的。
// 接线看着还在，指针划过不搬焦点、容器得焦不清锚点——全程零报错，页面上一声不吭。
//
// 这一张逐组件对账：headless 的 connect 派了哪几个不冒泡的事件，React 侧就得逐个
// 用 useNativeEvents 摘出来。两侧反查——摘了 connect 根本不派的名字同样判失败。
//
// 只核 react-coverage.json 里已铺的组件。Vue 与 Web Components 不在其列：
// 两者都把 connect 的处理器原样挂成 DOM 监听器，没有合成事件这一层，也就没有这个问题。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HEADLESS = join(uiRoot, 'packages/engine/headless/src')
const REACT = join(uiRoot, 'packages/adapters/react/src/components')

// connect 里两种拼法都有（onPointerenter / onPointerEnter），归一到 React 的拼法。
// onFocusIn / onFocusOut 刻意不在表内：它们经 reactNormalize 归到 React 的 onFocus / onBlur，
// 而那两个合成事件挂的正是冒泡的 focusin / focusout，改装反而会改坏语义。
const NON_BUBBLING = {
  onfocus: 'onFocus',
  onpointerenter: 'onPointerEnter',
  onpointerleave: 'onPointerLeave',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
}

/** 同名目录铺开与单文件平铺两种形态都认，返回整个组件的源码。 */
async function reactSource(name) {
  try {
    return await readFile(join(REACT, `${name}.tsx`), 'utf8')
  }
  catch {}
  try {
    const files = await readdir(join(REACT, name))
    let out = ''
    for (const file of files)
      out += `${await readFile(join(REACT, name, file), 'utf8')}\n`
    return out
  }
  catch {
    return null
  }
}

/** connect 里派出的不冒泡事件名，归一后去重。 */
function emittedNonBubbling(source) {
  const out = new Set()
  for (const hit of source.matchAll(/'?(on[A-Za-z]+)'?\s*:/g)) {
    const canon = NON_BUBBLING[hit[1].toLowerCase()]
    if (canon)
      out.add(canon)
  }
  return out
}

/**
 * React 侧改装到的事件名。
 *
 * 第二参给了名单就按名单摘，没给是整份改装（button 与 tooltip 那三处）——
 * 整份改装覆盖这个组件派出的全部事件。
 */
function rewired(source) {
  const out = new Set()
  let whole = false
  for (const hit of source.matchAll(/useNativeEvents\s*\(([\s\S]{0,320}?)\)\s*$/gm)) {
    const list = hit[1].match(/\[([^\]]*)\]/)
    if (!list) {
      whole = true
      continue
    }
    for (const name of list[1].matchAll(/'([^']+)'/g))
      out.add(name[1])
  }
  return { names: out, whole }
}

const covered = JSON.parse(
  await readFile(join(uiRoot, 'tooling/scripts/react-coverage.json'), 'utf8'),
).covered

const problems = []
let checked = 0
let handlers = 0

for (const name of covered) {
  let connect
  try {
    connect = await readFile(join(HEADLESS, name, `${name}.connect.ts`), 'utf8')
  }
  catch {
    continue
  }

  const wanted = emittedNonBubbling(connect)
  if (wanted.size === 0)
    continue

  const source = await reactSource(name)
  if (source == null) {
    problems.push(`${name}：登记在 react-coverage.json 里，却找不到 React 侧的源码`)
    continue
  }

  checked++
  handlers += wanted.size

  const { names, whole } = rewired(source)
  if (whole)
    continue

  const missing = [...wanted].filter(w => !names.has(w))
  if (missing.length > 0) {
    problems.push(
      `${name}：connect 派了不冒泡的 ${[...wanted].join(' / ')}，`
      + `React 侧没把 ${missing.join(' / ')} 摘成原生监听器`,
    )
  }

  const stale = [...names].filter(n => NON_BUBBLING[n.toLowerCase()] && !wanted.has(n))
  if (stale.length > 0) {
    problems.push(
      `${name}：React 侧摘了 ${stale.join(' / ')}，而 connect 根本不派这几个`,
    )
  }
}

if (checked === 0) {
  console.error('[check-native-events] ✗ 一个组件都没核到——react-coverage.json 或目录形态变了，这张门禁已经形同虚设')
  process.exit(1)
}

if (problems.length > 0) {
  console.error(`[check-native-events] ✗ 不冒泡的事件没接成原生监听器（${problems.length} 处）：`)
  for (const line of problems)
    console.error(`  ${line}`)
  console.error('\n改法：在部件里把 connect 的 props 过一遍 useNativeEvents(props, [事件名])，'
    + '再把 bind.attrs 与 bind.ref 接进渲染。onFocusIn / onFocusOut 不在此列，别动它们。')
  process.exit(1)
}

console.log(
  `[check-native-events] 通过：${checked} 个已铺组件的 ${handlers} 类不冒泡事件都接成了原生监听器。`
  + 'Vue 与 Web Components 不在其列——两者把 connect 的处理器原样挂成 DOM 监听器，没有合成事件这一层',
)
