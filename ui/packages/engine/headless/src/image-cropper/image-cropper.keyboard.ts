/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image cropper 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 没有裁切这个模式。裁切框是一个二维的滑块：整块可以在图片里推来推去，
// 八个把手各自推一条边或一个角，键盘约定因此照滑块那一套——方向键走一格、修饰键走一大格。
// 方向键跟随屏幕上的视觉方向：图片转了、翻了，框在屏幕上往哪边挪，按的就是哪个键。
// 两颗翻转按钮是原生 button，键盘约定取自 APG 的按钮模式（toggle button）。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction'

export const imageCropperKeyboard: KeyboardTable = {
  component: 'image-cropper',
  source: APG,
  rows: [
    { id: 'image-cropper.kbd.move', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: 'focus on crop-area, 未禁用且非只读', does: '裁切框沿屏幕方向整体平移一个自然像素，尺寸不变；旋转取最近的直角、翻着的轴反向换算到图片上；走到图片边界就停住' },
    { id: 'image-cropper.kbd.move-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus on crop-area, 未禁用且非只读', does: '同上，一次走十个自然像素' },
    { id: 'image-cropper.kbd.resize', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: 'focus on crop-handle, 未禁用且非只读', does: '这个把手负责的那条边或那个角沿屏幕方向挪一个自然像素，对面那条边钉住不动；锁了比例时另一条边跟着算' },
    { id: 'image-cropper.kbd.resize-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus on crop-handle, 未禁用且非只读', does: '同上，一次走十个自然像素' },
    { id: 'image-cropper.kbd.flip', keys: ['Enter', 'Space'], when: 'focus on flip-trigger, 未禁用', does: '翻转这颗按钮管的那条轴，aria-pressed 随之翻转；按钮是原生 button，这两个键由平台翻成 click' },
    { id: 'image-cropper.kbd.flip-press', keys: ['Enter', 'Space'], when: 'held in flip-trigger, 未禁用', does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下' },
    { id: 'image-cropper.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '未禁用', does: '裁切框、八个把手、两条滑杆与翻转按钮各占一个 Tab 停靠点，按文档序依次走过' },
  ],
}
