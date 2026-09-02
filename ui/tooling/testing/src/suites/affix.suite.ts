import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { affixAnatomy, affixKeyboard } from '@xihan-ui/headless'

// 吸附是布局行为，APG 没有与之对应的交互模式；判据锁的是「越没越过判定线」与「钉住后落位落在哪里」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [{ part: 'content', text: '目录' }],
}

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="affix"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

/** 一帧几何：占位盒的矩形与可视区的块轴尺寸。 */
interface Frame {
  top: number
  height: number
  left: number
  width: number
  /** 可视区块轴尺寸；贴上边的判据用不到它，只有贴下边才要。 */
  viewport?: number
}

/**
 * 摆好这一帧的几何再逼观察器重算一次。
 *
 * 无布局环境量什么都是 0，只能把三处几何原地伪造出来：占位盒的矩形、可视区的块轴尺寸、
 * 以及整页滚动量——最后这个必须真的变，观察器按「量到的值与上一次不同」才回调。
 * 派完 scroll、等 DOM 落定之后就把伪造撤掉，几何不留给下一个用例。
 */
function frame(f: Frame, scrollTop: number): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    const root = partEl(doc, 'root')
    const rect = {
      top: f.top,
      bottom: f.top + f.height,
      left: f.left,
      right: f.left + f.width,
      width: f.width,
      height: f.height,
      x: f.left,
      y: f.top,
      toJSON: () => ({}),
    }
    Object.defineProperty(root, 'getBoundingClientRect', { configurable: true, value: () => rect })
    Object.defineProperty(doc.documentElement, 'clientHeight', { configurable: true, value: f.viewport ?? 0 })
    Object.defineProperty(doc.documentElement, 'scrollTop', { configurable: true, value: scrollTop })
    doc.defaultView?.dispatchEvent(new Event('scroll'))
    await flush()
    Reflect.deleteProperty(root, 'getBoundingClientRect')
    Reflect.deleteProperty(doc.documentElement, 'clientHeight')
    Reflect.deleteProperty(doc.documentElement, 'scrollTop')
  }
}

/** 内联落位不进归一化快照，要验只能直接读节点。空串表示这一帧没写。 */
function assertInline(expected: Record<string, string>): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const style = (part: string): CSSStyleDeclaration => partEl(doc, part).style
    const actual: Record<string, string> = {
      'root.blockSize': style('root').blockSize,
      'content.top': style('content').top,
      'content.bottom': style('content').bottom,
      'content.left': style('content').left,
      'content.width': style('content').width,
    }
    for (const [key, want] of Object.entries(expected)) {
      if (actual[key] !== want)
        throw new Error(`${key} 期望 ${want || '(空)'}，实际 ${actual[key] || '(空)'}`)
    }
  }
}

/** 走一帧几何并断言吸没吸住。 */
function step(f: Frame, scrollTop: number, affixed: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '判定线要读实测矩形，无布局环境量什么都是 0，只能把这一帧的几何原地伪造出来',
    run: frame(f, scrollTop),
    expect: { parts: { content: { 'data-fixed': affixed ? '' : null } } },
  }
}

export const affixSuite: ConformanceSuite = {
  component: 'affix',
  anatomy: affixAnatomy,
  keyboard: affixKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '两个部件各一份，占位盒在外、内容在内；两处都不改语义',
      spec: { apg: APG },
      initial: {
        order: ['root', 'content'],
        counts: { root: 1, content: 1 },
        parts: {
          // 吸附只挪内容的落位，不是地标、也不接收焦点：角色与 Tab 序列一律不碰
          root: { role: null, tabindex: null },
          content: { role: null, tabindex: null },
        },
        activeElement: null,
      },
    },
    {
      name: '判定线之下不吸住：不写 data-fixed，落位与占位高度一个都不留',
      spec: { apg: APG },
      steps: [
        step({ top: 320, height: 50, left: 12, width: 200 }, 40, false),
        {
          kind: 'raw',
          why: '内联落位不进归一化快照',
          run: assertInline({
            'root.blockSize': '',
            'content.top': '',
            'content.bottom': '',
            'content.left': '',
            'content.width': '',
          }),
        },
      ],
    },
    {
      name: '越过判定线就钉住：content 报 data-fixed，占位盒接手冻结的高度',
      spec: { apg: APG },
      steps: [
        step({ top: 320, height: 50, left: 12, width: 200 }, 40, false),
        step({ top: 0, height: 50, left: 12, width: 200 }, 400, true),
        {
          kind: 'raw',
          why: '内联落位不进归一化快照',
          run: assertInline({
            // 占位盒撑住脱流前那块空间，页面不跳
            'root.blockSize': '50px',
            'content.top': '0px',
            'content.left': '12px',
            'content.width': '200px',
            // 贴的是上边，下边那一路一个数都不写
            'content.bottom': '',
          }),
        },
      ],
    },
    {
      name: 'offsetTop 把判定线往下挪，钉住后也让出同样的高度',
      spec: { apg: APG },
      props: { offsetTop: 64 },
      steps: [
        // 顶边还在 64 之下，没到线
        step({ top: 100, height: 50, left: 12, width: 200 }, 40, false),
        step({ top: 40, height: 50, left: 12, width: 200 }, 400, true),
        {
          kind: 'raw',
          why: '内联落位不进归一化快照',
          run: assertInline({ 'content.top': '64px', 'root.blockSize': '50px' }),
        },
      ],
    },
    {
      name: 'offsetBottom 改贴下边：判定线换成可视区的下边，落位也写在下边',
      spec: { apg: APG },
      props: { offsetBottom: 16 },
      steps: [
        // 底边还在可视区内，没到线
        step({ top: 100, height: 50, left: 12, width: 200, viewport: 600 }, 40, false),
        step({ top: 650, height: 50, left: 12, width: 200, viewport: 600 }, 400, true),
        {
          kind: 'raw',
          why: '内联落位不进归一化快照',
          run: assertInline({
            'content.bottom': '16px',
            'content.left': '12px',
            'content.width': '200px',
            // 贴的是下边，上边那一路一个数都不写
            'content.top': '',
          }),
        },
      ],
    },
    {
      name: '松开后落位全部清掉：残留一个数就会把内容钉在错的地方',
      spec: { apg: APG },
      steps: [
        step({ top: 0, height: 50, left: 12, width: 200 }, 400, true),
        step({ top: 320, height: 50, left: 12, width: 200 }, 40, false),
        {
          kind: 'raw',
          why: '内联落位不进归一化快照',
          run: assertInline({
            'root.blockSize': '',
            'content.top': '',
            'content.bottom': '',
            'content.left': '',
            'content.width': '',
          }),
        },
      ],
    },
  ],
}
