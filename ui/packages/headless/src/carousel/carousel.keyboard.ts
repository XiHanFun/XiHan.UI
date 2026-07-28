import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/#keyboardinteraction'

// 键盘全在根节点上收口：两端按钮与指示点都在它之内，焦点落在其中任何一个上，
// 方向键都该翻页。轮播不做 roving tabindex——每个按钮各占一个 Tab 位，
// 用户要能直接 Tab 到某个指示点再按 Enter 跳过去。
export const carouselKeyboard: KeyboardTable = {
  component: 'carousel',
  source: APG,
  rows: [
    { id: 'carousel.kbd.next', keys: ['ArrowRight'], when: 'orientation=horizontal，焦点在轮播内', does: '翻到下一页；rtl 下反向（走上一页）' },
    { id: 'carousel.kbd.prev', keys: ['ArrowLeft'], when: 'orientation=horizontal，焦点在轮播内', does: '翻到上一页；rtl 下反向（走下一页）' },
    { id: 'carousel.kbd.next-vertical', keys: ['ArrowDown'], when: 'orientation=vertical，焦点在轮播内', does: '翻到下一页；横轨下不接管，放行给页面滚动' },
    { id: 'carousel.kbd.prev-vertical', keys: ['ArrowUp'], when: 'orientation=vertical，焦点在轮播内', does: '翻到上一页；横轨下不接管，放行给页面滚动' },
    { id: 'carousel.kbd.first', keys: ['Home'], when: '焦点在轮播内', does: '跳到第一页' },
    { id: 'carousel.kbd.last', keys: ['End'], when: '焦点在轮播内', does: '跳到最后一页' },
    { id: 'carousel.kbd.trigger', keys: ['Enter', 'Space'], when: '焦点在上一张 / 下一张按钮上', does: '翻一页；由原生按钮的激活行为负责' },
    { id: 'carousel.kbd.indicator', keys: ['Enter', 'Space'], when: '焦点在指示点上', does: '跳到该指示点对应的页；由原生按钮的激活行为负责' },
    { id: 'carousel.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '任意时刻', does: '在两端按钮与各指示点之间逐个停靠；到端点后禁用的按钮自动脱序' },
    { id: 'carousel.kbd.editable', keys: ['方向键'], when: '焦点在幻灯片内的输入控件上', does: '不接管：交还给控件自己做光标移动' },
  ],
}
