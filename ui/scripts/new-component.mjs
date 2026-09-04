#!/usr/bin/env node
// 脚手架：按 kebab 组件名生成 headless + 两个适配器 + 皮肤 + 一致性套件 + 文档示例的骨架，
// 并把该登记的地方全部登记一遍。
//
// 落点清单写在 scripts/new-component.targets.json，两侧都反查：
//   creates 的每条路径、modifies 的每条锚点，拿 probe 那个既有组件套一遍必须全部命中；
//   反过来，表里的每个 modifies 条目都要有同名处理器，处理器也不许多出表外的条目。
//   任一侧对不上就是这张表过期了，判红。
//
// 模板照 toggle 抄：一个 root 部件、一台受控/非受控双轨的按下态机器、三轴皮肤。
// 生成出来的是能跑通门禁的骨架，机器与部件由作者接着改。
//
// 用法：
//   node scripts/new-component.mjs <kebab-name> --label=<中文名> --category=<分类 id> [--dry-run] [--show-hunks]
//   node scripts/new-component.mjs <kebab-name> --category=<分类 id> --emit-templates=<目录>
//                                                       只把模板展开到目录里，不碰仓库
//   node scripts/new-component.mjs --verify             只跑落点清单的两侧反查
//   node scripts/new-component.mjs --sync-doc-numbers   只按 check-doc-numbers 的报告回填正文数字
//   node scripts/new-component.mjs --list-categories
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const uiRoot = resolve(here, '..')

const TARGETS = join(here, 'new-component.targets.json')
const DOC_NUMBERS = 'tooling/scripts/check-doc-numbers.mjs'

/** 路径一律相对 ui/；`../` 前缀的落在仓库根。 */
const abs = path => resolve(uiRoot, path)

// ── 名字 ──────────────────────────────────────────────────────────────────────

function names(kebab) {
  const pascal = kebab.replace(/(^|-)([a-z0-9])/g, (_, __, ch) => ch.toUpperCase())
  return { c: kebab, P: pascal, camel: pascal[0].toLowerCase() + pascal.slice(1) }
}

const fill = (text, n) => text.replaceAll('{c}', n.c).replaceAll('{P}', n.P).replaceAll('{camel}', n.camel)

/** 锚点正则：JSON 里写成带 `(?m)` 前缀的字符串，转成 RegExp。 */
function anchorRe(pattern, n) {
  const filled = fill(pattern, n)
  return filled.startsWith('(?m)') ? new RegExp(filled.slice(4), 'm') : new RegExp(filled)
}

// ── 插入原语 ──────────────────────────────────────────────────────────────────

/**
 * 按序插入若干行：在同类行里找第一条排序键大于新键的，插在它前面；都不大就接在最后一条之后。
 * 同一个键跨多行（一个组件两行 export）时天然落在整组之前。
 */
function insertSorted(source, lineRe, keyOf, newLines, newKey) {
  const lines = source.split('\n')
  let last = -1
  for (let i = 0; i < lines.length; i++) {
    const hit = lines[i].match(lineRe)
    if (!hit)
      continue
    last = i
    if (keyOf(hit) > newKey) {
      lines.splice(i, 0, ...newLines)
      return lines.join('\n')
    }
  }
  if (last === -1)
    throw new Error(`找不到可对齐的同类行：${lineRe}`)
  lines.splice(last + 1, 0, ...newLines)
  return lines.join('\n')
}

/** 插在某一行之前。 */
function insertBefore(source, lineRe, newLines) {
  const lines = source.split('\n')
  const at = lines.findIndex(line => lineRe.test(line))
  if (at === -1)
    throw new Error(`找不到锚点行：${lineRe}`)
  lines.splice(at, 0, ...newLines)
  return lines.join('\n')
}

/** 插在最后一条匹配行之前。 */
function insertBeforeLast(source, lineRe, newLines) {
  const lines = source.split('\n')
  let at = -1
  for (let i = 0; i < lines.length; i++) {
    if (lineRe.test(lines[i]))
      at = i
  }
  if (at === -1)
    throw new Error(`找不到锚点行：${lineRe}`)
  lines.splice(at, 0, ...newLines)
  return lines.join('\n')
}

/** 往一整行写完的具名导入表里按名字插一项。 */
function insertIntoInlineImport(source, importRe, item) {
  const hit = source.match(importRe)
  if (!hit)
    throw new Error(`找不到具名导入表：${importRe}`)
  const items = hit[1].split(',').map(s => s.trim()).filter(Boolean)
  if (items.includes(item))
    throw new Error(`${item} 已在导入表里`)
  const key = item.toLowerCase()
  const at = items.findIndex(existing => existing.toLowerCase() > key)
  items.splice(at === -1 ? items.length : at, 0, item)
  return source.replace(importRe, hit[0].replace(hit[1], ` ${items.join(', ')} `))
}

// ── 模板 ──────────────────────────────────────────────────────────────────────

