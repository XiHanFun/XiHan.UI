/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use carousel 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CarouselApi, CarouselSchema } from '@xihan-ui/headless'
import { carouselMachine, connectCarousel } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CarouselContext {
  service: Service<CarouselSchema>
  api: CarouselApi
}

export function useCarousel(props: CarouselSchema['props']): CarouselContext {
  // 根与视口带 id：用 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(carouselMachine, () => props, { scope: useReactScope() })
  return { service, api: connectCarousel(service, reactNormalize) }
}
