import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { colorPickerAnatomy, colorPickerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

// APG 没有取色器这一条模式：取色区按滑杆模式办，浮层部分按对话框模式办；
// 色相 / 透明度两条滑块与预设色板是内嵌组件，各自的键盘归 color-slider 与 color-swatch-picker 那两份套件。
const APG_SLIDER = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/'
const APG_SLIDER_KBD = `${APG_SLIDER}#keyboardinteraction`
const APG_DIALOG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

const SCOPE = '[data-scope="color-picker"]'
// 内嵌组件的部件戴各自的 scope，不进取色器的归一化快照，只能直接读 DOM
const SLIDER = '[data-scope="color-slider"]'
const SWATCHES = '[data-scope="color-swatch-picker"]'

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/** 内嵌滑块的部件：0 是色相那条，1 是透明度那条（按文档序）。 */
function sliderPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SLIDER}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到内嵌滑块的 ${name}[${index}] 部件`)
  return el
}

/** 预设色板的格子。 */
function swatchItem(doc: Document, index: number): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SWATCHES}[data-part="item"]`)[index]
  if (!el)
    throw new Error(`找不到色板的第 ${index} 格`)
  return el
}

function expectAttr(el: HTMLElement, name: string, expected: string | null): void {
  const actual = el.getAttribute(name)
  if (actual !== expected)
    throw new Error(`${el.getAttribute('data-scope')}/${el.getAttribute('data-part')} 的 ${name} 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** 往内嵌滑块的拇指上派一次按键；`key` 步骤只派给取色器自己的部件，内嵌拇指够不到。 */
function pressThumb(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

/**
 * 往数值框里打字。`type` 步骤只派按键、不改 value 也不派 input 事件，
 * 而输入框这一路的入口恰恰是 input 事件；只能直接改 DOM 值再派事件。
 * 两个适配器绑的都是同一个 onInput，桩打在真实节点上、对两侧一视同仁。
 */
function typeInto(doc: Document, index: number, text: string): void {
  const input = findPart(doc, 'channel-input', index) as HTMLInputElement
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** 表单影子由作者写在 root 里，只有需要提交的用例才声明它。 */
function withHiddenInput(base: FixtureNode): FixtureNode {
  return { ...base, children: [...(base.children ?? []), { part: 'hidden-input', tag: 'input' }] }
}

/** name/value/disabled 里只有 name 进得了归一化快照（value 只落 DOM property），表单出口只能直接读 DOM。 */
function assertHiddenInput(doc: Document, expected: readonly [string, string, boolean]): void {
  const el = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)
  if (!el)
    throw new Error('找不到 hidden-input 部件')
  const actual = [el.name, el.value, el.disabled] as const
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏输入的 name/value/disabled 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/**
 * 一条内嵌颜色滑块的挂载点：里面摆的是 color-slider 自己的 control / track / thumb。
 * 挂载点同时充当那条滑块的根节点，滑块自己的 root 部件不出现。
 */
function sliderMount(part: 'hue-slider' | 'alpha-slider'): FixtureNode {
  return {
    part,
    children: [{
      part: 'control',
      component: 'color-slider',
      children: [
        { part: 'track', component: 'color-slider' },
        { part: 'thumb', component: 'color-slider' },
      ],
    }],
  }
}

/** 预设色板的一格：色块面、选中标记与表单影子 Vue / React 由格子自行装配，WC 由作者手写。 */
function swatchNode(value: string): FixtureNode {
  return {
    part: 'item',
    component: 'color-swatch-picker',
    attrs: { value },
    children: [
      { part: 'hidden-input', tag: 'input', only: ['wc'] },
      { part: 'swatch', tag: 'span', only: ['wc'] },
      { part: 'indicator', tag: 'span', only: ['wc'] },
    ],
  }
}

/**
 * 按下色相轨道的正中。
 *
 * 通道的取值按轨道矩形算，而无布局环境里量什么都是 0，只能把这一帧的矩形原地伪造出来。
 * 这一步同时核的是适配器有没有把轨道节点接到那条滑块上——接错或漏接，值一动不动。
 */
function pressHueTrackCenter({ doc }: RawStepContext): void {
  const track = sliderPart(doc, 'track', 0)
  track.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 200,
    height: 10,
    top: 0,
    left: 0,
    right: 200,
    bottom: 10,
    toJSON: () => ({}),
  }) as DOMRect
  sliderPart(doc, 'control', 0).dispatchEvent(
    new PointerEvent('pointerdown', { clientX: 100, clientY: 5, button: 0, bubbles: true, cancelable: true }),
  )
}

/** 松手，收掉挂在文档上的跟手监听。 */
function releasePointer({ doc }: RawStepContext): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

export const colorPickerSuite: ConformanceSuite = {
  component: 'color-picker',
  anatomy: colorPickerAnatomy,
  keyboard: colorPickerKeyboard,
  // content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
  // value-text 刻意留空：两个适配器都会把当前值串填进去（作者写了内容才归作者）。
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '主题色' },
      {
        part: 'control',
        children: [
          {
            // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
            part: 'trigger',
            tag: 'button',
            children: [
              { part: 'swatch', tag: 'span' },
              { part: 'value-text', tag: 'span' },
            ],
          },
        ],
      },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'saturation-area', children: [{ part: 'area-thumb' }] },
              sliderMount('hue-slider'),
              sliderMount('alpha-slider'),
              { part: 'channel-input', tag: 'input', attrs: { channel: 'hex' } },
              { part: 'channel-input', tag: 'input', attrs: { channel: 'r' } },
              { part: 'eye-dropper-trigger', tag: 'button', text: '取色' },
              {
                part: 'swatch-picker',
                children: [swatchNode('#ff0000'), swatchNode('#00ff00')],
              },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认收起：触发器报 dialog 弹出物，浮层带 hidden，取色区拇指是 role=slider',
      spec: { apg: `${APG_SLIDER}#roles_states_properties` },
      props: { defaultValue: '#3b82f6' },
      initial: {
        order: [
          'root',
          'label',
          'control',
          'trigger',
          'swatch',
          'value-text',
          'positioner',
          'content',
          'saturation-area',
          'area-thumb',
          'hue-slider',
          'alpha-slider',
          'channel-input[0]',
          'channel-input[1]',
          'eye-dropper-trigger',
          'swatch-picker',
        ],
        counts: {
          'root': 1,
          'control': 1,
          'trigger': 1,
          'content': 1,
          'saturation-area': 1,
          'area-thumb': 1,
          'hue-slider': 1,
          'alpha-slider': 1,
          'channel-input': 2,
          'swatch-picker': 1,
        },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            // 名字由标题加当前值合成：只报标题的话，一排取色器读起来全都一样
            'aria-labelledby': '@part(label) @part(value-text)',
            'data-state': 'closed',
            'disabled': null,
          },
          'content': {
            'role': 'dialog',
            'aria-modal': 'false',
            'aria-labelledby': '@part(label)',
            'data-state': 'closed',
            'hidden': '',
          },
          'area-thumb': {
            'role': 'slider',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            // 二维控件只报得出一个 valuenow：取横轴（饱和度），另一条轴写进 valuetext
            'aria-valuenow': '76',
            'aria-valuetext': 'Saturation 76%, brightness 96%',
            'aria-label': 'Saturation and brightness',
            // 显式 false：省略是"没说"，读屏对两者的处理并不一样
            'aria-disabled': 'false',
            'tabindex': '0',
          },
          // 两个挂载点同时充当两条滑块的根节点：滑块 root 的状态标记照抄在它们身上
          'hue-slider': { 'data-channel': 'hue', 'data-orientation': 'horizontal', 'data-disabled': null },
          // alpha 没开：透明度那条整条不可用
          'alpha-slider': { 'data-channel': 'alpha', 'data-orientation': 'horizontal', 'data-disabled': '' },
          'channel-input': [
            { 'type': 'text', 'inputmode': null, 'aria-label': 'Hex', 'aria-invalid': 'false', 'disabled': null },
            { 'type': 'text', 'inputmode': 'numeric', 'aria-label': 'Red', 'disabled': null },
          ],
          // 色板的挂载点同时充当色板的根节点：radiogroup 与兜底 Tab 位都在它身上
          'swatch-picker': { 'role': 'radiogroup', 'aria-label': 'Color swatches', 'tabindex': '0' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '数值框的 value 是 DOM property，进不了归一化快照；value-text 的文字同理',
          run: ({ doc }) => {
            const hex = findPart(doc, 'channel-input', 0) as HTMLInputElement
            const red = findPart(doc, 'channel-input', 1) as HTMLInputElement
            if (hex.value !== '#3b82f6')
              throw new Error(`十六进制框应显示 #3b82f6，实际 ${hex.value}`)
            if (red.value !== '59')
              throw new Error(`红色分量框应显示 59，实际 ${red.value}`)
            if (findPart(doc, 'value-text').textContent !== '#3b82f6')
              throw new Error('value-text 应显示当前值串')
          },
        },
        {
          kind: 'raw',
          why: '内嵌滑块与色板的部件戴各自的 scope，不进取色器的归一化快照，只能直接读 DOM',
          run: ({ doc }) => {
            const hue = sliderPart(doc, 'thumb', 0)
            expectAttr(hue, 'role', 'slider')
            expectAttr(hue, 'aria-valuemin', '0')
            expectAttr(hue, 'aria-valuemax', '360')
            expectAttr(hue, 'aria-valuenow', '217')
            expectAttr(hue, 'aria-valuetext', '217°')
            expectAttr(hue, 'aria-label', 'Hue')
            expectAttr(hue, 'aria-orientation', 'horizontal')
            expectAttr(hue, 'aria-disabled', 'false')
            expectAttr(hue, 'tabindex', '0')
            // alpha 没开：透明度那条整条不可用，且抽掉 Tab 位
            const alpha = sliderPart(doc, 'thumb', 1)
            expectAttr(alpha, 'aria-disabled', 'true')
            expectAttr(alpha, 'tabindex', null)
            expectAttr(alpha, 'data-disabled', '')
            // 色板每格是 role=radio，未选中也显式报 false
            const red = swatchItem(doc, 0)
            expectAttr(red, 'role', 'radio')
            expectAttr(red, 'aria-checked', 'false')
            expectAttr(red, 'data-value', '#ff0000')
            expectAttr(red, 'data-state', 'unchecked')
            expectAttr(swatchItem(doc, 1), 'data-value', '#00ff00')
          },
        },
      ],
    },
    {
      name: 'Enter / Space 开合：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG_DIALOG },
      steps: [nativeActivation('color-picker', 'trigger')],
    },
    {
      name: '点击触发器展开：content 撤掉 hidden，焦点落进浮层里第一个可聚焦控件',
      spec: { apg: `${APG_DIALOG}#keyboardinteraction` },
      props: { defaultValue: '#3b82f6' },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'area-thumb' },
          expect: { activeElement: { part: 'area-thumb', exact: true } },
        },
      ],
    },
    {
      name: 'Escape 收起：content 复位 hidden 且焦点归还触发器',
      spec: { apg: `${APG_DIALOG}#keyboardinteraction` },
      covers: ['color-picker.kbd.escape'],
      props: { defaultValue: '#3b82f6' },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'area-thumb' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false' }, content: { hidden: '' } } },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: '取色区：左右调饱和度、上下调明度，Shift 走大步',
      spec: { apg: APG_SLIDER_KBD },
      covers: [
        'color-picker.kbd.area-saturation',
        'color-picker.kbd.area-brightness',
        'color-picker.kbd.area-large-step',
      ],
      props: { defaultValue: '#3b82f6', defaultOpen: true },
      steps: [
        { kind: 'focus', part: 'area-thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'area-thumb': { 'aria-valuenow': '77' } } } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          modifiers: ['Shift'],
          expect: { parts: { 'area-thumb': { 'aria-valuenow': '67' } } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          // 明度只写进 valuetext，valuenow 仍是横轴
          expect: { parts: { 'area-thumb': { 'aria-valuetext': 'Saturation 67%, brightness 95%' } } },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { 'area-thumb': { 'aria-valuetext': 'Saturation 67%, brightness 96%' } } },
        },
      ],
    },
    {
      name: '取色区 Home / End 取饱和度端点',
      spec: { apg: APG_SLIDER_KBD },
      covers: ['color-picker.kbd.area-edge'],
      props: { defaultValue: '#3b82f6', defaultOpen: true },
      steps: [
        { kind: 'focus', part: 'area-thumb' },
        { kind: 'key', key: 'End', expect: { parts: { 'area-thumb': { 'aria-valuenow': '100' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { 'area-thumb': { 'aria-valuenow': '0' } } } },
      ],
    },
    {
      name: '内嵌色相滑块：拇指上按方向键走一格、PageUp 走十格、Home/End 取端点，取色器跟着落值',
      spec: { apg: APG_SLIDER_KBD },
      props: { defaultValue: '#ff0000', defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '内嵌滑块的拇指不进取色器的快照，focus / key 步骤都够不到，只能直接派发',
          run: async (ctx) => {
            const thumb = sliderPart(ctx.doc, 'thumb', 0)
            thumb.focus()
            if (!pressThumb(thumb, 'ArrowRight').defaultPrevented)
              throw new Error('方向键该被拇指拦下')
            await ctx.flush()
            expectAttr(thumb, 'aria-valuenow', '1')
            expectAttr(thumb, 'aria-valuetext', '1°')
            pressThumb(thumb, 'PageUp')
            await ctx.flush()
            expectAttr(thumb, 'aria-valuenow', '11')
            pressThumb(thumb, 'End')
            await ctx.flush()
            expectAttr(thumb, 'aria-valuenow', '360')
            pressThumb(thumb, 'Home')
            await ctx.flush()
            expectAttr(thumb, 'aria-valuenow', '0')
          },
          // 值串跟着走：360° 与 0° 都是红，最后一下回到起点
          expect: { parts: { 'area-thumb': { 'aria-valuenow': '100' } } },
        },
      ],
    },
    {
      name: '内嵌色相滑块：按下轨道即跳到落点，焦点转投到那条的拇指上',
      spec: { apg: `${APG_SLIDER}#roles_states_properties` },
      props: { defaultValue: '#ff0000', defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '取值按轨道矩形算，无布局环境量什么都是 0，只能把这一帧的矩形原地伪造出来',
          run: async (ctx) => {
            pressHueTrackCenter(ctx)
            await ctx.flush()
            // 200px 轨道的正中 → 180 度；按下的那条打上拖动标记，另一条不跟着亮
            const hue = sliderPart(ctx.doc, 'thumb', 0)
            expectAttr(hue, 'aria-valuenow', '180')
            expectAttr(hue, 'data-dragging', '')
            expectAttr(sliderPart(ctx.doc, 'thumb', 1), 'data-dragging', null)
            // 松手就能接着用方向键微调
            if (ctx.doc.activeElement !== hue)
              throw new Error('按下轨道后焦点应转投到色相那条的拇指上')
          },
          expect: { parts: { 'saturation-area': { 'data-dragging': null } } },
        },
        {
          kind: 'raw',
          why: '跟手的监听挂在文档上，不松手会留到下一个用例',
          run: async (ctx) => {
            releasePointer(ctx)
            await ctx.flush()
            const hue = sliderPart(ctx.doc, 'thumb', 0)
            expectAttr(hue, 'aria-valuenow', '180')
            expectAttr(hue, 'data-dragging', null)
          },
        },
      ],
    },
    {
      name: 'alpha 打开：透明度滑块进 Tab 序列并可调，挂载点撤掉禁用标记',
      spec: { apg: `${APG_SLIDER}#roles_states_properties` },
      props: { defaultValue: '#ff0000', alpha: true, defaultOpen: true },
      initial: {
        parts: { 'alpha-slider': { 'data-disabled': null } },
      },
      steps: [
        {
          kind: 'raw',
          why: '内嵌滑块的拇指不进取色器的快照，只能直接读 DOM 与派发',
          run: async (ctx) => {
            const alpha = sliderPart(ctx.doc, 'thumb', 1)
            expectAttr(alpha, 'aria-disabled', 'false')
            expectAttr(alpha, 'aria-valuenow', '100')
            expectAttr(alpha, 'aria-valuetext', '100%')
            expectAttr(alpha, 'aria-label', 'Alpha')
            expectAttr(alpha, 'tabindex', '0')
            alpha.focus()
            pressThumb(alpha, 'ArrowLeft')
            await ctx.flush()
            expectAttr(alpha, 'aria-valuenow', '99')
            pressThumb(alpha, 'Home')
            await ctx.flush()
            expectAttr(alpha, 'aria-valuenow', '0')
          },
        },
      ],
    },
    {
      name: '预设色板：当前色那一格 aria-checked=true，点另一格即换色，色相滑块跟着跳',
      spec: { apg: APG_DIALOG },
      props: { defaultValue: '#ff0000', defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '色板的格子戴 color-swatch-picker 的 scope，不进取色器的快照，只能直接读 DOM 与点击',
          run: async (ctx) => {
            const red = swatchItem(ctx.doc, 0)
            const green = swatchItem(ctx.doc, 1)
            expectAttr(red, 'aria-checked', 'true')
            expectAttr(red, 'data-state', 'checked')
            expectAttr(green, 'aria-checked', 'false')
            green.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            await ctx.flush()
            expectAttr(red, 'aria-checked', 'false')
            expectAttr(green, 'aria-checked', 'true')
            // 色相跟着跳到绿
            expectAttr(sliderPart(ctx.doc, 'thumb', 0), 'aria-valuenow', '120')
          },
          expect: { events: [{ type: 'value-change', detail: { value: '#00ff00' } }] },
        },
      ],
    },
    {
      name: '十六进制框：打到一半只报 aria-invalid，值不动；打全了当场落值',
      spec: { apg: APG_DIALOG },
      props: { defaultValue: '#3b82f6', defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤只派按键，不改 value 也不派 input 事件，够不到输入框这一路的入口',
          // 五位是真的"打到一半"：三位与四位都是合法简写，收得下来
          run: ({ doc }) => typeInto(doc, 0, '#ff000'),
          expect: {
            parts: {
              'channel-input[0]': { 'aria-invalid': 'true', 'data-invalid': '' },
              // 值没被这串半截字带跑
              'area-thumb': { 'aria-valuenow': '76' },
            },
            events: [{ type: 'color-error', detail: { type: 'input', channel: 'hex', value: '#ff000' } }],
          },
        },
        {
          kind: 'raw',
          why: '同上，补全最后一位',
          run: ({ doc }) => typeInto(doc, 0, '#ff0000'),
          expect: {
            parts: {
              'channel-input[0]': { 'aria-invalid': 'false' },
              'area-thumb': { 'aria-valuenow': '100' },
            },
            events: [{ type: 'value-change', detail: { value: '#ff0000' } }],
          },
        },
      ],
    },
    {
      name: '回车提交非法文本：保留草稿与显式错误，且这一下必须被吞掉',
      spec: { apg: APG_DIALOG },
      props: { defaultValue: '#3b82f6', defaultOpen: true },
      covers: ['color-picker.kbd.input-commit'],
      steps: [
        {
          kind: 'raw',
          why: '打字与回车都够不到：type 步骤不改 value、key 步骤看不见 defaultPrevented',
          run: async (ctx) => {
            const { doc } = ctx
            // 先打一串收不下来的（五位是真的半截，三位四位都是合法简写）
            typeInto(doc, 0, '#ff000')
            await ctx.flush()
            const input = findPart(doc, 'channel-input', 0) as HTMLInputElement
            const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
            input.dispatchEvent(enter)
            await ctx.flush()
            // 取色器落在表单里时，这一下不吞就会顺手把表单提交掉
            if (!enter.defaultPrevented)
              throw new Error('回车必须被拦下，否则会触发表单提交')
            // 收不下来就保留原字让作者修，不能静默纠正成当前值
            if (input.value !== '#ff000')
              throw new Error(`非法输入应保留 #ff000，实际 ${input.value}`)
          },
          expect: {
            parts: { 'channel-input[0]': { 'aria-invalid': 'true', 'data-invalid': '' } },
            events: [{ type: 'color-error', detail: { type: 'input', channel: 'hex', value: '#ff000' } }],
          },
        },
        {
          kind: 'raw',
          why: '同上：要看 defaultPrevented，只能自己派',
          run: async (ctx) => {
            const { doc } = ctx
            typeInto(doc, 0, '#00ff00')
            await ctx.flush()
            const input = findPart(doc, 'channel-input', 0) as HTMLInputElement
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await ctx.flush()
            if (input.value !== '#00ff00')
              throw new Error(`收得下的输入应留在框里，实际 ${input.value}`)
          },
          expect: { events: [{ type: 'value-change', detail: { value: '#00ff00' } }] },
        },
      ],
    },
    {
      name: 'disabled：触发器原生禁用、取色区退出 Tab 序列，且不吞按键',
      spec: { apg: APG_SLIDER },
      props: { defaultValue: '#3b82f6', defaultOpen: true, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'trigger': { disabled: '' },
          // 禁用即不可聚焦（与原生 input[type=range] 一致），tabindex 整个不写
          'area-thumb': { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
          'hue-slider': { 'data-disabled': '' },
          'channel-input[0]': { disabled: '' },
          'eye-dropper-trigger': { disabled: '' },
          'swatch-picker': { 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 焦点落不到没有 tabindex 的节点上，必须直接往拇指上派事件才碰得到守卫
          why: '禁用的拇指不可聚焦，focus/key 步骤都会落空，必须直接派发',
          run: ({ doc }) => {
            const thumb = findPart(doc, 'area-thumb')
            const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
            thumb.dispatchEvent(arrow)
            // 推不动就不能吞键：这一下该留给页面滚动
            if (arrow.defaultPrevented)
              throw new Error('禁用状态下不该拦截方向键')
          },
          expect: { parts: { 'area-thumb': { 'aria-valuenow': '76' } } },
        },
        {
          kind: 'raw',
          why: '内嵌滑块的拇指与色板的格子不进取色器的快照，只能直接读 DOM 与派发',
          run: async (ctx) => {
            const hue = sliderPart(ctx.doc, 'thumb', 0)
            expectAttr(hue, 'aria-disabled', 'true')
            expectAttr(hue, 'tabindex', null)
            // 色板的格子用 aria-disabled 表达禁用，点了不换色
            const green = swatchItem(ctx.doc, 1)
            expectAttr(green, 'aria-disabled', 'true')
            green.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            await ctx.flush()
          },
          expect: { parts: { 'area-thumb': { 'aria-valuenow': '76' } }, events: [] },
        },
      ],
    },
    {
      name: 'readOnly：浮层照开、拇指仍在 Tab 序列里，但值改不动',
      spec: { apg: APG_SLIDER },
      props: { defaultValue: '#3b82f6', defaultOpen: true, readOnly: true },
      initial: {
        parts: {
          // 与 disabled 的差别就在这里：仍有 tabindex，aria-disabled 仍是 false
          'root': { 'data-readonly': '' },
          'area-thumb': { 'aria-disabled': 'false', 'tabindex': '0', 'data-readonly': '' },
          'channel-input[0]': { readonly: '', disabled: null },
        },
      },
      steps: [
        { kind: 'focus', part: 'area-thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'area-thumb': { 'aria-valuenow': '76' } } } },
        {
          kind: 'raw',
          why: '只读控件仍要能聚焦，这是它与禁用的分界',
          run: ({ doc }) => {
            if (doc.activeElement !== findPart(doc, 'area-thumb'))
              throw new Error('只读的取色区拇指仍应可聚焦')
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发',
      spec: { apg: APG_SLIDER },
      props: { value: '#ff0000', defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '内嵌滑块的拇指不进取色器的快照，focus / key 步骤都够不到，只能直接派发',
          run: async (ctx) => {
            const hue = sliderPart(ctx.doc, 'thumb', 0)
            hue.focus()
            pressThumb(hue, 'ArrowRight')
            await ctx.flush()
            // 受控下界面不许自作主张：拇指仍停在宿主给的那个值上
            expectAttr(hue, 'aria-valuenow', '0')
          },
          expect: { events: [{ type: 'value-change', detail: { value: '#ff0400' } }] },
        },
        { kind: 'setProps', props: { value: '#00ff00' } },
        {
          kind: 'raw',
          why: '同上：宿主写回后拇指才跟着走',
          run: ({ doc }) => expectAttr(sliderPart(doc, 'thumb', 0), 'aria-valuenow', '120'),
        },
      ],
    },
    {
      name: '屏幕取色：环境不提供 EyeDropper 时按钮自始就是禁用的',
      spec: { apg: APG_DIALOG },
      props: { defaultValue: '#3b82f6', defaultOpen: true },
      // jsdom 不提供 EyeDropper，走的是环境不支持那一路
      initial: {
        parts: {
          'eye-dropper-trigger': {
            'type': 'button',
            'aria-label': 'Pick a color from the screen',
            'disabled': '',
            'data-disabled': '',
          },
        },
      },
    },
    {
      // 影子只在本用例的 fixture 里出现：作者不写这个部件就不该有它，
      // 其余用例的 order / counts 因此一条都不用改
      name: '表单影子：给了 name 才带 name，值跟着改，禁用时不提交',
      spec: { apg: APG_DIALOG },
      fixture: withHiddenInput,
      props: { defaultValue: '#3b82f6', name: 'theme' },
      initial: {
        parts: {
          'hidden-input': { type: 'hidden', name: 'theme' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'value 只落 DOM property，进不了归一化快照',
          run: ({ doc }) => assertHiddenInput(doc, ['theme', '#3b82f6', false]),
        },
        {
          kind: 'setProps',
          props: { value: '#00ff00' },
        },
        {
          kind: 'raw',
          why: '同上：值跟着受控 prop 走',
          run: ({ doc }) => assertHiddenInput(doc, ['theme', '#00ff00', false]),
        },
        {
          kind: 'setProps',
          props: { disabled: true },
          expect: { parts: { 'hidden-input': { disabled: '' } } },
        },
        {
          kind: 'raw',
          why: '禁用的控件不该提交出值',
          run: ({ doc }) => assertHiddenInput(doc, ['theme', '#00ff00', true]),
        },
      ],
    },
    {
      name: '表单影子：没给 name 就不带 name，这份输入不参与提交',
      spec: { apg: APG_DIALOG },
      fixture: withHiddenInput,
      props: { defaultValue: '#3b82f6' },
      initial: {
        parts: {
          'hidden-input': { type: 'hidden', name: null },
        },
      },
    },
  ],
}