function templates(n, label) {
  const t = {}

  t['headless-anatomy'] = `import { createAnatomy } from '@xihan-ui/kernel'

export const ${n.camel}Anatomy = createAnatomy('${n.c}', ['root'])
`

  t['headless-types'] = `import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface ${n.P}PressedChangeDetails {
  pressed: boolean
}

export interface ${n.P}Schema extends MachineSchema {
  props: {
    pressed?: boolean
    defaultPressed?: boolean
    disabled?: boolean
    /** 形态：solid / subtle / outline / ghost，决定颜色怎么用 */
    variant?: ActionVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
    tone?: Tone
    /** 尺寸：sm / md / lg */
    size?: Size
    /** pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onPressedChange?: (details: ${n.P}PressedChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 pressed 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
  tag: never
  guard: 'isPressedControlled'
  action: 'invokeOnPress' | 'invokeOnUnpress' | 'syncPressed'
  effect: never
}

export interface ${n.P}Api<T extends PropTypes = PropTypes> {
  pressed: boolean
  setPressed: (next: boolean) => void
  getRootProps: () => T['button']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ${n.P}Translations {}
`

  t['headless-machine'] = `import type { ${n.P}Schema } from './${n.c}.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<${n.P}Schema>()

// 受控（pressed 给定）时用户事件只发意图、不自改状态；宿主写回 pressed 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用。
export const ${n.camel}Machine = createMachine({
  name: '${n.c}',
  initialState: ({ prop }) => ((prop('pressed') ?? prop('defaultPressed')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => track([() => prop('pressed')], () => action(['syncPressed'])),
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnPress'] },
          { target: 'on', actions: ['invokeOnPress'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnUnpress'] },
          { target: 'off', actions: ['invokeOnUnpress'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isPressedControlled: ({ prop }) => prop('pressed') !== undefined,
    },
    actions: {
      invokeOnPress: ({ prop }) => prop('onPressedChange')?.({ pressed: true }),
      invokeOnUnpress: ({ prop }) => prop('onPressedChange')?.({ pressed: false }),
      syncPressed: ({ prop, send }) => {
        const pressed = prop('pressed')
        if (pressed === undefined)
          return
        send(pressed ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
`

  t['headless-connect'] = `import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ${n.P}Api, ${n.P}Schema } from './${n.c}.types'
import { dataAttr } from '@xihan-ui/kernel'
import { ${n.camel}Anatomy } from './${n.c}.anatomy'

const parts = ${n.camel}Anatomy.build()

export function connect${n.P}<T extends PropTypes>(
  service: Service<${n.P}Schema>,
  normalize: NormalizeProps<T>,
): ${n.P}Api<T> {
  const { state, prop, send } = service
  const pressed = state.get() === 'on'
  const disabled = !!prop('disabled')

  const setPressed = (next: boolean): void => {
    if (next !== pressed)
      send({ type: 'TOGGLE' })
  }

  return {
    pressed,
    setPressed,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'aria-pressed': pressed ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': pressed ? 'on' : 'off',
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
  }
}
`

  t['headless-keyboard'] = `import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const ${n.camel}Keyboard: KeyboardTable = {
  component: '${n.c}',
  source: APG,
  rows: [
    { id: '${n.c}.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 pressed 状态' },
  ],
}
`

  t['headless-meta'] = `import type { ComponentMeta } from '../spec/types'

export const ${n.camel}Meta: ComponentMeta = {
  component: '${n.c}',
  requiredParts: ['root'],
}
`

  t['headless-doc'] = `# ${label}

按下去留在按下态，再按一下弹回来。状态由 \`aria-pressed\` 表达。

## 何时使用

- 开关一项立即生效的状态，且这项状态不参与表单提交。

## 何时不用

- 状态要随表单提交：用[开关](./switch)或[复选框](./checkbox)。
- 按下去只发生一次动作、不留状态：那是[按钮](./button)。

## 特性

- 形态 · 语气 · 尺寸三轴。
- 受控时宿主不写回 \`pressed\` 值就不动，在途期间来的意图直接丢掉。
- \`disabled\` 同时挡住指针与键盘，按下态保持原样。

## 最佳实践

- 只放图标时给 \`aria-label\`，名字不能靠图形猜。
`

  t['headless-entry'] = `export { ${n.camel}Anatomy } from './${n.c}.anatomy'
export { connect${n.P} } from './${n.c}.connect'
export { ${n.camel}Keyboard } from './${n.c}.keyboard'
export { ${n.camel}Machine } from './${n.c}.machine'
export { ${n.camel}Meta } from './${n.c}.meta'
export type { ${n.P}Api, ${n.P}PressedChangeDetails, ${n.P}Schema, ${n.P}Translations } from './${n.c}.types'
`

  t['vue-composable'] = `import type { ${n.P}Api, ${n.P}Schema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connect${n.P}, ${n.camel}Machine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ${n.P}Context {
  api: ComputedRef<${n.P}Api>
}

export function use${n.P}(
  props: ${n.P}Schema['props'],
  onPressedChange?: ${n.P}Schema['props']['onPressedChange'],
): ${n.P}Context {
  // onPressedChange 由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(${n.camel}Machine, () => ({ ...props, onPressedChange }))
  const api = computed(() => connect${n.P}(service, vueNormalize))
  return { api }
}
`

  t['vue-component'] = `import type { ${n.P}Schema } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { use${n.P} } from './use-${n.c}'

type ${n.P}Props = ${n.P}Schema['props']

export const Xh${n.P} = defineComponent({
  name: 'Xh${n.P}',
  props: {
    pressed: { type: Boolean, default: undefined },
    defaultPressed: Boolean,
    disabled: Boolean,
    variant: String as PropType<ActionVariant>,
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  // pressed-change 携带 { pressed }；update:pressed 携带裸布尔，支持 v-model:pressed
  emits: {
    'pressed-change': (_details: PayloadOf<${n.P}Props, 'onPressedChange'>) => true,
    'update:pressed': (_pressed: PayloadOf<${n.P}Props, 'onPressedChange'>['pressed']) => true,
  },
  setup(props, { emit, slots }) {
    const notify: ${n.P}Props['onPressedChange'] = (details) => {
      emit('pressed-change', details)
      emit('update:pressed', details.pressed)
    }
    const { api } = use${n.P}(props as ${n.P}Props, notify)
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})
`

  t['wc-element'] = `import type { ${n.P}PressedChangeDetails, ${n.P}Schema } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import { connect${n.P}, ${n.camel}Anatomy, ${n.camel}Machine, ${n.camel}Meta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * \`<xh-${n.c}>\` —— Light-DOM 行为宿主，跑 ${n.c} 机器并把 connect 产出打到 root 角色节点。
 *
 * @customElement xh-${n.c}
 * @attr {boolean} pressed - 受控按下态；缺省该属性即非受控
 * @attr {boolean} default-pressed - 非受控初始为按下
 * @attr {boolean} disabled - 禁用
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires pressed-change - pressed 状态变化；detail 为 \`{ pressed: boolean }\`
 * @csspart root - role=button 的按钮（承载 aria-pressed / data-state）
 */
export class Xh${n.P}Element extends XhElement {
  static override partContract = { anatomy: ${n.camel}Anatomy, meta: ${n.camel}Meta }

  static override properties = {
    pressed: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultPressed: { type: Boolean, attribute: 'default-pressed' },
    disabled: { type: Boolean },
    variant: {},
    tone: {},
    size: {},
  }

  declare pressed?: boolean
  declare defaultPressed?: boolean
  declare disabled?: boolean
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: ${n.P}PressedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('pressed-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<${n.P}Schema>(this, ${n.camel}Machine, () => this.machineProps())

  private machineProps(): Partial<${n.P}Schema['props']> {
    return {
      pressed: this.pressed,
      defaultPressed: this.defaultPressed ?? false,
      disabled: this.disabled ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onPressedChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connect${n.P}(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
`

  t.skin = `@layer xihan.components {
  /* 皮肤在场的标记：开发模式下按 scope 探一次，取不到就说明这份皮肤没被引入。 */
  [data-scope='${n.c}'] {
    --xh-${n.c}-skin: 1;
  }

  [data-scope='${n.c}'][data-part='root'] {
    /* 私有槽位：组件令牌 → 语义令牌两级回退，变体只改这几个槽位 */
    --xh-_bg: var(--xh-${n.c}-bg, transparent);
    --xh-_bg-hover: var(--xh-${n.c}-bg-hover, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-${n.c}-fg, var(--xh-fg-default));
    --xh-_bg-pressed: var(--xh-${n.c}-bg-pressed, var(--xh-bg-subtle-active));
    --xh-_fg-pressed: var(--xh-${n.c}-fg-pressed, var(--xh-fg-default));

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--xh-${n.c}-gap, var(--xh-control-gap-md));
    block-size: var(--xh-${n.c}-h, var(--xh-control-h-md));
    padding-inline: var(--xh-${n.c}-px, var(--xh-control-px-md));
    border: var(--xh-stroke-thin) solid transparent;
    border-radius: var(--xh-${n.c}-radius, var(--xh-shape-control));
    background: var(--xh-_bg);
    color: var(--xh-_fg);
    font-size: var(--xh-${n.c}-font-size, var(--xh-text-label-size));
    font-weight: var(--xh-${n.c}-font-weight, var(--xh-text-label-weight));
    line-height: var(--xh-leading-none);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition:
      background var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
      box-shadow var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
      scale var(--xh-motion-duration-micro) var(--xh-motion-ease-enter-strong);
  }

  [data-scope='${n.c}'][data-part='root']:hover {
    background: var(--xh-_bg-hover);
  }

  /* 按下去要有回应：整颗轻微下压，松手即弹回。置灰的不压 */
  [data-scope='${n.c}'][data-part='root']:not([data-disabled]):active {
    scale: var(--xh-motion-scale-press);
  }

  [data-scope='${n.c}'][data-part='root'][data-disabled] {
    cursor: not-allowed;
    opacity: var(--xh-state-disabled-opacity);
  }

  [data-scope='${n.c}'][data-part='root']:focus-visible {
    outline: var(--xh-ring-width) solid var(--xh-ring-focus);
    outline-offset: var(--xh-ring-offset);
  }

  /* —— 变体 —— */
  /* 形态只决定颜色怎么用；用哪族颜色由 data-tone 决定，没写 tone 就沿用原来的中性配色 */
  [data-scope='${n.c}'][data-part='root'][data-variant='solid'] {
    --xh-_bg: transparent;
    --xh-_bg-hover: var(--xh-_tone-subtle, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-_tone-fg, var(--xh-fg-default));
    --xh-_bg-pressed: var(--xh-_tone, var(--xh-bg-brand));
    --xh-_fg-pressed: var(--xh-_tone-on, var(--xh-fg-on-brand));
  }

  [data-scope='${n.c}'][data-part='root'][data-variant='subtle'] {
    --xh-_bg: var(--xh-_tone-subtle, var(--xh-bg-subtle));
    --xh-_bg-hover: var(--xh-_tone-subtle-hover, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-_tone-fg, var(--xh-fg-default));
    --xh-_bg-pressed: var(--xh-_tone-subtle-active, var(--xh-bg-subtle-active));
    --xh-_fg-pressed: var(--xh-_tone-fg, var(--xh-fg-default));
  }

  [data-scope='${n.c}'][data-part='root'][data-variant='outline'] {
    --xh-_bg: transparent;
    --xh-_bg-hover: var(--xh-_tone-subtle, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-_tone-fg, var(--xh-fg-default));
    --xh-_bg-pressed: var(--xh-_tone-subtle-active, var(--xh-bg-subtle-active));
    --xh-_fg-pressed: var(--xh-_tone-fg, var(--xh-fg-default));

    border-color: var(--xh-_tone-border-control, var(--xh-border-control));
  }

  [data-scope='${n.c}'][data-part='root'][data-variant='ghost'] {
    --xh-_bg: transparent;
    --xh-_bg-hover: var(--xh-_tone-subtle, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-_tone-fg, var(--xh-fg-default));
    --xh-_bg-pressed: var(--xh-_tone-subtle-active, var(--xh-bg-subtle-active));
    --xh-_fg-pressed: var(--xh-_tone-fg, var(--xh-fg-default));
  }

  /* 按下态排在变体之后：两者特异度相同，后写的那条赢，
     变体只负责给出按下档的取值，切换由这里一处完成 */
  [data-scope='${n.c}'][data-part='root'][data-state='on'] {
    --xh-_bg: var(--xh-_bg-pressed);
    --xh-_bg-hover: var(--xh-_bg-pressed);

    color: var(--xh-_fg-pressed);
  }

  /* 只有实心档按下后才是一块实心语气底，顶边画一条极浅的内高光把它衬出厚度。
     置灰时整枚已经压暗，高光一并排除 */
  [data-scope='${n.c}'][data-part='root'][data-variant='solid'][data-state='on']:not([data-disabled]) {
    --xh-_${n.c}-highlight: var(--xh-_highlight-tone);

    box-shadow: var(--xh-${n.c}-shadow, var(--xh-_${n.c}-highlight));
  }

  /* —— 尺寸 —— */
  [data-scope='${n.c}'][data-part='root'][data-size='sm'] {
    block-size: var(--xh-${n.c}-h, var(--xh-control-h-sm));
    padding-inline: var(--xh-${n.c}-px, var(--xh-control-px-sm));
    font-size: var(--xh-${n.c}-font-size, var(--xh-control-font-sm));
  }

  [data-scope='${n.c}'][data-part='root'][data-size='lg'] {
    block-size: var(--xh-${n.c}-h, var(--xh-control-h-lg));
    padding-inline: var(--xh-${n.c}-px, var(--xh-control-px-lg));
    font-size: var(--xh-${n.c}-font-size, var(--xh-control-font-lg));
  }

  /* 声明过任何 display 就盖掉了 UA 的 [hidden]{display:none}，收起态得自己还回去。
     写在文件末尾：兜底必须排在该部件所有 display 声明之后 */
  [data-scope='${n.c}'][data-part='root'][hidden] {
    display: none;
  }
}
`

  t.suite = `import type { ConformanceSuite } from '../conformance/types'
import { ${n.camel}Anatomy, ${n.camel}Keyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const ${n.camel}Suite: ConformanceSuite = {
  component: '${n.c}',
  anatomy: ${n.camel}Anatomy,
  keyboard: ${n.camel}Keyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: 'B' }] },
  cases: [
    {
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['${n.c}.kbd.toggle'],
      steps: [nativeActivation('${n.c}', 'root')],
    },
    {
      name: '初始未按下：type=button、aria-pressed=false、data-state=off',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'type': 'button',
            'aria-pressed': 'false',
            'data-state': 'off',
            'data-disabled': null,
          },
        },
      },
    },
    {
      name: '点击按下：aria-pressed=true、data-state=on，派发 pressed-change',
      spec: { apg: \`\${APG}#keyboardinteraction\` },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: {
              root: { 'aria-pressed': 'true', 'data-state': 'on' },
            },
            events: [{ type: 'pressed-change', detail: { pressed: true } }],
          },
        },
      ],
    },
    {
      name: '受控 pressed：点击只发 pressed-change 不自改 DOM，父写回后才变',
      spec: { adr: 'controlled-uncontrolled' },
      props: { pressed: false },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'aria-pressed': 'false', 'data-state': 'off' } },
            events: [{ type: 'pressed-change', detail: { pressed: true } }],
          },
        },
        { kind: 'setProps', props: { pressed: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'on' } },
          expect: { parts: { root: { 'aria-pressed': 'true' } } },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不切换、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'root' },
        dispatchClickOnDisabled('${n.c}', 'root', {
          parts: { root: { 'disabled': '', 'data-disabled': '', 'aria-pressed': 'false', 'data-state': 'off' } },
          events: [],
        }),
      ],
    },
  ],
}
`

  t['demo-vue'] = `<!-- 基础用法 | 按下态由 pressed 表达，非受控时组件自己维护 -->
<script setup lang="ts">
import { ref } from "vue";
import { Xh${n.P} } from "@xihan-ui/vue";

const on = ref(false);
</script>

<template>
  <Xh${n.P}>${label}</Xh${n.P}>
  <Xh${n.P} v-model:pressed="on">受控：{{ on ? "已按下" : "未按下" }}</Xh${n.P}>
</template>
`

  t['demo-html'] = `<!-- 基础用法 | 按下态由 pressed 表达，非受控时组件自己维护 -->
<xh-${n.c}>
  <button data-xh-part="root">${label}</button>
</xh-${n.c}>

<xh-${n.c} id="${n.c}-basic-controlled" pressed="false">
  <button data-xh-part="root">受控：未按下</button>
</xh-${n.c}>

<script type="module">
  // 受控那颗由宿主写回按下态，按钮文字跟着换
  const host = document.getElementById("${n.c}-basic-controlled");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("pressed-change", (event) => {
    host.pressed = event.detail.pressed;
    root.textContent = \`受控：\${event.detail.pressed ? "已按下" : "未按下"}\`;
  });
</script>
`

  t.changeset = `---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** \`${n.c}\` 组件（${label}）：Vue 与 Web Components 两侧同时可用。

骨架由 \`node scripts/new-component.mjs\` 生成，正文待补：这里写清它解决什么、与既有组件如何分工、
哪些行为是承诺、哪些是实现细节。
`

  return t
}

