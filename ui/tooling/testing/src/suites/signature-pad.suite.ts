import type { ConformanceSuite, StepWithExpect } from '../conformance/types'
import { signaturePadAnatomy, signaturePadKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

// 签名板没有对应的 APG 模式：画布是一张图、不接键盘，组件里唯一的键盘落点是清空按钮。
// 出处取 APG 的按钮模式，可达性的正文写在 doc.md 的无障碍段。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'
const NAMING = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#naming-form-controls'

const SCOPE = '[data-scope="signature-pad"]'

function findPart(doc: Document, name: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到 ${name} 部件`)
  return el
}

/**
 * jsdom 不做布局，画布矩形恒是全 0，屏幕坐标换算不成画布坐标。
 * 这里把矩形桩在真实节点上（原点 0,0、300×120），对两个适配器一视同仁。
 */
const layoutStep: StepWithExpect = {
  kind: 'raw',
  why: 'jsdom 不做布局，画布矩形恒是全 0，落笔坐标换算不出来，也就量不到导出 SVG 的视窗',
  run: ({ doc }) => {
    const control = findPart(doc, 'control')
    control.getBoundingClientRect = (): DOMRect => ({
      x: 0,
      y: 0,
      width: 300,
      height: 120,
      top: 0,
      left: 0,
      right: 300,
      bottom: 120,
      toJSON: () => ({}),
    }) as DOMRect
  },
}

/** 在画布上按下。指针事件带不进声明式步骤，click 步骤也带不了坐标。 */
function penDown(x: number, y: number, expect?: StepWithExpect['expect'], pointerId = 1): StepWithExpect {
  return {
    kind: 'raw',
    why: '落笔认的是 pointerdown 的坐标，click 步骤带不了坐标',
    run: ({ doc }) => {
      findPart(doc, 'control').dispatchEvent(
        new PointerEvent('pointerdown', { button: 0, pointerId, clientX: x, clientY: y, bubbles: true, cancelable: true }),
      )
    },
    expect,
  }
}

/** 落笔途中的指针事件挂在文档上：手可以划出画布甚至划出窗口。 */
function penMove(x: number, y: number, pointerId = 1): StepWithExpect {
  return {
    kind: 'raw',
    why: '跟手的指针事件挂在文档上，声明式步骤够不着',
    run: ({ doc }) => {
      doc.dispatchEvent(new PointerEvent('pointermove', { pointerId, clientX: x, clientY: y, bubbles: true }))
    },
  }
}

function penUp(expect?: StepWithExpect['expect'], pointerId = 1): StepWithExpect {
  return {
    kind: 'raw',
    why: '抬笔同样只能直接派事件',
    run: ({ doc }) => {
      doc.dispatchEvent(new PointerEvent('pointerup', { pointerId, bubbles: true }))
    },
    expect,
  }
}

/** 笔迹落在 segment 的 d 上，而 d 不进归一化快照，只能直接读节点。 */
function assertInk(drawn: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: 'd 是几何属性，不在快照采集的属性集里',
    run: ({ doc }) => {
      const d = findPart(doc, 'segment').getAttribute('d') ?? ''
      if (drawn && d === '')
        throw new Error('画了一笔，segment 的 d 却还是空的——笔迹没落到路径上')
      if (!drawn && d !== '')
        throw new Error(`本不该有笔迹，segment 的 d 却是 ${d}`)
    },
  }
}

/** 笔迹里有几个顶点，只有 d 串看得出来。 */
function assertVertices(count: number, message: string): StepWithExpect {
  return {
    kind: 'raw',
    why: 'd 是几何属性，不在快照采集的属性集里',
    run: ({ doc }) => {
      const d = findPart(doc, 'segment').getAttribute('d') ?? ''
      if ((d.match(/L/g) ?? []).length !== count)
        throw new Error(`${message}，d 是 ${d}`)
    },
  }
}

/** 状态那句话是节点文本，快照只采属性。 */
function assertStatusText(text: string): StepWithExpect {
  return {
    kind: 'raw',
    why: '文本内容不在归一化快照采集的属性集里',
    run: ({ doc }) => {
      const actual = (findPart(doc, 'status').textContent ?? '').trim()
      if (actual !== text)
        throw new Error(`状态区该念「${text}」，实际是 ${JSON.stringify(actual)}`)
    },
  }
}

/** 表单影子提交的是一份独立 SVG，值只落在 DOM property 上，进不了快照。 */
function assertSubmitted(match: (value: string) => boolean, message: string): StepWithExpect {
  return {
    kind: 'raw',
    why: '表单影子的 value 只落在 DOM property 上，归一化快照不采集它',
    run: ({ doc }) => {
      const value = (findPart(doc, 'hidden-input') as HTMLInputElement).value
      if (!match(value))
        throw new Error(`${message}，实际是 ${JSON.stringify(value)}`)
    },
  }
}

export const signaturePadSuite: ConformanceSuite = {
  component: 'signature-pad',
  anatomy: signaturePadAnatomy,
  keyboard: signaturePadKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'span', text: '手写签名' },
      {
        part: 'control',
        tag: 'svg',
        children: [
          { part: 'guide', tag: 'line' },
          { part: 'segment', tag: 'path' },
        ],
      },
      { part: 'clear-trigger', tag: 'button', text: '清空' },
      { part: 'status', tag: 'span' },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认：画布报 role=img 并从标题取名，空画布带 data-empty，谁都不占 Tab 位',
      spec: { apg: NAMING },
      initial: {
        order: ['root', 'label', 'control', 'guide', 'segment', 'clear-trigger', 'status', 'hidden-input'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'guide': 1, 'segment': 1, 'clear-trigger': 1, 'status': 1, 'hidden-input': 1 },
        parts: {
          'root': {
            'data-empty': '',
            'data-drawing': null,
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { id: '@self' },
          'control': {
            'role': 'img',
            'aria-labelledby': '@part(label)',
            'aria-label': 'Signature',
            'data-empty': '',
            'data-drawing': null,
            // 画布不接键盘，绝不能进 Tab 序列
            'tabindex': null,
          },
          // 基准线只是画面
          'guide': { 'aria-hidden': 'true' },
          'segment': { 'data-empty': '' },
          'clear-trigger': {
            'type': 'button',
            'aria-label': 'Clear signature',
            // 空画布时按钮照常可按：收起或禁用它会让焦点掉回 body
            'disabled': null,
            'data-disabled': null,
            'data-empty': '',
          },
          // 画布是 role=img、名字恒定，签没签只能从这块活区域听出来
          'status': {
            'role': 'status',
            'aria-live': 'polite',
            'data-empty': '',
          },
          'hidden-input': {
            'name': null,
            'tabindex': '-1',
            'aria-hidden': 'true',
            'aria-invalid': 'false',
          },
        },
        activeElement: null,
      },
    },
    {
      name: '落笔：按下即进 drawing，跟手的指针挂在文档上，抬笔收笔并留下笔迹',
      spec: { apg: APG },
      steps: [
        layoutStep,
        assertInk(false),
        penDown(20, 20, {
          parts: {
            root: { 'data-drawing': '' },
            control: { 'data-drawing': '' },
          },
        }),
        penMove(60, 40),
        penMove(120, 30),
        penUp({
          parts: {
            'root': { 'data-drawing': null, 'data-empty': null },
            'control': { 'data-drawing': null, 'data-empty': null },
            'segment': { 'data-empty': null },
            'clear-trigger': { 'data-empty': null },
          },
        }),
        assertInk(true),
      ],
    },
    {
      name: '抬笔后再动指针不该继续画：文档上的监听器要真的摘干净',
      spec: { apg: APG },
      steps: [
        layoutStep,
        penDown(20, 20),
        penMove(60, 40),
        penUp(),
        penMove(200, 100),
        // 两个点的轮廓：左右各两个顶点，两端各一个笔帽
        assertVertices(2, '抬笔后指针还在往里加点'),
      ],
    },
    {
      name: '手掌与第二根手指不该被续进这一笔：只认起笔那根指针',
      spec: { apg: APG },
      steps: [
        layoutStep,
        penDown(20, 20, undefined, 1),
        penMove(60, 40, 1),
        // 另一根指针在屏幕别处滑动、随后抬起：既不该加点，也不该把这一笔提前收掉
        penMove(280, 110, 2),
        penUp({ parts: { root: { 'data-drawing': '' } } }, 2),
        assertVertices(2, '别的指针的移动被续进了当前这一笔'),
        // 自己那根指针抬起才收笔
        penUp({ parts: { root: { 'data-drawing': null } } }, 1),
      ],
    },
    {
      name: '画布量到尺寸后自报 viewBox：容器变宽变窄时笔迹跟着缩放而不是错位',
      spec: { apg: APG },
      steps: [
        layoutStep,
        penDown(20, 20),
        penMove(60, 40),
        penUp(),
        {
          kind: 'raw',
          why: 'viewBox 是几何属性，不在快照采集的属性集里',
          run: ({ doc }) => {
            const box = findPart(doc, 'control').getAttribute('viewBox')
            if (box !== '0 0 300 120')
              throw new Error(`画布该按量到的尺寸写视窗，实际是 ${JSON.stringify(box)}`)
          },
        },
      ],
    },
    {
      name: '状态区把签没签念出来：画布是 role=img，名字恒定，光听名字分不出',
      spec: { apg: NAMING },
      steps: [
        layoutStep,
        assertStatusText('No signature yet'),
        penDown(20, 20),
        penMove(60, 40),
        penUp({
          parts: {
            status: { 'data-empty': null },
          },
        }),
        assertStatusText('Signed'),
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              status: { 'data-empty': '' },
            },
          },
        },
        assertStatusText('No signature yet'),
      ],
    },
    {
      name: '清空：按钮把画布抹回空，表单影子跟着交空串',
      spec: { apg: APG },
      steps: [
        layoutStep,
        penDown(20, 20),
        penMove(60, 40),
        penUp(),
        assertSubmitted(v => v.includes('viewBox="0 0 300 120"'), '表单影子该提交一份带视窗的 SVG'),
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              root: { 'data-empty': '' },
              control: { 'data-empty': '' },
            },
          },
        },
        assertInk(false),
        assertSubmitted(v => v === '', '清空之后表单影子该交空串'),
      ],
    },
    {
      name: '禁用：一笔都落不下，清空按钮走原生 disabled',
      spec: { apg: APG },
      props: { disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'data-disabled': '' },
          'clear-trigger': { 'disabled': '', 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        layoutStep,
        penDown(20, 20, {
          parts: {
            root: { 'data-drawing': null, 'data-empty': '' },
          },
        }),
        assertInk(false),
      ],
    },
    {
      name: '只读：签名照常显示但改不动，清空按钮同样按不动',
      spec: { apg: APG },
      props: { readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          'control': { 'data-readonly': '' },
          'clear-trigger': { 'disabled': '', 'data-disabled': '' },
          // 只读随 prop 走，恒真会让 required 不生效
          'hidden-input': { readonly: '', disabled: null },
        },
      },
      steps: [
        layoutStep,
        penDown(20, 20),
        assertInk(false),
      ],
    },
    {
      name: 'Enter / Space 靠原生按钮的激活行为，清空按钮必须是 <button type="button">',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['signature-pad.kbd.clear'],
      steps: [nativeActivation('signature-pad', 'clear-trigger')],
    },
    {
      name: '表单参与：name 只落在影子输入上，invalid 与 required 同样落在它身上',
      spec: { apg: HTML_SPEC },
      props: { name: 'sign', required: true, invalid: true },
      initial: {
        parts: {
          'root': { 'data-invalid': '' },
          'control': { 'data-invalid': '' },
          'hidden-input': {
            'name': 'sign',
            'aria-invalid': 'true',
          },
        },
      },
      steps: [
        assertSubmitted(v => v === '', '还没签名时该交空串，required 才拦得住提交'),
        {
          kind: 'raw',
          why: 'required 不在归一化快照采集的属性集里，只能直接读节点',
          run: ({ doc }) => {
            if (!findPart(doc, 'hidden-input').hasAttribute('required'))
              throw new Error('表单影子没带 required，空签名照样提交得出去')
          },
        },
      ],
    },
    {
      name: '文案可覆盖：画布与清空按钮的读屏名字都走 translations',
      spec: { apg: NAMING },
      props: { translations: { label: '手写签名', clearTrigger: '清空签名' } },
      initial: {
        parts: {
          'control': { 'aria-label': '手写签名' },
          'clear-trigger': { 'aria-label': '清空签名' },
        },
      },
    },
  ],
}
