import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { clipboardAnatomy, clipboardKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'

const VALUE = 'xh-token-42'

/**
 * 两个指示器都常挂：不写 copied 的是平时那侧（复制图标），写了的是成功那侧（对钩）。
 * 声明写成属性而不是文本，两个适配器读的是同一件事——Vue 当 prop 收，WC 直接读属性。
 */
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'label', text: '接口密钥' },
    {
      part: 'control',
      children: [
        { part: 'input', tag: 'input' },
        {
          part: 'copy-trigger',
          tag: 'button',
          children: [
            { part: 'indicator', tag: 'span', text: '复制' },
            { part: 'indicator', tag: 'span', attrs: { copied: '' }, text: '已复制' },
          ],
        },
      ],
    },
  ],
}

/**
 * 在途写入的兑现开关。
 *
 * jsdom 没有 navigator.clipboard，成功路径本来就得自己把接口装上；
 * 装的这个刻意不自动兑现——由用例决定什么时候成功、什么时候失败，
 * 每一帧才踩得准：点下去那一帧必然停在 copying，兑现之后那一帧才是结果。
 */
let settleWrite: ((ok: boolean) => void) | null = null
/** 装上接口之后累计发出过几次写请求。"连点只写一次"这条只有靠计数才验得到。 */
let writeCalls = 0

function navigatorOf(doc: Document): Navigator {
  const win = doc.defaultView
  if (!win)
    throw new Error('fixture 文档没有 window')
  return win.navigator
}

/** 装一个手动兑现的剪贴板接口。每条用例都自己装一遍，不依赖上一条有没有拆干净。 */
function installClipboard(): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    settleWrite = null
    writeCalls = 0
    Object.defineProperty(navigatorOf(doc), 'clipboard', {
      configurable: true,
      value: {
        writeText: () => new Promise<void>((resolve, reject) => {
          writeCalls += 1
          settleWrite = ok => (ok ? resolve() : reject(new Error('[test] 权限被拒')))
        }),
      },
    })
  }
}

function finishWrite(ok: boolean): (ctx: RawStepContext) => Promise<void> {
  return async ({ flush }) => {
    if (!settleWrite)
      throw new Error('此刻并没有在途的写入请求：点击那一步没有走到 copying')
    settleWrite(ok)
    settleWrite = null
    await flush()
  }
}

function assertWriteCalls(expected: number): (ctx: RawStepContext) => void {
  return () => {
    if (writeCalls !== expected)
      throw new Error(`写请求次数期望 ${expected}，实际 ${writeCalls}`)
  }
}

function uninstallClipboard(): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    settleWrite = null
    Reflect.deleteProperty(navigatorOf(doc), 'clipboard')
  }
}

