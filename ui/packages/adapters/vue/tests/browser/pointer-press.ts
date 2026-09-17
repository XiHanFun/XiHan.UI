// 真实主键按住 / 松开拆开派的公共装置：按住的中间帧（:active 面）要真实的 mousedown 才看得见。
//
// 坐标走 CDP，而 CDP 的坐标系是外层页面的：vitest 把测试文档装在一个按比例缩放的 iframe 里，
// 元素在自己文档里量到的 clientX / clientY 要先按 iframe 在外层页面的位置与缩放换算，
// 否则离左上角越远落点偏得越多，压到别的行上或干脆落到 body。
import { cdp } from '@vitest/browser/context'

/** 元素中心在外层页面（CDP 坐标系）里的位置。 */
function centerOf(element: HTMLElement): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const frame = window.frameElement?.getBoundingClientRect()
  if (!frame)
    return { x, y }
  return {
    x: frame.left + x * (frame.width / window.innerWidth),
    y: frame.top + y * (frame.height / window.innerHeight),
  }
}

/** 主键在元素中心按下并按住：随后可以读到它的 :active 面。 */
export async function pressPointer(element: HTMLElement): Promise<void> {
  const { x, y } = centerOf(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
}

/** 在元素中心松开主键：合成一次完整的 click。 */
export async function releasePointer(element: HTMLElement): Promise<void> {
  const { x, y } = centerOf(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
}
