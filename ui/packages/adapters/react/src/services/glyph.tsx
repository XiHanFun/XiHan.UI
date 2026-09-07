// 反馈服务默认模板用的装饰图形：加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担。
import type { ReactNode } from 'react'

/** 旋转的加载弧线；转动动画由外层容器（如 XhButtonIndicator）或自带样式提供。 */
export function spinArc(size = '1em'): ReactNode {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <circle
        cx={8}
        cy={8}
        r={6.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="30"
        strokeDashoffset="22"
      />
    </svg>
  )
}
