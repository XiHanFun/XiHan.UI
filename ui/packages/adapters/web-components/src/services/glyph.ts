// 命令式服务默认模板用的装饰图形：加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担。

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 旋转的加载弧线；转动动画由外层容器（如按钮的 indicator 部件）提供。 */
export function spinArc(size = '1em'): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('width', size)
  svg.setAttribute('height', size)
  svg.setAttribute('aria-hidden', 'true')
  svg.style.display = 'block'

  const circle = document.createElementNS(SVG_NS, 'circle')
  circle.setAttribute('cx', '8')
  circle.setAttribute('cy', '8')
  circle.setAttribute('r', '6.5')
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', 'currentColor')
  circle.setAttribute('stroke-width', '2')
  circle.setAttribute('stroke-linecap', 'round')
  circle.setAttribute('stroke-dasharray', '30')
  circle.setAttribute('stroke-dashoffset', '22')
  svg.appendChild(circle)
  return svg
}
