// @vitest-environment jsdom
import type { ConformanceSuite } from '../src'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/vue/tests/harness'
import { createWcHarness } from '../../../packages/wc/tests/harness'
import {
  avatarSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonSuite,
  clipboardSuite,
  collapsibleSuite,
  editableSuite,
  imageSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  runParity,
  separatorSuite,
  sliderSuite,
  tagsInputSuite,
  textFieldSuite,
  threadSuite,
  toasterSuite,
  tooltipSuite,
} from '../src'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/**
 * 逐帧比对只在两侧喂的是同一棵 fixture 时才成立。
 * WC 侧改写过 fixture 的那些组件（switch/checkbox/progress 换角色节点形态、
 * 集合类把 disabled 改写成 aria-disabled、select 要作者手写影子 select、
 * field 要把 label/control 换成原生标签），两端结构本就不同，逐帧比对没有意义——
 * 它们的跨适配器保证由两侧各自跑同一份 conformance 规格来提供。
 *
 * 这里收的是"同一份 fixture 两侧都能直接跑"的组件。
 */

// 第二、三批里两侧共用同一棵 fixture 的组件（WC 侧没改写过角色节点、也没把 disabled
// 换成 aria-disabled 的那些），逐帧比对对它们成立，一并收进来。
//
// file-upload 暂不收：删掉持有焦点的那一条之后，两侧焦点落点不一致——
// Vue 把条目整棵卸掉，浏览器把焦点退回 body；WC 的节点常驻、焦点留在条目组内。
// 两边都不是有意为之（headless 与两个适配器都没写删除后的焦点去处），
// 得先定下"删完焦点该去哪"再统一，不该顺手挑一边的现状焊死。
//
// composer 暂不收，同样是两侧未统一而不是计时问题：stop 是全仓唯一一个无载荷的语义事件，
// Vue 那侧 `emit('stop')` 收到的 detail 是 undefined，WC 那侧 `new CustomEvent('stop', { detail: null })`
// 收到的是 null，逐帧比对按 JSON 比就差在这一处。两边发的事件名与时机完全一致，
// 差的只是"没有载荷"该怎么写；先把它定下来（要么 Vue 显式发 null，要么两侧都发 undefined）
// 再收进来，不该在这里挑一边的现状焊死。六条用例仍由两个适配器各自跑同一份规格守着。
//
// code-block 暂不收，原因与上面两个不同：两侧行为完全一致，差的只是语言标注的入口名。
// WC 侧的属性必须叫 code-lang——lang 是 HTML 全局属性，写上去等于声明整块内容的自然语言，
// `lang="cs"`（C#）会让读屏按捷克语念代码。这是个永久性的合理差异，不是待统一项。
// 眼下 runParity 只吃一份套件、两侧同喂，表达不了"同一份规格、两套入口名"。
// 真要收回来，得让 harness 自己声明套件改写（WC 侧本就在 wcSuites 里做这件事），
// 那是 harness 契约的改动，不该顺手塞进这次修复。
// 两侧各自跑同一份 conformance 规格仍在守着它。
const SUITES: readonly ConformanceSuite[] = [
  buttonSuite,
  badgeSuite,
  separatorSuite,
  avatarSuite,
  numberFieldSuite,
  collapsibleSuite,
  tooltipSuite,
  breadcrumbSuite,
  clipboardSuite,
  editableSuite,
  imageSuite,
  paginationSuite,
  pinInputSuite,
  sliderSuite,
  tagsInputSuite,
  textFieldSuite,
  toasterSuite,
  threadSuite,
]

runParity([createVueHarness(), createWcHarness()], SUITES, { describe, it })
