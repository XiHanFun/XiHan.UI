import { createAnatomy } from '@xihan-ui/kernel'

export const toastAnatomy = createAnatomy('toast', [
  'root',
  'title',
  'description',
  'action-trigger',
  'close-trigger',
])