// ── 登记点处理器 ──────────────────────────────────────────────────────────────

/** 每个处理器读原文、返回改完的原文。键与 targets.json 的 modifies[].id 一一对应。 */
const HANDLERS = {
  'headless-index': (src, n) => insertSorted(
    src,
    /^export (?:type )?\{.*\} from '\.\/([\w-]+)'$/,
    hit => hit[1],
    [
      `export { connect${n.P}, ${n.camel}Anatomy, ${n.camel}Keyboard, ${n.camel}Machine, ${n.camel}Meta } from './${n.c}'`,
      `export type { ${n.P}Api, ${n.P}PressedChangeDetails, ${n.P}Schema, ${n.P}Translations } from './${n.c}'`,
    ],
    n.c,
  ),

  'headless-translations': (src, n) => {
    const withImport = insertSorted(
      src,
      /^import type \{ \w+ \} from '\.\.\/([\w-]+)\/[\w-]+\.types'$/,
      hit => hit[1],
      [`import type { ${n.P}Translations } from '../${n.c}/${n.c}.types'`],
      n.c,
    )
    return insertSorted(
      withImport,
      /^ {2}'([\w-]+)'\?: Partial<\w+Translations>$/,
      hit => hit[1],
      [`  '${n.c}'?: Partial<${n.P}Translations>`],
      n.c,
    )
  },

  'vue-index': (src, n) => insertSorted(
    src,
    /^export (?:type )?\{.*\} from '(\.\/components\/[\w-]+\/[\w-]+)'$/,
    hit => hit[1],
    [
      `export { Xh${n.P} } from './components/${n.c}/${n.c}'`,
      `export { use${n.P} } from './components/${n.c}/use-${n.c}'`,
      `export type { ${n.P}Context } from './components/${n.c}/use-${n.c}'`,
    ],
    `./components/${n.c}/${n.c}`,
  ),

  'vue-conformance': (src, n) => insertBefore(
    insertIntoInlineImport(src, /^import \{(.+)\} from '@xihan-ui\/testing'$/m, `${n.camel}Suite`),
    /^ {2}\],$/,
    [`    ${n.camel}Suite,`],
  ),

  'wc-define': (src, n) => {
    const withImport = insertSorted(
      src,
      /^import \{ \w+ \} from '\.\/elements\/([\w-]+)'$/,
      hit => hit[1],
      [`import { Xh${n.P}Element } from './elements/${n.c}'`],
      n.c,
    )
    const withDefine = insertSorted(
      withImport,
      /^ {2}defineElement\('xh-([\w-]+)', \w+, VERSION\)$/,
      hit => hit[1],
      [`  defineElement('xh-${n.c}', Xh${n.P}Element, VERSION)`],
      n.c,
    )
    return insertSorted(
      withDefine,
      /^ {2}(Xh\w+Element),$/,
      hit => hit[1].toLowerCase(),
      [`  Xh${n.P}Element,`],
      `xh${n.P}Element`.toLowerCase(),
    )
  },

  'wc-suites': (src, n) => insertBeforeLast(
    insertIntoInlineImport(src, /^import \{(.+)\} from '@xihan-ui\/testing'$/m, `${n.camel}Suite`),
    /^ {2}\]$/,
    [`    ${n.camel}Suite,`],
  ),

  'testing-index': (src, n) => insertSorted(
    src,
    /^export \{ \w+ \} from '\.\/suites\/([\w-]+)\.suite'$/,
    hit => hit[1],
    [`export { ${n.camel}Suite } from './suites/${n.c}.suite'`],
    n.c,
  ),

  'testing-all': (src, n) => insertBefore(
    insertSorted(
      src,
      /^import \{ \w+ \} from '\.\/([\w-]+)\.suite'$/,
      hit => hit[1],
      [`import { ${n.camel}Suite } from './${n.c}.suite'`],
      n.c,
    ),
    /^\]$/,
    [`  ${n.camel}Suite,`],
  ),

  'testing-parity': (src, n) => insertBefore(
    insertSorted(
      src,
      /^ {2}(\w+Suite),$/,
      hit => hit[1].toLowerCase(),
      [`  ${n.camel}Suite,`],
      `${n.camel}Suite`.toLowerCase(),
    ),
    /^\]$/,
    [`  ${n.camel}Suite,`],
  ),

  'styles-index': (src, n) => {
    // 组件皮肤那一段是字母序；层内胜负靠源序，段外那几条（overlay-arrow / forced-colors）位置是刻意的，跳过
    const SKIP = new Set(['overlay-arrow', 'forced-colors', 'layers', 'reset', 'tone', 'visually-hidden', 'undefined'])
    const lines = src.split('\n')
    const start = lines.findIndex(line => line === `@import './css/accordion.css';`)
    if (start === -1)
      throw new Error('index.css 里找不到组件皮肤段的起点 accordion.css')
    for (let i = start; i < lines.length; i++) {
      const hit = lines[i].match(/^@import '\.\/css\/([\w-]+)\.css';$/)
      if (!hit || SKIP.has(hit[1]))
        continue
      if (hit[1] > n.c) {
        lines.splice(i, 0, `@import './css/${n.c}.css';`)
        return lines.join('\n')
      }
    }
    throw new Error('index.css 里找不到插入位置')
  },

  'docs-manifest': (src, n, ctx) => {
    const manifest = JSON.parse(src)
    const category = manifest.categories.find(item => item.id === ctx.category)
    if (!category)
      throw new Error(`没有分类 ${ctx.category}；可用：${manifest.categories.map(c => c.id).join(' / ')}`)
    if (category.components.some(item => item.id === n.c))
      throw new Error(`${n.c} 已登记在分类 ${ctx.category} 里`)
    category.components.push({ id: n.c, name: ctx.label })
    category.components.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    return `${JSON.stringify(manifest, null, 2)}\n`
  },

  'gate-press-feedback': (src, n) => insertBefore(
    src,
    /^ {2}\/\/ 清空 \/ 关闭 \/ 移除按钮四类/,
    [`  '${n.c}': ['root'],`],
  ),

  'gate-control-height': (src, n) => insertSorted(
    src,
    /^ {2}'([\w-]+)': \[[^\]]*\],$/,
    hit => hit[1],
    [`  '${n.c}': ['root'],`],
    n.c,
  ),
}

