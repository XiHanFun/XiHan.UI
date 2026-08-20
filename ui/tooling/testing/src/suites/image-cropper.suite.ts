import type { ConformanceSuite } from '../conformance/types'
import { imageCropperAnatomy, imageCropperKeyboard } from '@xihan-ui/headless'

// APG 没有裁切这个模式，键盘约定借的是滑块那一套（见 headless 的键盘表说明）。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/'
const APG_KBD = `${APG}#keyboardinteraction`

const SCOPE = '[data-scope="image-cropper"]'

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/**
 * 图片自然尺寸只能由 image 部件的 load 事件报进来，jsdom 不会真的去加载图片，
 * 所以把 naturalWidth/naturalHeight 摆好再手动派一次 load。
 * 两个适配器都把这份尺寸交给同一台机器，桩打在真实节点上、对两侧一视同仁。
 */
function loadImage(doc: Document, width = 400, height = 200): void {
  const img = findPart(doc, 'image')
  Object.defineProperty(img, 'naturalWidth', { value: width, configurable: true })
  Object.defineProperty(img, 'naturalHeight', { value: height, configurable: true })
  img.dispatchEvent(new Event('load'))
}

/**
 * jsdom 不做布局，getBoundingClientRect 恒是 0×0——位移换算会当成"尺子还没就位"原地不动，
 * 拖动因此一步也走不出来。摆一个 400×200 的视口，与图片自然尺寸 1:1，换算才有得算。
 */
function layoutViewport(doc: Document): void {
  const viewport = findPart(doc, 'viewport')
  viewport.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    top: 0,
    left: 0,
    right: 400,
    bottom: 200,
    toJSON: () => ({}),
  }) as DOMRect
}

/** 隐藏输入的 value 只落 DOM property，进不了归一化快照，只能直接读。 */
function assertCropValue(doc: Document, expected: string): void {
  const input = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)
  if (!input)
    throw new Error('找不到 hidden-input 部件')
  if (input.value !== expected)
    throw new Error(`裁切矩形不符：期望 ${expected}，实际 ${input.value}`)
}

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }))
}

