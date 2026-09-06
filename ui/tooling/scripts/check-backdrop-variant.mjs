#!/usr/bin/env node
// 门禁：有遮罩的浮层，遮罩形态轴六处必须齐——类型、connect、皮肤两档、三个适配器。
//
// 适用集从解剖里扫出来（谁有 backdrop 部件谁就归这条轴管），不写手工清单：
// 手工清单在新加一个带遮罩的浮层时不会有任何提示，那个组件的遮罩就此只剩一档。
//
// 「半接线」不会被别的判据报出来：皮肤写了 [data-variant='blur'] 而 connect 不发这一位，
// 那条规则永远选不中；connect 发了而适配器没透传 prop，作者写 variant="blur" 一点反应也没有。
// 两种都是页面看着正常、档位其实不存在。
//
// 三档封闭：opaque（缺省档，皮肤一个字不写）、blur、transparent。
// 缺省档不查——它就是「没有 data-variant 时的那份规则」，多写一条反而是重复声明。
//
// 三家适配器同受这条轴管，React 只核 react-coverage.json 里已铺到的组件：
// 没铺到的组件在 React 侧还没有文件，要求它透传等于要求一个不存在的文件。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HEADLESS = join(uiRoot, 'packages/engine/headless/src')
const SKINS = join(uiRoot, 'packages/design/styles/css')
const VUE_COMPONENTS = join(uiRoot, ADAPTERS.vue.components)
const WC_ELEMENTS = join(uiRoot, ADAPTERS.wc.components)
const REACT_COMPONENTS = join(uiRoot, ADAPTERS.react.components)
/** 组件总数的分母：一个组件一份套件。 */
const SUITES_DIR = join(uiRoot, 'tooling/testing/src/suites')

/**
 * 有 backdrop 部件却不受这条轴管的，连同理由。
 * 每条都要真被用来放行过一次——组件不再有遮罩、或者已经接上这条轴，登记就成了死条目，
 * 由下面的名单核验报出来。
 */
const EXEMPT = {
  tour: '暗幕真身是 spotlight 的 box-shadow 大扩散，backdrop 只是它下面一层垫子：transparent 档改了垫子暗幕照样在，blur 档会把洞里的高亮目标一起糊掉',
}

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 取 getBackdropProps 那一段的正文，只在这一段里找 data-variant。 */
function backdropPropsBody(connect) {
  const start = connect.indexOf('getBackdropProps')
  if (start === -1)
    return null
  const end = connect.indexOf('}),', start)
  return end === -1 ? connect.slice(start) : connect.slice(start, end)
}