// ── 落点清单的两侧反查 ────────────────────────────────────────────────────────

async function verifyTargets(targets) {
  const probe = names(targets.probe)
  const problems = []
  let checked = 0

  /** 拿探针组件的名字展开路径，文件必须在场；标了 probe: "none" 的免检，但要写明理由。 */
  const probeExists = (item, group) => {
    if (item.probe === 'none') {
      if (!item.whyNoProbe)
        problems.push(`${group}.${item.id ?? item.path}  标了 probe: "none" 却没写 whyNoProbe`)
      return
    }
    checked++
    const path = fill(item.path, probe)
    if (!existsSync(abs(path)))
      problems.push(`${path}  探针组件 ${probe.c} 没有这个文件——${group} 里的这条过期了`)
  }

  for (const item of targets.creates)
    probeExists(item, 'creates')

  const ids = new Set(targets.modifies.map(item => item.id))
  for (const id of Object.keys(HANDLERS)) {
    if (!ids.has(id))
      problems.push(`处理器 ${id} 在 targets.json 的 modifies 里没有条目`)
  }

  for (const item of targets.modifies) {
    checked++
    if (!HANDLERS[item.id]) {
      problems.push(`modifies.${item.id}  登记了却没有同名处理器`)
      continue
    }
    const path = abs(item.path)
    if (!existsSync(path)) {
      problems.push(`${item.path}  文件不在了——modifies 里的这条过期了`)
      continue
    }
    const source = await readFile(path, 'utf8')
    if (!anchorRe(item.probeAnchor, probe).test(source))
      problems.push(`${item.path}  探针组件 ${probe.c} 在这里找不到登记（锚点 ${fill(item.probeAnchor, probe)}）——登记形态改过了`)
  }

  for (const item of targets.generated)
    probeExists(item, 'generated')
  for (const item of targets.manual)
    probeExists(item, 'manual')

  return { problems, checked, probe }
}

