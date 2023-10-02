import type { ISchema } from '@formily/react'

// 常量: 便于组件内部与使用者保持统一
export const COMPONENT_FORM_COL_ITEM = 'FormColItem'

// 可覆盖该 definitions，此处没有任何属性的原因是: 默认值已在 Form 上定义，会透传到该 decorator 上。
// 优先级: FormItem's ISchema > Form's props
export const definitionFormColItem: ISchema = {
  'x-decorator': 'FormColItem',
  // NOTICE: 可覆写自定义 - Fold's field schema
  // 'x-decorator-props': {},
}
