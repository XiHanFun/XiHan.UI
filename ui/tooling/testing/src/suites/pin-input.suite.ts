import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { pinInputAnatomy, pinInputKeyboard } from '@xihan-ui/headless'

// 分格验证码不在 APG 的模式清单里；每格都是原生 text input，规范面落在文本输入框上。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox'
const SCOPE = '[data-scope="pin-input"]'
const LENGTH = 6

function boxes(doc: Document): HTMLInputElement[] {
  return [...doc.querySelectorAll<HTMLInputElement>(`${SCOPE}[data-part="input"]`)]
}

function boxAt(doc: Document, index: number): HTMLInputElement {
  const el = boxes(doc)[index]
  if (!el)
    throw new Error(`找不到第 ${index} 格`)
  return el
}

/**
 * 真实输入：先改框里的内容，再派 input 事件。`type` 步骤只发按键，落不到 value 上。
 *
 * 派完必须 flush：组件只会把**当前这一格**拨回权威值（imperative resync），
 * 其余格子要等宿主重渲才更新。不等就读，会看到"只有第一格填上了"的假象。
 */
async function typeInto(ctx: RawStepContext, index: number, text: string): Promise<void> {
  const el = boxAt(ctx.doc, index)
  el.focus()
  el.value = text
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await ctx.flush()
}

/** jsdom 没有 ClipboardEvent 构造器，自己补一份 clipboardData。 */
async function pasteInto(ctx: RawStepContext, index: number, text: string): Promise<Event> {
  const el = boxAt(ctx.doc, index)
  el.focus()
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  el.dispatchEvent(event)
  await ctx.flush()
  return event
}