// ── 文档数字回填 ──────────────────────────────────────────────────────────────

/**
 * 跑一遍 check-doc-numbers，把它报出来的「文档写 X，实际 Y」逐处改掉。
 * 真值由那道门禁自己算，这里只搬运，不另存一份增量表。
 */
async function syncDocNumbers() {
  const { spawnSync } = await import('node:child_process')
  const run = spawnSync(process.execPath, [DOC_NUMBERS], { cwd: uiRoot, encoding: 'utf8' })
  if (run.status === 0)
    return { fixed: 0, manual: [] }

  const report = `${run.stdout ?? ''}${run.stderr ?? ''}`
  const fixable = []
  const manual = []
  for (const line of report.split('\n')) {
    const hit = line.match(/^\s*(\S+?):(\d+)\s+文档写 (\d+)，实际 (\d+)/)
    if (hit)
      fixable.push({ file: hit[1], line: Number(hit[2]), from: hit[3], to: hit[4] })
    else if (line.trim() && !line.startsWith('文档里的数字') && !line.startsWith('改法：'))
      manual.push(line.trim())
  }

  const byFile = new Map()
  for (const item of fixable)
    byFile.set(item.file, [...(byFile.get(item.file) ?? []), item])

  let fixed = 0
  for (const [file, items] of byFile) {
    const path = abs(`../${file}`)
    const lines = (await readFile(path, 'utf8')).split('\n')
    for (const item of items) {
      const idx = item.line - 1
      const next = lines[idx].replace(new RegExp(`(?<!\\d)${item.from}(?!\\d)`), item.to)
      if (next === lines[idx]) {
        manual.push(`${file}:${item.line} 行内找不到 ${item.from}，请手改成 ${item.to}`)
        continue
      }
      lines[idx] = next
      fixed++
    }
    await writeFile(path, lines.join('\n'), 'utf8')
  }
  return { fixed, manual }
}

