import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useFieldControl, XhFieldControl, XhFieldRoot, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../src'

describe('字段控件的显式组合合同', () => {
  it.each(['empty', 'multiple', 'mixed'])('%s 结构必须报错，不能静默省略字段接线', (shape) => {
    const children = shape === 'empty'
      ? null
      : shape === 'multiple'
        ? [<input key="one" />, <input key="two" />]
        : ['不能丢弃的内容', <input key="one" />]
    expect(() => renderToStaticMarkup(<XhFieldRoot><XhFieldControl>{children}</XhFieldControl></XhFieldRoot>))
      .toThrow(/field.*asChild/)
  })

  it('单控件 Fragment 接收字段属性，不把属性落到片段上', () => {
    const html = renderToStaticMarkup(
      <XhFieldRoot required><XhFieldControl><><input /></></XhFieldControl></XhFieldRoot>,
    )
    expect(html).toMatch(/<input[^>]*data-scope="field"/)
    expect(html).toMatch(/<input[^>]*aria-required="true"/)
  })

  it('显式 asChild=false 允许作者自行分配多个节点', () => {
    const html = renderToStaticMarkup(
      <XhFieldRoot>
        <XhFieldControl asChild={false}>
          {props => (
            <>
              <span>说明</span>
              <input {...props} />
            </>
          )}
        </XhFieldControl>
      </XhFieldRoot>,
    )
    expect(html).toContain('说明')
    expect(html).toMatch(/<input[^>]*data-scope="field"/)
  })
})

describe('字段控件的角色标记归属', () => {
  it('裸控件自身就是字段视觉盒：解剖两位与家族标记一并落到它身上', () => {
    const html = renderToStaticMarkup(<XhFieldRoot><XhFieldControl><input /></XhFieldControl></XhFieldRoot>)
    expect(html).toMatch(/<input[^>]*data-scope="field"/)
    expect(html).toMatch(/<input[^>]*data-xh-field-chrome=""/)
    expect(html).toMatch(/<input[^>]*data-xh-field-size="md"/)
    expect(html).toMatch(/<input[^>]*data-variant="outline"/)
  })

  // 薄封装自己有视觉盒（text-field 的 control 投了 chrome），字段的 chrome 标记落到封装根上就是双壳；
  // 形态轴同理：作者在封装上写的 variant 不能被字段固定投的 outline 盖掉
  it('组件节点不收家族标记与形态轴，封装根上不会再套一层字段外壳', () => {
    const html = renderToStaticMarkup(
      <XhFieldRoot>
        <XhFieldControl>
          <XhTextFieldRoot variant="subtle"><XhTextFieldControl><XhTextFieldInput /></XhTextFieldControl></XhTextFieldRoot>
        </XhFieldControl>
      </XhFieldRoot>,
    )
    const root = /<div[^>]*data-scope="text-field"[^>]*data-part="root"[^>]*>/.exec(html)?.[0] ?? ''
    expect(root).not.toBe('')
    expect(root).not.toContain('data-xh-field-chrome')
    expect(root).not.toContain('data-xh-field-size')
    expect(root).toContain('data-variant="subtle"')
    expect(root).toMatch(/aria-labelledby="[^"]+"/)
    expect(html.match(/data-xh-field-chrome=""/g)).toHaveLength(1)
  })

  it('useFieldControl 只交出接线，解剖两位与家族标记一起剔掉', () => {
    function Wrapper(): ReactNode {
      const controlProps = useFieldControl()
      return <div className="wrapper"><input {...controlProps} /></div>
    }
    const html = renderToStaticMarkup(
      <XhFieldRoot invalid><XhFieldControl asChild={false}><Wrapper /></XhFieldControl></XhFieldRoot>,
    )
    const input = /<input[^>]*>/.exec(html)?.[0] ?? ''
    expect(input).toMatch(/aria-invalid="true"/)
    expect(input).not.toContain('data-scope')
    expect(input).not.toContain('data-part')
    expect(input).not.toContain('data-xh-')
    expect(input).not.toContain('data-variant')
  })
})
