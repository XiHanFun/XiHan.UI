/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 layout effect 相关实现。

import { useEffect, useLayoutEffect } from 'react'

/**
 * 排在提交之后、浏览器绘制之前的效应；服务端渲染没有提交，替换为永不执行的 useEffect 以避开警告。
 *
 * 离场上报必须使用它：React 对被删子树的 passive 清理排在 DOM 移除之后，
 * 此时焦点已经回落到 body，本节点当前持有焦点这一守卫恒不成立，事件一次都无法发出。
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