// ── 主流程 ────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const flag = name => argv.includes(`--${name}`)
function opt(name) {
  const hit = argv.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}

const targets = JSON.parse(await readFile(TARGETS, 'utf8'))

if (flag('list-categories')) {
  const manifest = JSON.parse(await readFile(abs('scripts/component-docs.manifest.json'), 'utf8'))
  for (const category of manifest.categories)
    console.log(`${category.id.padEnd(14)}${category.label}  （${category.components.length} 个组件）`)
  process.exit(0)
}

const verified = await verifyTargets(targets)
if (verified.problems.length) {
  console.error('[new-component] ✗ 落点清单与仓库对不上：')
  for (const p of verified.problems)
    console.error(`  ${p}`)
  process.exit(1)
}

if (flag('verify')) {
  console.log(`[new-component] 落点清单核对通过：${targets.creates.length} 处新建 · ${targets.modifies.length} 处登记 · ${targets.generated.length} 份生成物 · ${targets.manual.length} 处人工，拿 ${verified.probe.c} 反查了 ${verified.checked} 条`)
  process.exit(0)
}

if (flag('sync-doc-numbers')) {
  const result = await syncDocNumbers()
  console.log(`[new-component] 文档数字回填 ${result.fixed} 处`)
  for (const line of result.manual)
    console.log(`  ${line}`)
  process.exit(result.manual.length ? 1 : 0)
}

