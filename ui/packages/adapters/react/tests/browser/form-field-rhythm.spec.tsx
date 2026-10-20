// 表单与字段集里，带说明的字段与普通字段交替排时，每对相邻字段之间的留白一样：上一项最后一段看得见的内容
// （说明，没有说明就是控件）到下一项标签，都是一段项距 --xh-space-5。说明是字，不算留白；给错误文案留的那一行
// 空着，算项距。带说明的字段转无效时，错误文案顶替说明那一行，后面的字段不挪位。
// 页面量一次，再把标记装进有层与无层产物各量一次。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhFormFieldGroup,
  XhFormRoot,
} from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface FieldSpec {
  name: string
  description?: boolean
  error?: boolean
}

/** 带说明（有、没有错误文案）与普通字段（有、没有错误文案）交替排。 */
const FIELDS: FieldSpec[] = [
  { name: '甲', description: true, error: true },
  { name: '乙', error: true },
  { name: '丙', description: true },
  { name: '丁' },
  { name: '戊', description: true, error: true },
  { name: '己' },
]

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  closeSheetFrame()
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let round = 0; round < 2; round++)
    await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

async function render(view: ReactNode): Promise<void> {
  if (!host) {
    host = document.createElement('div')
    host.style.inlineSize = '480px'
    document.body.append(host)
    root = createRoot(host)
  }
  act(() => root!.render(view))
  await settle()
}

/** 一个语义尺寸令牌解出来的像素。 */
function px(doc: Document, token: string): number {
  const probe = doc.createElement('div')
  probe.style.blockSize = `var(${token})`
  doc.body.append(probe)
  const value = probe.getBoundingClientRect().height
  probe.remove()
  return value
}

function shown(doc: Document, element: Element | null): element is HTMLElement {
  return !!element && !element.hasAttribute('hidden') && doc.defaultView!.getComputedStyle(element).display !== 'none'
}

/** 每对相邻字段之间的留白：上一项最后一段看得见的内容的底，到下一项标签的顶。 */
function gaps(doc: Document): number[] {
  const roots = [...doc.querySelectorAll<HTMLElement>(`[data-scope='field'][data-part='root']`)]
  return roots.slice(0, -1).map((field, index) => {
    const tail = [`description`, `error-text`, `control`]
      .map(part => field.querySelector(`[data-scope='field'][data-part='${part}']`))
      .find(element => shown(doc, element))!
    const next = roots[index + 1]!.querySelector(`[data-scope='field'][data-part='label']`)!
    return next.getBoundingClientRect().top - tail.getBoundingClientRect().bottom
  })
}

function expectEvenRhythm(doc: Document): void {
  const space = px(doc, '--xh-space-5')
  for (const gap of gaps(doc))
    expect(gap).toBeCloseTo(space, 0)
}

async function expectEvenEverywhere(): Promise<void> {
  expectEvenRhythm(document)
  const markup = host!.outerHTML
  for (const sheet of SHEET_NAMES)
    expectEvenRhythm(await stageSheet(markup, sheet))
}

function Field({ spec, invalid = false }: { spec: FieldSpec, invalid?: boolean }): ReactNode {
  return (
    <XhFieldRoot invalid={invalid}>
      <XhFieldLabel>{spec.name}</XhFieldLabel>
      <XhFieldControl><input /></XhFieldControl>
      {spec.description ? <XhFieldDescription>一行说明</XhFieldDescription> : null}
      {spec.error ? <XhFieldErrorText>格式不对</XhFieldErrorText> : null}
    </XhFieldRoot>
  )
}

function grouped(invalidFirst = false): ReactNode {
  return (
    <XhFormRoot>
      {FIELDS.map((spec, index) => (
        <XhFormFieldGroup key={spec.name} name={spec.name}>
          <Field spec={spec} invalid={index === 0 && invalidFirst} />
        </XhFormFieldGroup>
      ))}
    </XhFormRoot>
  )
}

describe('react 带说明的字段与普通字段交替排', () => {
  it('表单（每项包 field-group）：每对相邻字段之间的留白都是一段项距', async () => {
    await render(grouped())
    await expectEvenEverywhere()
  })

  it('字段直接放进表单：同一套', async () => {
    await render(<XhFormRoot>{FIELDS.map(spec => <Field key={spec.name} spec={spec} />)}</XhFormRoot>)
    await expectEvenEverywhere()
  })

  it('字段集：同一套', async () => {
    await render(
      <XhFieldsetRoot>
        <XhFieldsetLegend>账号</XhFieldsetLegend>
        {FIELDS.map(spec => <Field key={spec.name} spec={spec} />)}
      </XhFieldsetRoot>,
    )
    await expectEvenEverywhere()
  })

  it('带说明的字段转无效：错误文案顶替说明那一行，后面的字段不挪位', async () => {
    await render(grouped())
    const labels = (): number[] => [...document.querySelectorAll(`[data-scope='field'][data-part='label']`)].map(label => label.getBoundingClientRect().top)
    const before = labels()
    await render(grouped(true))
    expect(document.querySelector(`[data-scope='field'][data-part='error-text']:not([hidden])`)).not.toBeNull()
    expect(labels()).toEqual(before)
  })
})
