import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { fileUploadAnatomy, fileUploadKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

/** 构造一个文件：name/type/size 是校验与展示只关心的三项。 */
function fileOf(name: string, type: string, size: number): File {
  return new File(['x'.repeat(size)], name, { type })
}

// 一张图（有 MIME）、一份文本（系统给不出 MIME，走扩展名那条路）。
// 大小刻意跨过 1KB 那道坎：一个报 KB、一个报 B，格式化那一路才有得看。
const PHOTO = fileOf('photo.png', 'image/png', 2048)
const NOTES = fileOf('notes.txt', '', 12)
const REPORT = fileOf('report.pdf', 'application/pdf', 30)

function partEl(doc: Document, part: string, index = 0): HTMLElement {
  const els = doc.querySelectorAll<HTMLElement>(`[data-scope="file-upload"][data-part="${part}"]`)
  const el = els[index]
  if (!el)
    throw new Error(`fixture 里没有第 ${index} 个 ${part} 部件`)
  return el
}

/**
 * 把系统文件选择框换成"立刻选中这几个文件"的桩。
 * 无头 DOM 里 input.click() 不会弹出任何东西、也不会有后续，
 * 换掉之后「打开选择框」这件事才在 DOM 上留得下可观察的结果。
 */
function stubPicker(files: readonly File[]): StepWithExpect {
  return {
    kind: 'raw',
    why: '无头 DOM 不会真的弹出文件选择框；换成立刻回填的桩，"打开选择框"才有可观察的结果',
    run: ({ doc }) => {
      const input = partEl(doc, 'hidden-input') as HTMLInputElement
      input.click = (): void => {
        Object.defineProperty(input, 'files', { value: [...files], configurable: true })
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    },
  }
}

/**
 * 拖拽事件。无头 DOM 没有 DragEvent 构造器，自己补一份 dataTransfer。
 * dragover 与 drop 顺带守住「默认行为必须被拦下」：
 * 前者不拦浏览器压根不派 drop，后者不拦浏览器会直接打开文件把当前页顶掉。
 */
function drag(type: 'dragover' | 'dragleave' | 'drop', files: readonly File[] = []): StepWithExpect {
  return {
    kind: 'raw',
    why: '无头 DOM 没有 DragEvent 构造器，且 defaultPrevented 是拖拽契约的一半，声明式步骤表达不了',
    run: async ({ doc, flush }) => {
      const zone = partEl(doc, 'dropzone')
      const event = new Event(type, { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'dataTransfer', { value: { files: [...files] } })
      Object.defineProperty(event, 'relatedTarget', { value: null })
      zone.dispatchEvent(event)
      if (type !== 'dragleave' && !event.defaultPrevented)
        throw new Error(`${type} 的默认行为没被拦下：dragover 不拦浏览器不会派 drop，drop 不拦浏览器会直接打开文件`)
      await flush()
    },
  }
}

const BASE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'label', text: '附件' },
    // 投放区里放一个纯装饰的文字节点：点它同样该打开选择框（事件从子节点冒上来）
    { part: 'dropzone', children: [{ tag: 'span', text: '拖到这里' }] },
    // trigger 刻意放在投放区之外：按钮里再套按钮，读屏只念得出外面那一个
    { part: 'trigger', tag: 'button', text: '选择文件' },
    { part: 'hidden-input', tag: 'input' },
    { part: 'item-group' },
    { part: 'clear-trigger', tag: 'button', text: '清空' },
  ],
}

/**
 * 条目在两个适配器上的身份都靠 index 声明：Vue 侧是 prop、WC 侧是属性。
 * 一致性 fixture 是静态结构树，属性值只能是字符串，传不了 File 对象，
 * 这也正是两侧都要支持「只声明下标」的原因。
 */
function itemNode(index: number): FixtureNode {
  return {
    part: 'item',
    attrs: { index: String(index) },
    children: [
      { part: 'item-preview' },
      { part: 'item-name', tag: 'span' },
      { part: 'item-size-text', tag: 'span' },
      { part: 'item-delete-trigger', tag: 'button', text: '删除' },
    ],
  }
}

/** 在列表容器里铺 n 个条目位。位子比文件多时多出来的那些不该被接线。 */
function withItems(n: number) {
  return (base: FixtureNode): FixtureNode => ({
    ...base,
    children: base.children!.map(child =>
      child.part === 'item-group'
        ? { ...child, children: Array.from({ length: n }, (_, i) => itemNode(i)) }
        : child,
    ),
  })
}

