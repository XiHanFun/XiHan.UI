import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { XhFieldControl, XhFieldRoot } from '../src'

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
