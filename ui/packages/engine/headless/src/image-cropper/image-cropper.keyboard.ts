import type { KeyboardTable } from '../spec/types'

// APG 没有裁切这个模式。裁切框是一个二维的滑块：整块可以在图片里推来推去，
// 八个把手各自推一条边或一个角，键盘约定因此照滑块那一套——方向键走一格、修饰键走一大格。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction'

export const imageCropperKeyboard: KeyboardTable = {
  component: 'image-cropper',
  source: APG,
  rows: [
    { id: 'image-cropper.kbd.move', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: 'focus on crop-area, 未禁用且非只读', does: '裁切框整体平移一个自然像素，尺寸不变；走到图片边界就停住' },
    { id: 'image-cropper.kbd.move-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus on crop-area, 未禁用且非只读', does: '同上，一次走十个自然像素' },
    { id: 'image-cropper.kbd.resize', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: 'focus on crop-handle, 未禁用且非只读', does: '这个把手负责的那条边或那个角挪一个自然像素，对面那条边钉住不动；锁了比例时另一条边跟着算' },
    { id: 'image-cropper.kbd.resize-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus on crop-handle, 未禁用且非只读', does: '同上，一次走十个自然像素' },
    { id: 'image-cropper.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '未禁用', does: '裁切框与八个把手各占一个 Tab 停靠点，按文档序依次走过' },
  ],
}