export const imageCropperSuite: ConformanceSuite = {
  component: 'image-cropper',
  anatomy: imageCropperAnatomy,
  keyboard: imageCropperKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'viewport',
        children: [
          { part: 'image', tag: 'img' },
          {
            part: 'crop-area',
            children: [
              { part: 'grid' },
              { part: 'crop-handle', tag: 'button', attrs: { position: 'nw' } },
              { part: 'crop-handle', tag: 'button', attrs: { position: 'se' } },
            ],
          },
        ],
      },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认：裁切框报 application、把手报 slider，各自占一个 Tab 停靠点',
      spec: { apg: `${APG}#roles_states_properties` },
      covers: ['image-cropper.kbd.tab'],
      initial: {
        order: ['root', 'viewport', 'image', 'crop-area', 'grid', 'crop-handle[0]', 'crop-handle[1]', 'hidden-input'],
        counts: { 'root': 1, 'viewport': 1, 'image': 1, 'crop-area': 1, 'grid': 1, 'crop-handle': 2, 'hidden-input': 1 },
        parts: {
          'root': {
            'data-shape': 'rect',
            'data-disabled': null,
            'data-readonly': null,
            'data-dragging': null,
            'data-resizing': null,
          },
          'crop-area': {
            // 报成 application 读屏才切进焦点模式，方向键才到得了这里；
            // 报 slider 会把框里八个把手当装饰整批抹掉，所以框上不挂值语义
            'role': 'application',
            'aria-label': 'Crop area',
            'aria-valuenow': null,
            // 显式 false：省略是"没说"，读屏对两者的处理并不一样
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-shape': 'rect',
            'data-dragging': null,
          },
          'grid': { 'aria-hidden': 'true', 'data-shape': 'rect' },
          'crop-handle': [
            {
              'type': 'button',
              'role': 'slider',
              'aria-label': 'Top left handle',
              'aria-valuetext': 'X 0, Y 0, width 0, height 0',
              'aria-disabled': 'false',
              'tabindex': '0',
              'data-position': 'nw',
              'data-disabled': null,
              'data-resizing': null,
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            { 'aria-label': 'Bottom right handle', 'data-position': 'se', 'disabled': null },
          ],
          'hidden-input': { type: 'hidden', name: null },
        },
        activeElement: null,
      },
    },
    {
      name: '替代文本由根上的 alt 写进 image 部件，不给时落空串',
      spec: { adr: 'a11y-name' },
      props: { alt: '一张示例图' },
      steps: [
        {
          kind: 'raw',
          why: 'alt 不进归一化快照（只采 aria- / data- 与结构属性），只有直接读 DOM 才验得到它落在了 image 上',
          run: ({ doc }) => {
            const image = findPart(doc, 'image')
            if (image.getAttribute('alt') !== '一张示例图')
              throw new Error(`image 的 alt 期望「一张示例图」，实际 ${image.getAttribute('alt')}`)
          },
        },
      ],
    },
    {
      name: '图片加载完成才量得出尺寸：没给初值时取整张图',
      spec: { adr: 'controlled-uncontrolled' },
      props: { name: 'avatar' },
      steps: [
        {
          kind: 'raw',
          why: '自然尺寸只能由 img 的 load 事件报进来，jsdom 不会真的去加载图片',
          run: async ({ doc, flush }) => {
            assertCropValue(doc, '0,0,0,0')
            loadImage(doc)
            await flush()
            assertCropValue(doc, '0,0,400,200')
          },
        },
      ],
    },
    {
      name: '锁定宽高比时初值按比例收，居中放',
      spec: { adr: 'controlled-uncontrolled' },
      props: { aspectRatio: 1 },
      steps: [
        {
          kind: 'raw',
          why: '裁切矩形只落在隐藏输入的 value property 上，进不了归一化快照',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
            assertCropValue(doc, '100,0,200,200')
          },
        },
      ],
    },
    {
      name: '方向键在裁切框上平移，按住 Shift 走十倍',
      spec: { apg: APG_KBD },
      covers: ['image-cropper.kbd.move', 'image-cropper.kbd.move-large'],
      props: { defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      steps: [
        {
          kind: 'raw',
          why: '先把图片尺寸报进去，否则没有可平移的边界',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
          },
        },
        { kind: 'focus', part: 'crop-area' },
        // 一按也会发一次 value-change-end（键盘路径的收尾），但两个 harness 的
        // 事件白名单里都没有它，这里断言不到；那条契约由 headless 单测把守
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { events: [{ type: 'value-change', detail: { value: { x: 101, y: 50, width: 100, height: 50 } } }] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Shift'],
          expect: { events: [{ type: 'value-change', detail: { value: { x: 101, y: 60, width: 100, height: 50 } } }] },
        },
        {
          kind: 'raw',
          why: '表单出口跟着键盘走，value 是 property 只能直接读',
          run: ({ doc }) => assertCropValue(doc, '101,60,100,50'),
        },
      ],
    },
    {
      name: '方向键在把手上改尺寸，对面那条边钉住不动',
      spec: { apg: APG_KBD },
      covers: ['image-cropper.kbd.resize', 'image-cropper.kbd.resize-large'],
      props: { defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      steps: [
        {
          kind: 'raw',
          why: '先把图片尺寸报进去，否则改尺寸没有可用的边界',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
          },
        },
        { kind: 'focus', part: 'crop-handle[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Shift'],
          expect: { events: [{ type: 'value-change', detail: { value: { x: 100, y: 50, width: 110, height: 50 } } }] },
        },
        { kind: 'focus', part: 'crop-handle[0]' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { events: [{ type: 'value-change', detail: { value: { x: 100, y: 49, width: 110, height: 51 } } }] },
        },
      ],
    },
    {
      name: '指针按下即开拖：整块跟着走，松手不再跟',
      spec: { apg: APG },
      props: { defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不做布局，视口矩形要自己摆；指针事件也没有对应的步骤类型',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            layoutViewport(doc)
            await flush()
            const area = findPart(doc, 'crop-area')
            area.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0, bubbles: true, cancelable: true }))
            doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 30, clientY: 20, bubbles: true }))
            await flush()
            assertCropValue(doc, '130,70,100,50')
            doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
            await flush()
            doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 90, clientY: 20, bubbles: true }))
            await flush()
            assertCropValue(doc, '130,70,100,50')
          },
        },
      ],
    },
    {
      name: '把手上按下只改尺寸，不会连整体拖动一起触发',
      spec: { apg: APG },
      props: { defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      steps: [
        {
          kind: 'raw',
          why: '同上：视口矩形要自己摆，指针事件没有对应的步骤类型',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            layoutViewport(doc)
            await flush()
            const handle = findPart(doc, 'crop-handle', 1)
            handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0, bubbles: true, cancelable: true }))
            doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 40, clientY: 20, bubbles: true }))
            await flush()
            assertCropValue(doc, '100,50,140,70')
            doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
          },
        },
      ],
    },
    {
      name: '禁用：裁切框与把手一起退出 Tab 序列，方向键一概不改值',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { disabled: true, defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          // 裁切框是 div，不写 tabindex 就聚不了焦；
          // 把手是原生 button，不写 tabindex 照样在 Tab 序列里，禁用时必须显式给 -1
          'crop-area': { 'aria-disabled': 'true', 'data-disabled': '', 'tabindex': null },
          'crop-handle': [
            { 'aria-disabled': 'true', 'data-disabled': '', 'tabindex': '-1', 'disabled': null },
            { 'aria-disabled': 'true', 'data-disabled': '', 'tabindex': '-1', 'disabled': null },
          ],
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '禁用的裁切框没有 Tab 位，focus 步骤落不上去，只能把按键直接派到节点上',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
            keydown(findPart(doc, 'crop-area'), 'ArrowRight')
            keydown(findPart(doc, 'crop-handle', 1), 'ArrowRight')
            await flush()
            assertCropValue(doc, '100,50,100,50')
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '只读：仍可聚焦、仍念得出来，只是改不动',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { readOnly: true, defaultValue: { x: 100, y: 50, width: 100, height: 50 } },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          'crop-area': { 'data-readonly': '', 'aria-disabled': 'false', 'tabindex': '0' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '同禁用那条：值只落在隐藏输入的 value property 上',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
            keydown(findPart(doc, 'crop-area'), 'ArrowRight')
            await flush()
            assertCropValue(doc, '100,50,100,50')
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '圆形裁切：外形标记落到根、裁切框与参考线三处',
      spec: { apg: APG },
      props: { shape: 'round' },
      initial: {
        parts: {
          'root': { 'data-shape': 'round' },
          'crop-area': { 'data-shape': 'round' },
          'grid': { 'data-shape': 'round' },
        },
      },
    },
    {
      name: '受控 value：按键只发意图不自改 DOM，父写回后才跟上',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: { x: 100, y: 50, width: 100, height: 50 } },
      steps: [
        {
          kind: 'raw',
          why: '先把图片尺寸报进去；受控值不该被加载那一步改写',
          run: async ({ doc, flush }) => {
            loadImage(doc)
            await flush()
            assertCropValue(doc, '100,50,100,50')
          },
        },
        { kind: 'focus', part: 'crop-area' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { events: [{ type: 'value-change', detail: { value: { x: 101, y: 50, width: 100, height: 50 } } }] },
        },
        {
          kind: 'raw',
          why: '受控时 DOM 一点不动，这一点只有直接读 value 看得出来',
          run: ({ doc }) => assertCropValue(doc, '100,50,100,50'),
        },
        { kind: 'setProps', props: { value: { x: 101, y: 50, width: 100, height: 50 } } },
        {
          kind: 'raw',
          why: '父写回之后 DOM 才跟上，同样只能直接读 value',
          run: async ({ doc, flush }) => {
            await flush()
            assertCropValue(doc, '101,50,100,50')
          },
        },
      ],
    },
  ],
}
