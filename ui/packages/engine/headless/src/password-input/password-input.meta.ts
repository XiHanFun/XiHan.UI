/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 password input 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 缺省则三个视觉轴与整体状态无处安放；没有 input 就没有要输入的东西；
// 少了切换钮，这个组件与一个 type=password 的文本框没有区别。
// control 只是把三件收进同一个视觉盒，缺了它各部件仍各自成立，故不列为必需。
export const passwordInputMeta: ComponentMeta = {
  component: 'password-input',
  requiredParts: ['root', 'input', 'visibility-trigger'],
}
