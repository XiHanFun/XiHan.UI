/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use image 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ImageApi, ImageSchema } from '@xihan-ui/headless'
import { connectImage, imageMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ImageContext {
  service: Service<ImageSchema>
  api: ImageApi
}

export function useImage(props: ImageSchema['props']): ImageContext {
  const service = useMachine(imageMachine, () => props)
  return { service, api: connectImage(service, reactNormalize) }
}