export const fileUploadSuite: ConformanceSuite = {
  component: 'file-upload',
  anatomy: fileUploadAnatomy,
  keyboard: fileUploadKeyboard,
  fixture: BASE,
  cases: [
    {
      name: '初始：投放区是可聚焦的按钮，标题点得开选择框，空列表下清空按钮在位且只打 data-empty',
      spec: { apg: `${APG}#wai-aria-roles-states-and-properties` },
      // Tab 位的形状就长在这几条 tabindex/disabled 断言里：
      // 投放区占一位、trigger 占一位、清空按钮占一位、藏起来的输入退出序列
      covers: ['file-upload.kbd.tab', 'file-upload.kbd.open-trigger', 'file-upload.kbd.clear'],
      initial: {
        order: ['root', 'label', 'dropzone', 'trigger', 'hidden-input', 'item-group', 'clear-trigger'],
        counts: {
          'root': 1,
          'label': 1,
          'dropzone': 1,
          'trigger': 1,
          'hidden-input': 1,
          'item-group': 1,
          'clear-trigger': 1,
          // 一个文件都没有，条目位也没写：列表里空空如也
          'item': 0,
        },
        parts: {
          'root': { 'data-empty': '', 'data-dragging': null, 'data-disabled': null, 'data-invalid': null },
          // for 指向隐藏输入，点标题即打开选择框（原生就有的联动）
          'label': { 'id': '@self', 'for': '@part(hidden-input)', 'data-disabled': null },
          'dropzone': {
            'id': '@self',
            'role': 'button',
            // 名字优先取 label；label 缺席时才回落到兜底文案，两条一起写才表达得出这个优先级
            'aria-labelledby': '@part(label)',
            'aria-label': 'Drop files here',
            // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了没禁用"
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-dragging': null,
            'data-disabled': null,
          },
          'trigger': { 'type': 'button', 'disabled': null, 'data-disabled': null },
          'hidden-input': {
            id: '@self',
            type: 'file',
            // 藏起来的输入不占 Tab 位：键盘入口是投放区与 trigger
            tabindex: '-1',
            // 没给 name 就不产出该属性，这份输入不参与提交
            name: null,
            disabled: null,
          },
          'item-group': { 'role': 'list', 'data-empty': '' },
          // 空列表下按钮照常在位可聚焦，只打 data-empty 交给皮肤压淡
          'clear-trigger': { 'type': 'button', 'disabled': null, 'data-disabled': null, 'data-empty': '' },
        },
      },
      steps: [
        nativeActivation('file-upload', 'trigger'),
        nativeActivation('file-upload', 'clear-trigger'),
      ],
    },
    {
      name: 'name 落到隐藏输入上，这份控件才参与表单提交',
      spec: { apg: APG },
      props: { name: 'attachment' },
      initial: {
        parts: { 'hidden-input': { name: 'attachment' } },
      },
    },
    {
      name: '已有文件：每条自报文件名与字节数，预览按类型分档，删除按钮的名字带上文件名',
      spec: { apg: APG },
      covers: ['file-upload.kbd.delete'],
      fixture: withItems(2),
      props: { maxFiles: 3, defaultFiles: [PHOTO, NOTES] },
      initial: {
        order: [
          'root',
          'label',
          'dropzone',
          'trigger',
          'hidden-input',
          'item-group',
          'item[0]',
          'item-preview[0]',
          'item-name[0]',
          'item-size-text[0]',
          'item-delete-trigger[0]',
          'item[1]',
          'item-preview[1]',
          'item-name[1]',
          'item-size-text[1]',
          'item-delete-trigger[1]',
          'clear-trigger',
        ],
        counts: { 'item': 2, 'item-preview': 2, 'item-name': 2, 'item-size-text': 2, 'item-delete-trigger': 2 },
        parts: {
          'root': { 'data-empty': null },
          'item-group': { 'role': 'list', 'data-empty': null },
          'item[0]': { 'role': 'listitem', 'data-file-name': 'photo.png', 'data-file-size': '2048' },
          'item[1]': { 'role': 'listitem', 'data-file-name': 'notes.txt', 'data-file-size': '12' },
          'item-size-text[0]': { 'data-file-size': '2048' },
          'item-size-text[1]': { 'data-file-size': '12' },
          // 缩略图是纯装饰：文件名与大小就在旁边，读屏再念一遍只是噪音
          'item-preview[0]': { 'aria-hidden': 'true', 'data-file-type': 'image/png' },
          // 系统给不出 MIME 时落成 unknown，皮肤才分得开"未知类型"与"属性没写"
          'item-preview[1]': { 'aria-hidden': 'true', 'data-file-type': 'unknown' },
          // 每条的删除按钮长得一模一样，不带文件名读屏念出来是一串"删除、删除"
          'item-delete-trigger[0]': { 'type': 'button', 'aria-label': 'Delete photo.png', 'disabled': null },
          'item-delete-trigger[1]': { 'type': 'button', 'aria-label': 'Delete notes.txt' },
          'clear-trigger': { 'disabled': null, 'data-empty': null },
        },
      },
      steps: [nativeActivation('file-upload', 'item-delete-trigger')],
    },
    {
      name: '删除只删自己那一条，空出来的条目位必须整条交还，不能带着旧文件名躺在 DOM 里',
      spec: { apg: APG },
      fixture: withItems(2),
      props: { maxFiles: 3, defaultFiles: [PHOTO, NOTES] },
      steps: [
        {
          kind: 'click',
          part: 'item-delete-trigger[0]',
          expect: {
            // 位子还是两个，接上线的只剩一个：多出来的那个不能留着上一帧的属性
            counts: { 'item': 1, 'item-delete-trigger': 1 },
            parts: { 'item[0]': { 'data-file-name': 'notes.txt' } },
          },
        },
        // 焦点交给恒在的投放区。掉到 body 是 APG 在「Persistence of focus」里点名的
        // 失败态，而它举的例子正是删列表项。
        // 不取相邻那一条：它只能按删除前的位置取，而删完列表会上移，攥在手里的那个
        // 节点恰好变成空位，焦点当场又丢
        {
          kind: 'settle',
          until: { activeElement: 'dropzone' },
          expect: { activeElement: 'dropzone' },
        },
        {
          kind: 'click',
          part: 'item-delete-trigger[0]',
          expect: {
            counts: { item: 0 },
            parts: { 'root': { 'data-empty': '' }, 'item-group': { 'data-empty': '' }, 'clear-trigger': { 'disabled': null, 'data-empty': '' } },
          },
        },
        // 删空同样落投放区，清空按钮不是归还目标
        {
          kind: 'settle',
          until: { activeElement: 'dropzone' },
          expect: { activeElement: 'dropzone' },
        },
      ],
    },
    {
      name: '清空按钮一次清掉整份列表',
      spec: { apg: APG },
      fixture: withItems(2),
      props: { maxFiles: 3, defaultFiles: [PHOTO, NOTES] },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            counts: { item: 0 },
            parts: { 'root': { 'data-empty': '' }, 'clear-trigger': { 'disabled': null, 'data-empty': '' } },
          },
        },
        // 清空后按钮仍在位，焦点留在它身上不掉回 body
        { kind: 'settle', until: { activeElement: 'clear-trigger' }, expect: { activeElement: 'clear-trigger' } },
        // 空列表下再点一次是空操作
        { kind: 'click', part: 'clear-trigger', expect: { counts: { item: 0 }, parts: { 'clear-trigger': { 'data-empty': '' } } } },
      ],
    },
    {
      name: '投放区上 Enter / Space 打开选择框，选中的文件进列表',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['file-upload.kbd.open-dropzone'],
      fixture: withItems(2),
      props: { maxFiles: 2 },
      steps: [
        stubPicker([PHOTO]),
        { kind: 'focus', part: 'dropzone', expect: { activeElement: { part: 'dropzone', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            counts: { item: 1 },
            parts: { 'item[0]': { 'data-file-name': 'photo.png' }, 'root': { 'data-empty': null } },
          },
        },
        stubPicker([NOTES]),
        {
          kind: 'key',
          key: 'Space',
          expect: {
            counts: { item: 2 },
            parts: { 'item[1]': { 'data-file-name': 'notes.txt' } },
          },
        },
      ],
    },
    {
      name: '点投放区（含区内的装饰节点）与点 trigger 都打开选择框',
      spec: { apg: APG },
      fixture: withItems(1),
      props: { maxFiles: 3 },
      steps: [
        stubPicker([PHOTO]),
        { kind: 'click', part: 'dropzone', expect: { counts: { item: 1 } } },
        stubPicker([NOTES]),
        {
          kind: 'click',
          part: 'trigger',
          // 位子只有一个，第二个文件照样进得了列表（数量上限是 3），只是没有位子显示它
          expect: { parts: { 'item[0]': { 'data-file-name': 'photo.png' } } },
        },
      ],
    },
    {
      name: '收进来的文件先过校验：类型不符的不进列表',
      spec: { apg: APG },
      fixture: withItems(2),
      props: { maxFiles: 3, accept: 'image/*' },
      steps: [
        stubPicker([PHOTO, REPORT]),
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            counts: { item: 1 },
            parts: { 'item[0]': { 'data-file-name': 'photo.png' } },
          },
        },
      ],
    },
    {
      name: '拖拽：悬停打上 data-dragging，离开撤掉，投放收下文件并回到常态',
      spec: { apg: APG },
      fixture: withItems(1),
      props: { maxFiles: 3 },
      steps: [
        {
          ...drag('dragover'),
          expect: { parts: { dropzone: { 'data-dragging': '' }, root: { 'data-dragging': '' } } },
        },
        {
          ...drag('dragleave'),
          expect: { parts: { dropzone: { 'data-dragging': null }, root: { 'data-dragging': null } } },
        },
        drag('dragover'),
        {
          ...drag('drop', [PHOTO]),
          expect: {
            counts: { item: 1 },
            parts: {
              'item[0]': { 'data-file-name': 'photo.png' },
              'dropzone': { 'data-dragging': null },
            },
          },
        },
      ],
    },
    {
      name: 'allowDrop=false：投放区不再接管拖拽，也不出 data-dragging',
      spec: { apg: APG },
      fixture: withItems(1),
      props: { maxFiles: 3, allowDrop: false },
      steps: [
        {
          kind: 'raw',
          why: '关掉投放时连接层刻意不拦默认行为，这条契约只有直接看 defaultPrevented 才验得到',
          run: async ({ doc, flush }) => {
            const zone = partEl(doc, 'dropzone')
            const over = new Event('dragover', { bubbles: true, cancelable: true })
            Object.defineProperty(over, 'dataTransfer', { value: { files: [] } })
            zone.dispatchEvent(over)
            if (over.defaultPrevented)
              throw new Error('allowDrop=false 时不该拦下 dragover：拦了等于对浏览器说"这儿能放"')
            const drop = new Event('drop', { bubbles: true, cancelable: true })
            Object.defineProperty(drop, 'dataTransfer', { value: { files: [PHOTO] } })
            zone.dispatchEvent(drop)
            if (drop.defaultPrevented)
              throw new Error('allowDrop=false 时不该拦下 drop')
            await flush()
          },
          expect: {
            counts: { item: 0 },
            parts: { dropzone: { 'data-dragging': null }, root: { 'data-empty': '' } },
          },
        },
      ],
    },
    {
      name: '整体禁用：投放区退出 Tab 序列，几个按钮走原生 disabled，点它按它都收不进文件',
      spec: { apg: APG },
      fixture: withItems(1),
      props: { maxFiles: 3, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'dropzone': { 'aria-disabled': 'true', 'tabindex': '-1', 'data-disabled': '' },
          'trigger': { 'disabled': '', 'data-disabled': '' },
          'hidden-input': { disabled: '' },
          'clear-trigger': { 'disabled': '', 'data-disabled': '' },
        },
      },
      steps: [
        stubPicker([PHOTO]),
        // 投放区用 aria-disabled 表达禁用，click 不被短路，事件派得出去才碰得到禁用守卫
        { kind: 'click', part: 'dropzone', expect: { counts: { item: 0 }, parts: { root: { 'data-empty': '' } } } },
        { kind: 'focus', part: 'dropzone' },
        { kind: 'key', key: 'Enter', expect: { counts: { item: 0 } } },
        // 拖拽同样被挡下；禁用时不拦默认行为，拦了等于对浏览器说这儿能放
        {
          kind: 'raw',
          why: '禁用时不拦默认行为这条契约，只有直接看 defaultPrevented 才验得到',
          run: async ({ doc, flush }) => {
            const zone = partEl(doc, 'dropzone')
            const over = new Event('dragover', { bubbles: true, cancelable: true })
            Object.defineProperty(over, 'dataTransfer', { value: { files: [] } })
            zone.dispatchEvent(over)
            if (over.defaultPrevented)
              throw new Error('禁用时不该拦下 dragover')
            const drop = new Event('drop', { bubbles: true, cancelable: true })
            Object.defineProperty(drop, 'dataTransfer', { value: { files: [PHOTO] } })
            zone.dispatchEvent(drop)
            await flush()
          },
          expect: { counts: { item: 0 }, parts: { dropzone: { 'data-dragging': null } } },
        },
      ],
    },
    {
      name: '禁用时条目上的删除按钮也带原生 disabled，点不动',
      spec: { apg: APG },
      fixture: withItems(1),
      props: { maxFiles: 3, disabled: true, defaultFiles: [PHOTO] },
      initial: {
        parts: {
          'item[0]': { 'data-disabled': '' },
          'item-delete-trigger[0]': { disabled: '' },
        },
      },
    },
    {
      name: '受控 files：宿主不写回则列表纹丝不动，写回即跟着走',
      spec: { adr: 'controlled-uncontrolled' },
      fixture: withItems(2),
      props: { maxFiles: 3, files: [] },
      steps: [
        stubPicker([PHOTO]),
        {
          kind: 'click',
          part: 'trigger',
          expect: { counts: { item: 0 }, parts: { root: { 'data-empty': '' } } },
        },
        {
          kind: 'setProps',
          props: { files: [PHOTO, NOTES] },
          expect: {
            counts: { item: 2 },
            parts: {
              'item[0]': { 'data-file-name': 'photo.png' },
              'item[1]': { 'data-file-name': 'notes.txt' },
              'root': { 'data-empty': null },
            },
          },
        },
      ],
    },
  ],
}