export const clipboardSuite: ConformanceSuite = {
  component: 'clipboard',
  anatomy: clipboardAnatomy,
  keyboard: clipboardKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：input 只读且被 label 认领，复制钮是原生按钮，成功侧指示器收起',
      spec: { apg: SPEC },
      props: { value: VALUE },
      initial: {
        order: ['root', 'label', 'control', 'input', 'copy-trigger', 'indicator[0]', 'indicator[1]'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'input': 1, 'copy-trigger': 1, 'indicator': 2 },
        parts: {
          'root': { 'data-state': 'idle', 'data-copied': null, 'data-variant': 'subtle' },
          'label': { 'id': '@self', 'for': '@part(input)', 'data-state': 'idle' },
          'control': { 'data-state': 'idle' },
          'input': {
            'id': '@self',
            'type': 'text',
            // 只读而不是禁用：禁用框不可聚焦也选不中，键盘用户的 Ctrl/Cmd+C 那条路会断
            'readonly': '',
            'disabled': null,
            'aria-labelledby': '@part(label)',
          },
          'copy-trigger': {
            'type': 'button',
            'data-state': 'idle',
            'data-copied': null,
            'data-pressed': null,
            // 定尺的独立动作按钮：形态缺省显式落 subtle（缺省中性，solid 才品牌实心）
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'subtle',
          },
          'indicator': [
            // 非当前侧只从视觉与无障碍树收起（aria-hidden），不写 hidden：保留宽度避免切换抖动
            { 'data-copied': null, 'aria-hidden': null },
            { 'data-copied': '', 'aria-hidden': 'true' },
          ],
        },
      },
      steps: [nativeActivation('clipboard', 'copy-trigger')],
    },
    {
      name: 'Space / Enter 按住与触屏按下：copy-trigger 投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['clipboard.kbd.press'],
      props: { value: VALUE },
      steps: [heldPress('clipboard', 'copy-trigger')],
    },
    {
      name: 'disabled：按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { value: VALUE, disabled: true },
      steps: [heldPressIgnored('clipboard', 'copy-trigger', '禁用时不接受按压')],
    },
    {
      name: 'variant 落到根与复制钮：根 data-variant，钮 data-xh-action-variant 同源',
      spec: { adr: 'action-control-family' },
      props: { value: VALUE, variant: 'solid' },
      initial: {
        parts: { 'root': { 'data-variant': 'solid' }, 'copy-trigger': { 'data-xh-action-variant': 'solid' } },
      },
    },
    {
      name: '点复制：写入兑现前停在 copying，兑现后才落 copied 并换边',
      spec: { zag: 'clipboard.machine#writeValue' },
      props: { value: VALUE },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 navigator.clipboard，成功路径必须自己把接口装上',
          run: installClipboard(),
        },
        {
          kind: 'click',
          part: 'copy-trigger',
          expect: {
            // 写入还在路上时不先亮对钩
            parts: {
              'root': { 'data-state': 'copying', 'data-copied': null },
              'copy-trigger': { 'data-state': 'copying' },
              'indicator': [{ 'aria-hidden': null }, { 'aria-hidden': 'true' }],
            },
          },
        },
        {
          kind: 'raw',
          why: '写入兑现由用例说了算，这样点击那一帧与兑现那一帧才分得开',
          run: finishWrite(true),
          expect: {
            parts: {
              'root': { 'data-state': 'copied', 'data-copied': '' },
              'copy-trigger': { 'data-state': 'copied', 'data-copied': '' },
              // 两个指示器都还在，只是换了谁露面
              'indicator': [{ 'aria-hidden': 'true' }, { 'data-copied': '', 'aria-hidden': null }],
            },
            counts: { indicator: 2 },
          },
        },
        {
          kind: 'raw',
          why: '接口是本用例装上去的，装了就得拆，别漏给后面的用例',
          run: uninstallClipboard(),
        },
      ],
    },
    {
      name: '写入失败：回 idle，界面上不留"已复制"的假象',
      spec: { zag: 'clipboard.machine#copying' },
      props: { value: VALUE },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 navigator.clipboard，失败路径同样要自己造现场',
          run: installClipboard(),
        },
        { kind: 'click', part: 'copy-trigger' },
        {
          kind: 'raw',
          why: '让在途的写入以拒绝收场，复现无权限 / 非安全上下文',
          run: finishWrite(false),
          expect: {
            parts: {
              'root': { 'data-state': 'idle', 'data-copied': null },
              'copy-trigger': { 'data-state': 'idle', 'data-copied': null },
              // 成功侧仍旧收着：没成功就不该露对钩
              'indicator': [{ 'aria-hidden': null }, { 'aria-hidden': 'true' }],
            },
          },
        },
        {
          kind: 'raw',
          why: '接口是本用例装上去的，装了就得拆',
          run: uninstallClipboard(),
        },
      ],
    },
    {
      name: '停留窗口到点自动回 idle，指示器换回平时那侧',
      spec: { zag: 'clipboard.machine#trackTimeout' },
      props: { value: VALUE, timeout: 100 },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 navigator.clipboard，先把接口装上',
          run: installClipboard(),
        },
        { kind: 'click', part: 'copy-trigger' },
        {
          kind: 'raw',
          why: '兑现写入，进入停留窗口',
          run: finishWrite(true),
          expect: {
            parts: { root: { 'data-state': 'copied' } },
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'idle' } },
          expect: {
            parts: {
              root: { 'data-state': 'idle', 'data-copied': null },
              indicator: [{ 'aria-hidden': null }, { 'aria-hidden': 'true' }],
            },
          },
        },
        {
          kind: 'raw',
          why: '接口是本用例装上去的，装了就得拆',
          run: uninstallClipboard(),
        },
      ],
    },
    {
      name: '写入在途时再点：不发第二次写请求，也不改状态',
      spec: { zag: 'clipboard.machine#copying' },
      props: { value: VALUE },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 navigator.clipboard，先把接口装上',
          run: installClipboard(),
        },
        { kind: 'click', part: 'copy-trigger' },
        {
          kind: 'click',
          part: 'copy-trigger',
          expect: {
            parts: { root: { 'data-state': 'copying' } },
          },
        },
        {
          kind: 'raw',
          why: '"只写了一次"是跨节点的计数，属性期望表达不了：状态停在 copying 并不能证明没多发一次请求',
          run: assertWriteCalls(1),
        },
        {
          kind: 'raw',
          why: '兑现这唯一一次在途请求，确认这一路仍能正常走完',
          run: finishWrite(true),
          expect: {
            parts: { root: { 'data-state': 'copied' } },
          },
        },
        {
          kind: 'raw',
          why: '接口是本用例装上去的，装了就得拆',
          run: uninstallClipboard(),
        },
      ],
    },
  ],
}
