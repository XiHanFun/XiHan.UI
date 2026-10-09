// 读设计令牌的计算值：断言跟着令牌真源走，不把某一版的尺寸、倍率写死进用例。
//
// 长度用探针量：令牌可能是 var() 链或随密度改写的值，只有挂在真实层叠里的盒子量得出它在该处等于多少。

/** 长度令牌在 scope 处解析成的像素值；scope 缺省取 body，写了 data-density 等环境属性的宿主要传进来。 */
export function tokenLength(token: string, scope: Element = document.body): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${token});block-size:0;padding:0;border:0`
  scope.append(probe)
  const width = Number.parseFloat(getComputedStyle(probe).width)
  probe.remove()
  if (Number.isNaN(width))
    throw new Error(`令牌 ${token} 在此处解析不出长度`)
  return width
}

/** 令牌写进 property 后在 scope 处解出的计算值，与 getComputedStyle 读回的同一格式（颜色、投影、滤镜都行）。 */
export function tokenValue(property: string, token: string, scope: Element = document.body): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  scope.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

/** 定尺动作控件按下时的缩放倍率，与 getComputedStyle().scale 同一格式（缺省 '1'，即只换面）。 */
export function pressScale(scope: Element = document.documentElement): string {
  const value = getComputedStyle(scope).getPropertyValue('--xh-motion-scale-press').trim()
  if (!value)
    throw new Error('读不到 --xh-motion-scale-press：令牌样式没有加载')
  return value
}
