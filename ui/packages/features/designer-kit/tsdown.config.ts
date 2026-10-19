import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  entry: {
    'index': 'src/index.ts',
    'field-inference': 'src/field-inference.ts',
    'properties': 'src/properties.ts',
    'schema': 'src/schema.ts',
  },
})