const name = argv.find(a => !a.startsWith('--'))
if (!name) {
  console.error('用法：node scripts/new-component.mjs <kebab-name> --label=<中文名> --category=<分类 id> [--dry-run] [--show-hunks]')
  console.error('     node scripts/new-component.mjs --verify | --sync-doc-numbers | --list-categories')
  process.exit(1)
}
if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
  console.error(`[new-component] ✗ 组件名要是 kebab-case：${name}`)
  process.exit(1)
}

const n = names(name)
const label = opt('label') ?? n.P
const category = opt('category')
const dryRun = flag('dry-run')

if (!category) {
  console.error('[new-component] ✗ 缺 --category=<分类 id>；跑 --list-categories 看可用分类')
  process.exit(1)
}
const files = templates(n, label)

// 只把模板按给定组件名写到指定目录，不碰仓库：拿既有组件的名字跑一遍再与它的源文件比对，
// 就能看出模板有没有相对参照组件走样。
const emitTo = opt('emit-templates')
if (emitTo) {
  await mkdir(emitTo, { recursive: true })
  for (const [id, content] of Object.entries(files))
    await writeFile(join(emitTo, `${id}.txt`), content, 'utf8')
  console.log(`[new-component] 已把 ${Object.keys(files).length} 份模板按 ${n.c} 展开到 ${emitTo}`)
  process.exit(0)
}

