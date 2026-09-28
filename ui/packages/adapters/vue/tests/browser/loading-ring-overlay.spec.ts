// 加载环家族的「压在动作钮上」一档：环居中、不占排布，进入在途要等一个 micro 才起淡，退出不等。
// 判据是计算样式与几何：伪元素的定位、尺寸与过渡延迟，jsdom 不算这些。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(loading: boolean): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `<button type="button" data-xh-loading-ring="overlay" ${loading ? 'data-loading' : ''}
    style="position: relative; inline-size: 160px; block-size: 36px; --xh-icon-size: 20px">保存</button>`
  document.body.append(host)
  return host.querySelector('button')!
}

function micro(on: Element): string {
  const probe = document.createElement('span')
  probe.style.transitionDuration = 'var(--xh-motion-duration-micro)'
  on.append(probe)
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value
}

describe('加载环压在动作钮上', () => {
  it('环居中、取图标档直径、不进排布', () => {
    const button = mount(true)
    const ring = getComputedStyle(button, '::before')
    expect(ring.position).toBe('absolute')
    expect(ring.inlineSize).toBe('20px')
    expect(ring.blockSize).toBe('20px')
    expect(ring.borderRadius).toBe('50%')
    // 钮宽不因环而变
    expect(button.getBoundingClientRect().width).toBe(160)
  })

  it('进入在途等一个 micro 才起淡，退出不等', async () => {
    const button = mount(true)
    expect(getComputedStyle(button, '::before').transitionDelay).toBe(micro(button))
    await expect.poll(() => getComputedStyle(button, '::before').opacity).toBe('1')
    button.removeAttribute('data-loading')
    expect(getComputedStyle(button, '::before').transitionDelay).toBe('0s')
    await expect.poll(() => getComputedStyle(button, '::before').opacity).toBe('0')
  })
})
