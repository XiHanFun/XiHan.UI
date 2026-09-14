import type { ColorSwatchProps } from '../src/color-swatch'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectColorSwatch } from '../src/color-swatch'

function api(props: ColorSwatchProps = {}) {
  return connectColorSwatch(props, normalizeProps)
}

function root(props: ColorSwatchProps = {}): Record<string, unknown> {
  return api(props).getRootProps() as Record<string, unknown>
}

describe('connectColorSwatch', () => {
  it('把颜色串画进色块面：角色、尺寸与颜色层三样都经家族属性投影', () => {
    const props = root({ value: '#ff000080', size: 'lg' })
    expect(props).toMatchObject({
      'data-scope': 'color-swatch',
      'data-part': 'root',
      'role': 'img',
      'aria-label': '#ff000080',
      'data-value': '#ff000080',
      'data-size': 'lg',
      'data-xh-swatch': '',
      'data-xh-swatch-size': 'lg',
    })
    expect(props.style).toEqual({ '--xh-_swatch-color': 'rgba(255, 0, 0, 0.502)' })
    expect(props['data-invalid']).toBeUndefined()
    expect(props['aria-hidden']).toBeUndefined()
  })

  it('label 优先于颜色串作可访问名', () => {
    expect(root({ value: '#e11d48', label: '品牌红' })['aria-label']).toBe('品牌红')
  })

  it('三种写法解析成同一个颜色，api.css 恒用 rgba()', () => {
    for (const value of ['#f00', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)']) {
      const swatch = api({ value })
      expect(swatch.valid).toBe(true)
      expect(swatch.css).toBe('rgba(255, 0, 0, 1)')
      expect(swatch.rgba).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    }
  })

  it('解析不出的串：不画颜色层、标成无效，名字仍念作者写的串', () => {
    const swatch = api({ value: 'red' })
    expect(swatch.valid).toBe(false)
    expect(swatch.css).toBe('')
    expect(swatch.value).toBe('red')
    const props = swatch.getRootProps() as Record<string, unknown>
    expect(props['data-invalid']).toBe('')
    expect(props['aria-label']).toBe('red')
    // 写空串撤销上一帧的颜色声明，而不是不写这个键
    expect(props.style).toEqual({ '--xh-_swatch-color': '' })
  })

  it('既没 label 又没值：整块是装饰，不进可访问树，也不算无效', () => {
    const props = root()
    expect(props.role).toBeUndefined()
    expect(props['aria-hidden']).toBe(true)
    expect(props['data-value']).toBeUndefined()
    expect(props['data-invalid']).toBeUndefined()
  })
})
