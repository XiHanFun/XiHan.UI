// 引导开在模态对话框里：锚定步的高亮框与遮罩、定位层同在引导这一层，排在对话框之上，压暗看得到。
// 高亮框不带本层的层号时，皮肤的 z-index 落回模态层基数，被外层对话框盖住，周围不压暗、目标也没有描边。
// 页面量一次，再把整页标记装进有层与无层产物各量一次。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  closeSheetFrame()
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function part(doc: Document, scope: string, name: string): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
}

function zIndex(doc: Document, element: Element): number {
  return Number(doc.defaultView!.getComputedStyle(element).zIndex)
}

/** 高亮框排在对话框各层之上、与引导的遮罩同层且在它后面；外圈暗幕不透明。 */
function expectSpotlightAboveDialog(doc: Document): void {
  const spotlight = part(doc, 'tour', 'spotlight')!
  const backdrop = part(doc, 'tour', 'backdrop')!
  expect(spotlight.hasAttribute('hidden')).toBe(false)
  expect(spotlight.hasAttribute('data-dimmed')).toBe(true)
  const dialog = ['backdrop', 'positioner', 'content']
    .map(name => part(doc, 'dialog', name))
    .filter((element): element is HTMLElement => element !== null)
    .map(element => zIndex(doc, element))
    .filter(value => Number.isFinite(value))
  expect(dialog.length).toBeGreaterThan(0)
  expect(zIndex(doc, spotlight)).toBeGreaterThan(Math.max(...dialog))
  expect(zIndex(doc, spotlight)).toBe(zIndex(doc, backdrop))
  expect(backdrop.compareDocumentPosition(spotlight) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(shroudAlpha(doc.defaultView!.getComputedStyle(spotlight).boxShadow)).toBeGreaterThan(0)
}

/** box-shadow 最后那层（铺满视口的暗幕）颜色的不透明度；颜色写法不限 rgb、oklab 这几种。 */
function shroudAlpha(shadow: string): number {
  const layer = shadow.split(/,(?![^(]*\))/).at(-1)!.trim()
  const inner = layer.slice(layer.indexOf('(') + 1, layer.indexOf(')'))
  if (inner.includes('/'))
    return Number.parseFloat(inner.split('/')[1]!)
  const channels = inner.split(',')
  return channels.length === 4 ? Number.parseFloat(channels[3]!) : 1
}

describe('vue 引导开在模态对话框里', () => {
  it('锚定步的高亮框排在对话框之上，与引导的遮罩同层，看得到压暗', async () => {
    const touring = ref(false)
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhDialogRoot, { open: true }, () => h(XhDialogContent, null, () => [
        h(XhDialogTitle, null, () => '编辑'),
        h('button', { id: 'tour-in-dialog-target', type: 'button' }, '工具栏'),
        h(XhTourRoot, { open: touring.value, steps: [{ id: 'toolbar', target: '#tour-in-dialog-target', title: '工具栏' }] }, () => [
          h(XhTourBackdrop),
          h(XhTourSpotlight),
          h(XhTourPositioner, null, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
        ]),
      ])),
    })
    app.mount(host)
    await settle()
    touring.value = true
    await settle()
    expectSpotlightAboveDialog(document)
    const markup = document.body.innerHTML
    for (const sheet of SHEET_NAMES)
      expectSpotlightAboveDialog(await stageSheet(markup, sheet))
  })
})
