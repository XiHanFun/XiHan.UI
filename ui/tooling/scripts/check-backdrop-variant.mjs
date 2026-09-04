#!/usr/bin/env node
// 门禁：有遮罩的浮层，遮罩形态轴五处必须齐——类型、connect、皮肤两档、两个适配器。
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
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HEADLESS = join(uiRoot, 'packages/engine/headless/src')
const SKINS = join(uiRoot, 'packages/design/styles/css')
const VUE_COMPONENTS = join(uiRoot, 'packages/adapters/vue/src/components')
const WC_ELEMENTS = join(uiRoot, 'packages/adapters/web-components/src/elements')

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
}

if (problems.length > 0) {
  console.error(`[check-backdrop-variant] ✗ ${problems.length} 处遮罩形态轴没接齐：`)
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const managed = discovered.filter(name => !(name in EXEMPT))
console.log(`[check-backdrop-variant] ✓ ${managed.length} 个带遮罩的浮层三档齐全，${Object.keys(EXEMPT).length} 个登记豁免`)
