import { useEffect, useLayoutEffect } from 'react'

/**
 * 排在提交之后、浏览器绘制之前的效应；服务端渲染没有提交，换成永不执行的 useEffect 避开警告。
 *
 * 离场上报必须用它：React 对被删子树的 passive 清理排在 DOM 摘除之后，
 * 那时焦点已经掉回 body，「本节点当下正持有焦点」这个守卫恒不成立，事件一次都发不出去。
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