/** `image-viewer` → `ImageViewer`：React 侧那个 hook 的名字按这个规则派生。 */
function pascal(name) {
  return name.split(/[-_]/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
}

/** 整份 props 透传：不逐个列键，而是把组件收到的那一份整个交给 hook。 */
const FORWARDS_ALL_PROPS = /(?:^|[(,\s])(?:\.\.\.)?props\b/

/** 取 `use<Pascal>(` 之后配平括号内的那段实参：React 侧把 prop 带进机器就在这一段。 */
function machinePropsBlock(src, name) {
  const call = `use${pascal(name)}(`
  const at = src.indexOf(call)
  if (at < 0)
    return null
  let depth = 0
  for (let i = at + call.length - 1; i < src.length; i++) {
    if (src[i] === '(')
      depth++
    else if (src[i] === ')' && --depth === 0)
      return src.slice(at, i + 1)
  }
  return null
}

/** 解剖里有 backdrop 部件的组件。 */
async function discover() {
  const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)
  const found = []
  for (const name of dirs) {
    const anatomy = await read(join(HEADLESS, name, `${name}.anatomy.ts`))
    if (anatomy?.includes('\'backdrop\''))
      found.push(name)
  }
  return found.sort()
}

const problems = []
const discovered = await discover()
const covered = await reactCovered()
const suiteCount = (await readdir(SUITES_DIR)).filter(f => f.endsWith('.suite.ts')).length
let reactChecked = 0

for (const name of Object.keys(EXEMPT)) {
  if (!discovered.includes(name))
    problems.push(`${name}：登记在豁免名单里（${EXEMPT[name]}），但它已经没有 backdrop 部件了`)
}

for (const name of discovered) {
  if (name in EXEMPT) {
    const types = await read(join(HEADLESS, name, `${name}.types.ts`))
    if (types?.includes('variant?: OverlayBackdropVariant'))
      problems.push(`${name}：登记在豁免名单里，却已经声明了遮罩形态轴——理由不再成立，把它从名单里去掉`)
    continue
  }

  const types = await read(join(HEADLESS, name, `${name}.types.ts`))
  const connect = await read(join(HEADLESS, name, `${name}.connect.ts`))
  const css = await read(join(SKINS, `${name}.css`))
  const vue = await read(join(VUE_COMPONENTS, name, `${name}.ts`))
  const wc = await read(join(WC_ELEMENTS, `${name}.ts`))

  if (!types?.includes('variant?: OverlayBackdropVariant'))
    problems.push(`${name}：${name}.types.ts 没声明 variant?: OverlayBackdropVariant`)

  const body = connect == null ? null : backdropPropsBody(connect)
  if (body == null)
    problems.push(`${name}：${name}.connect.ts 里找不到 getBackdropProps`)
  else if (!body.includes('\'data-variant\''))
    problems.push(`${name}：getBackdropProps 没发 data-variant，皮肤那两条规则永远选不中`)

  for (const tier of ['blur', 'transparent']) {
    const selector = `[data-scope='${name}'][data-part='backdrop'][data-variant='${tier}']`
    if (!css?.includes(selector))
      problems.push(`${name}：${name}.css 缺 ${tier} 档（${selector}）`)
  }

  if (!vue?.includes('variant: { type: String as PropType<OverlayBackdropVariant>'))
    problems.push(`${name}：Vue 侧的 root 没透传 variant`)
  if (!wc?.includes('declare variant?: OverlayBackdropVariant') || !wc.includes('variant: this.variant,'))
    problems.push(`${name}：Web Components 侧没透传 variant`)

  // React 只核已铺到的组件：没铺到时那个文件还不存在
  if (!covered.has(name))
    continue
  reactChecked += 1
  const react = await read(join(REACT_COMPONENTS, name, `${name}.tsx`))
  if (react == null) {
    problems.push(`${name}：登记成 React 已铺，却找不到 ${ADAPTERS.react.components}/${name}/${name}.tsx`)
    continue
  }
  if (!react.includes('variant?: OverlayBackdropVariant')) {
    problems.push(`${name}：React 侧的 props 接口没声明 variant?: OverlayBackdropVariant`)
    continue
  }
  // 声明了还得真带进机器：只声明不转发时，作者写 variant="blur" 一点反应也没有
  const block = machinePropsBlock(react, name)
  if (block == null) {
    problems.push(`${name}：React 侧读不出 use${pascal(name)}(…) 这一段，判不了 variant 有没有带进机器——换写法了就把这条门禁的解析一起改`)
  }
  // 两种写法都算带到了：逐个键列出来，或者整份 props 透传过去（后者更严，一个键都漏不掉）
  else if (!/(?:^|[{,\s])variant\s*[,:]/.test(block) && !FORWARDS_ALL_PROPS.test(block)) {
    problems.push(`${name}：React 侧声明了 variant 却没带进机器 props，作者写 variant="blur" 一点反应也没有`)
  }
}

if (problems.length > 0) {
  console.error(`[check-backdrop-variant] ✗ ${problems.length} 处遮罩形态轴没接齐：`)
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const managed = discovered.filter(name => !(name in EXEMPT))
console.log(
  `[check-backdrop-variant] ✓ ${managed.length} 个带遮罩的浮层三档齐全，${Object.keys(EXEMPT).length} 个登记豁免；`
  + `透传逐家核过：Vue ${managed.length} · Web Components ${managed.length} · React ${reactChecked}`,
)
console.log(`[check-backdrop-variant] ${reactProgress(covered, suiteCount)}，${managed.length - reactChecked} 个带遮罩的浮层还没铺到 React，这一轮没核它们`)