function expectBoxes(doc: Document, want: readonly string[], why: string): void {
  const got = boxes(doc).map(b => b.value)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

function expectAttr(doc: Document, part: string, name: string, want: string | null, why: string): void {
  const el = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="${part}"]`)
  const got = el?.getAttribute(name) ?? null
  if (got !== want)
    throw new Error(`${why}：${part}.${name} 期望 ${JSON.stringify(want)}，实际 ${JSON.stringify(got)}`)
}

function expectHidden(doc: Document, want: string, why: string): void {
  const got = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)?.value ?? ''
  if (got !== want)
    throw new Error(`${why}：隐藏输入期望 "${want}"，实际 "${got}"`)
}

const box = (index: number): FixtureNode => ({ part: 'input', tag: 'input', attrs: { index: String(index) } })

export const pinInputSuite: ConformanceSuite = {
  component: 'pin-input',
  anatomy: pinInputAnatomy,
  keyboard: pinInputKeyboard,
  // 格数用默认的 6，fixture 就按 6 格铺；下标由作者在格子上声明，两个适配器读的是同一份声明
  fixture: {
    part: 'root',
    children: [
      // 标签定死成原生 label：for 恒写向首格，写在别的标签上点不动，两个适配器都得是它
      { part: 'label', tag: 'label', text: '验证码' },
      ...Array.from({ length: LENGTH }, (_, i) => box(i)),
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认：root 是 group 并由 label 命名，每格带 data-index，隐藏输入承载表单值',
      spec: { apg: APG },
      props: { name: 'code' },
      initial: {
        order: ['root', 'label', ...Array.from({ length: LENGTH }, (_, i) => `input[${i}]`), 'hidden-input'],
        counts: { input: LENGTH },
        parts: {
          'root': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            'data-complete': null,
            'data-disabled': null,
            'data-invalid': null,
          },
          // for 指向首格：点标题落到第一个待填的格子
          'label': { for: '@part(input[0])' },
          'input': Array.from({ length: LENGTH }, (_, i) => ({
            'data-index': String(i),
            'type': 'text',
            // 只收数字就只弹数字键盘
            'inputmode': 'numeric',
            'aria-invalid': 'false',
            'disabled': null,
            'data-focus': null,
          })),
          'hidden-input': { type: 'hidden', name: 'code' },
        },
      },
    },
    {
      name: '敲一个字符：值落进本格，焦点自动跳下一格，并对外报一次值变化',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到输入框的 value 上；这里要的是真实输入',
          run: async ctx => typeInto(ctx, 0, '1'),
          expect: {
            activeElement: { part: 'input[1]', exact: true },
            parts: { 'input[1]': { 'data-focus': '' }, 'input[0]': { 'data-focus': null } },
            events: [{ type: 'value-change', detail: { value: ['1', '', '', '', '', ''], valueAsString: '1' } }],
          },
        },
        {
          kind: 'raw',
          why: '格子的 value 是 property 不是属性，进不了归一化快照',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 1, '2')
            expectBoxes(doc, ['1', '2', '', '', '', ''], '连着敲两格')
          },
          expect: { activeElement: { part: 'input[2]', exact: true } },
        },
      ],
    },
    {
      name: '最后一格敲完：整组转 complete，隐藏输入拿到整串',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '逐格真实输入 + 隐藏输入的 value 是 property',
          run: async (ctx) => {
            const { doc } = ctx
            for (let i = 0; i < LENGTH; i++) await typeInto(ctx, i, String(i + 1))
            expectHidden(doc, '123456', '填满后隐藏输入应拿到整串')
          },
          expect: {
            parts: { root: { 'data-complete': '' } },
            // 不要求收工时焦点停在末格，不会自己跑掉
            activeElement: { part: `input[${LENGTH - 1}]`, exact: true },
          },
        },
      ],
    },
    {
      name: 'blurOnComplete：填满即把焦点撤走',
      spec: { apg: APG },
      props: { blurOnComplete: true },
      steps: [
        {
          kind: 'raw',
          why: '要连敲满六格才看得到收尾行为',
          run: async (ctx) => {
            for (let i = 0; i < LENGTH; i++) await typeInto(ctx, i, String(i + 1))
          },
          expect: {
            parts: { root: { 'data-complete': '' } },
            activeElement: null,
          },
        },
      ],
    },
    {
      name: 'type=numeric：字母被丢弃，既不进值也不留在框里',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          // 值没变宿主不会重渲，那个字符只能由 connect 自己拨回去
          why: '被丢弃的字符留没留在框里，只能直接读 value property',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 0, 'a')
            expectBoxes(doc, ['', '', '', '', '', ''], '字母不该进 numeric 的值')
          },
          expect: {
            // 什么都没输进去，焦点就不该往下走
            activeElement: { part: 'input[0]', exact: true },
            events: [],
          },
        },
      ],
    },
    {
      name: 'type=alphabetic：数字被丢弃，字母照收',
      spec: { apg: APG },
      props: { type: 'alphabetic' },
      initial: {
        // 收字母就该弹全键盘
        parts: { input: [{ inputmode: 'text' }] },
      },
      steps: [
        {
          kind: 'raw',
          why: '过滤结果只能直接读 value property',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 0, '7')
            expectBoxes(doc, ['', '', '', '', '', ''], '数字不该进 alphabetic 的值')
            await typeInto(ctx, 0, 'x')
            expectBoxes(doc, ['x', '', '', '', '', ''], '字母应当收下')
          },
        },
      ],
    },
    {
      name: '粘贴整串：按格分发并拦下浏览器默认行为，超长截断',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 ClipboardEvent 构造器，且分发结果只能直接读 value property',
          run: async (ctx) => {
            const { doc } = ctx
            const event = await pasteInto(ctx, 0, '123456789')
            if (!event.defaultPrevented)
              throw new Error('粘贴必须拦下默认行为，否则整串会被塞进一格')
            expectBoxes(doc, ['1', '2', '3', '4', '5', '6'], '整串按格铺开，超出末格的截断')
          },
          expect: {
            parts: { root: { 'data-complete': '' } },
            activeElement: { part: `input[${LENGTH - 1}]`, exact: true },
          },
        },
      ],
    },
    {
      name: '粘贴从当前格起铺，前面已填的格子不动',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '同上：粘贴事件要手工构造，结果读 value property',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 0, '9')
            await pasteInto(ctx, 2, '345')
            expectBoxes(doc, ['9', '', '3', '4', '5', ''], '从落点起铺，落点之前的格子不受影响')
          },
          expect: { activeElement: { part: 'input[5]', exact: true } },
        },
      ],
    },
    {
      name: '一次塞进多个字符要拆开分发，而不是把整串留在一格里',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          // 系统自动填入一次性验证码时就是把整串塞进当前这一格
          why: '一格里的多字符只能靠直接写 value + 派 input 复现',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 1, '234')
            expectBoxes(doc, ['', '2', '3', '4', '', ''], '多字符按格拆开')
          },
          expect: { activeElement: { part: 'input[4]', exact: true } },
        },
      ],
    },
    {
      name: 'backspace：本格有值清本格；本格为空则退回上一格并清掉它',
      spec: { apg: APG },
      covers: ['pin-input.kbd.backspace'],
      props: { defaultValue: ['1', '2', '3', '', '', ''] },
      steps: [
        { kind: 'focus', part: 'input[2]' },
        {
          kind: 'key',
          key: 'Backspace',
          expect: { activeElement: { part: 'input[2]', exact: true } },
        },
        {
          kind: 'raw',
          why: '"清掉的是哪一格"只能直接比对 value property',
          run: ({ doc }) => expectBoxes(doc, ['1', '2', '', '', '', ''], '有值的格上退格清本格、焦点不动'),
        },
        {
          kind: 'key',
          key: 'Backspace',
          expect: { activeElement: { part: 'input[1]', exact: true } },
        },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => expectBoxes(doc, ['1', '', '', '', '', ''], '空格上退格应退回上一格并清掉它'),
        },
      ],
    },
    {
      name: '首格为空时 Backspace 无处可退：值不动、焦点不动',
      spec: { apg: APG },
      covers: ['pin-input.kbd.backspace'],
      props: { defaultValue: ['', '2', '', '', '', ''] },
      steps: [
        { kind: 'focus', part: 'input[0]' },
        {
          kind: 'key',
          key: 'Backspace',
          expect: { activeElement: { part: 'input[0]', exact: true }, events: [] },
        },
        {
          kind: 'raw',
          why: '"什么都没发生"只能直接比对值',
          run: ({ doc }) => expectBoxes(doc, ['', '2', '', '', '', ''], '首格退格不该动别的格子'),
        },
      ],
    },
    {
      name: 'delete 清掉本格，焦点不动',
      spec: { apg: APG },
      covers: ['pin-input.kbd.delete'],
      props: { defaultValue: ['1', '2', '3', '', '', ''] },
      steps: [
        { kind: 'focus', part: 'input[0]' },
        {
          kind: 'key',
          key: 'Delete',
          expect: { activeElement: { part: 'input[0]', exact: true } },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectBoxes(doc, ['', '2', '3', '', '', ''], 'Delete 只清本格'),
        },
      ],
    },
    {
      name: 'arrowLeft / ArrowRight 移格，两端停住不回绕',
      spec: { apg: APG },
      covers: ['pin-input.kbd.next', 'pin-input.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'input[0]' },
        // 首格再往左没有格可去，不回绕到末格
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'input[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'input[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', repeat: 4, expect: { activeElement: { part: 'input[5]', exact: true } } },
        // 末格再往右同样停住
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'input[5]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'input[4]', exact: true } } },
      ],
    },
    {
      name: 'home / End 到首末格',
      spec: { apg: APG },
      covers: ['pin-input.kbd.first', 'pin-input.kbd.last'],
      steps: [
        { kind: 'focus', part: 'input[2]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'input[5]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'input[0]', exact: true } } },
      ],
    },
    {
      name: '上下键不归移格管：不拦、不改值、焦点不动',
      spec: { apg: APG },
      props: { defaultValue: ['1', '2', '3', '', '', ''] },
      steps: [
        { kind: 'focus', part: 'input[1]' },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'input[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'input[1]', exact: true } } },
        {
          kind: 'raw',
          why: '"值没动"只能直接比对',
          run: ({ doc }) => expectBoxes(doc, ['1', '2', '3', '', '', ''], '上下键不该改值'),
        },
      ],
    },
    {
      name: 'mask=true 转 password；otp=true 补 one-time-code',
      spec: { apg: APG },
      props: { mask: true, otp: true },
      initial: {
        parts: { input: [{ type: 'password' }] },
      },
      steps: [
        {
          kind: 'raw',
          // autocomplete 不在快照的采集清单里（既非 aria- 也非 data-），只能直接读属性
          why: 'autocomplete 不进归一化快照，但它是系统自动填入验证码的唯一钩子',
          run: ({ doc }) => expectAttr(doc, 'input', 'autocomplete', 'one-time-code', 'otp 开启时'),
        },
      ],
    },
    {
      name: '不是一次性验证码时明确关掉自动填充',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: 'autocomplete 不进归一化快照',
          run: ({ doc }) => expectAttr(doc, 'input', 'autocomplete', 'off', 'otp 关闭时'),
        },
      ],
    },
    {
      name: 'placeholder 落到每一格上',
      spec: { apg: APG },
      props: { placeholder: '·' },
      steps: [
        {
          kind: 'raw',
          why: 'placeholder 不进归一化快照',
          run: ({ doc }) => expectAttr(doc, 'input', 'placeholder', '·', '给了 placeholder 时'),
        },
      ],
    },
    {
      name: 'invalid：每格与 root 一并标注',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          'root': { 'data-invalid': '' },
          'input[0]': { 'aria-invalid': 'true', 'data-invalid': '' },
        },
      },
    },
    {
      name: 'disabled：每格带原生 disabled，隐藏输入不参与提交，值推不动',
      spec: { apg: APG },
      props: { defaultValue: ['1', '2', '', '', '', ''], disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input[0]': { 'disabled': '', 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 焦点落不到禁用的输入框上，必须直接往节点上派事件才碰得到守卫
          why: '禁用控件上 focus 被浏览器短路，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            const { doc } = ctx
            const first = boxAt(doc, 0)
            first.value = '9'
            first.dispatchEvent(new Event('input', { bubbles: true }))
            first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
            first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))
            await pasteInto(ctx, 1, '345')
            expectHidden(doc, '12', 'disabled 下值不该动')
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { apg: APG },
      props: { value: ['1', '2', '', '', '', ''] },
      steps: [
        {
          kind: 'raw',
          why: '受控下"界面没有自作主张"正是要验的东西，而框里的值是 property',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, 2, '3')
            expectBoxes(doc, ['1', '2', '', '', '', ''], '受控且宿主未写回时值不该变')
          },
          expect: {
            events: [{ type: 'value-change', detail: { value: ['1', '2', '3', '', '', ''], valueAsString: '123' } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: ['9', '8', '7', '6', '5', '4'] },
          expect: { parts: { root: { 'data-complete': '' } } },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectHidden(doc, '987654', '宿主写回后界面应跟着走'),
        },
      ],
    },
  ],
}
