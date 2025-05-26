import { defineComponent } from 'vue'
import { uploadProps } from './interface'
import type { UploadProps } from './interface'

export default defineComponent({
  name: 'Upload',
  props: uploadProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-upload">
        {slots.default?.()}
      </div>
    )
  }
})