if (existsSync(abs(`packages/engine/headless/src/${n.c}`))) {
  console.error(`[new-component] ✗ 组件 ${n.c} 已存在`)
  process.exit(1)
}
const plan = { creates: [], modifies: [] }

for (const item of targets.creates) {
  const path = fill(item.path, n)
  const content = files[item.id]
  if (content === undefined)
    throw new Error(`creates.${item.id} 没有对应模板`)
  if (existsSync(abs(path)))
    throw new Error(`${path} 已存在`)
  plan.creates.push({ path, what: item.what, content })
}

for (const item of targets.modifies) {
  const path = abs(item.path)
  const before = await readFile(path, 'utf8')
  let after
  try {
    after = HANDLERS[item.id](before, n, { category, label })
  }
  catch (error) {
    console.error(`[new-component] ✗ ${item.path} 插不进去：${error.message}`)
    process.exit(1)
  }
  if (after === before) {
    console.error(`[new-component] ✗ ${item.path} 没有实际改动，登记没插进去`)
    process.exit(1)
  }
  plan.modifies.push({ path, rel: item.path, what: item.what, content: after, hunks: addedLines(before, after) })
}

/**
 * 改后的文件里哪几行是新的：返回 [行号, 文本]。
 * 逐行对齐，对不上时先在原文剩下的行里找同一行文本——找得到说明中间几行被删/被改，
 * 跳过去继续对齐；找不到才算新增。
 */
function addedLines(before, after) {
  const a = before.split('\n')
  const b = after.split('\n')
  const positions = new Map()
  a.forEach((line, idx) => positions.set(line, [...(positions.get(line) ?? []), idx]))

  const out = []
  let i = 0
  for (let j = 0; j < b.length; j++) {
    if (i < a.length && a[i] === b[j]) {
      i++
      continue
    }
    const next = (positions.get(b[j]) ?? []).find(idx => idx >= i)
    if (next === undefined)
      out.push([j + 1, b[j]])
    else
      i = next + 1
  }
  return out
}

if (dryRun) {
  console.log(`[new-component] --dry-run：${n.c}（${label}，分类 ${category}），不落盘\n`)
  console.log(`新建 ${plan.creates.length} 份：`)
  for (const item of plan.creates)
    console.log(`  + ${item.path}  —— ${item.what}`)
  console.log(`\n改动 ${plan.modifies.length} 处登记：`)
  for (const item of plan.modifies) {
    console.log(`  ~ ${item.rel}  —— ${item.what}`)
    if (flag('show-hunks')) {
      for (const [line, text] of item.hunks)
        console.log(`      ${String(line).padStart(5)}+ ${text}`)
    }
  }
  console.log(`\n跑生成器重出 ${targets.generated.length} 份产物：`)
  for (const item of targets.generated)
    console.log(`  $ ${item.command.padEnd(26)} ${fill(item.path, n)}  —— ${item.what}`)
  console.log(`\n人工决定 ${targets.manual.length} 处：`)
  for (const item of targets.manual)
    console.log(`  ! ${fill(item.path, n)}  —— ${item.what}`)
  console.log('\n落盘后还会跑一遍 check-doc-numbers，把正文里对不上的数字按它算出的真值回填。')
  process.exit(0)
}

for (const item of plan.creates) {
  await mkdir(dirname(abs(item.path)), { recursive: true })
  await writeFile(abs(item.path), item.content, 'utf8')
}
for (const item of plan.modifies)
  await writeFile(item.path, item.content, 'utf8')

const docNumbers = await syncDocNumbers()

console.log(`[new-component] ${n.c} 已落地：新建 ${plan.creates.length} 份 · 登记 ${plan.modifies.length} 处 · 回填文档数字 ${docNumbers.fixed} 处`)
if (docNumbers.manual.length) {
  console.log('\n文档数字还有对不上的，逐条人工处理：')
  for (const line of docNumbers.manual)
    console.log(`  ${line}`)
}
console.log('\n接着跑：')
for (const item of targets.generated)
  console.log(`  ${item.command.padEnd(26)} —— ${item.what}`)
console.log(`  npx eslint <改动文件> --fix  —— 归一导入与导出的排序`)
console.log(`  pnpm typecheck`)
console.log('\n再人工决定：')
for (const item of targets.manual)
  console.log(`  ${fill(item.path, n)}  —— ${item.what}`)
