import { COMPONENT_FORM_COL_ITEM, definitionFormColItem } from './schema-definition'

import type { ISchema } from '@formily/react'

/**
 * @title 生成 ISchema 传递给 SchemaField 组件
 * @param definitions https://react.formilyjs.org/zh-CN/api/shared/schema#详细说明
 * @param fields 业务定义字段配置
 */
export function generateSchema(definitions?: Record<string, ISchema>, schemas?: ISchema[]): ISchema {
  const mergeDefinitions: Record<string, ISchema> = {
    [COMPONENT_FORM_COL_ITEM]: definitionFormColItem,
    // NOTICE: 可覆写自定义 - Operator's props to modify definitions schema
    ...definitions,
  }

  // 计算 Item 集合
  const properties = schemas?.reduce<Record<string, ISchema>>((previousValue, currentValue, currentIndex) => {
    if (!currentValue.name) {
      return previousValue
    }

    // 剔除这两个属性，防止被外部传入的覆盖
    const { $ref, 'x-data': data, ...resetValue } = currentValue
    const payload = {
      [currentValue.name]: {
        // 指定 Schema 预定义，在解析时预定义的内容会被传入的属性覆盖；但是在定义阶段 $ref 不能被覆盖，只能去修改 definitions。
        '$ref': `#/definitions/${COMPONENT_FORM_COL_ITEM}`,
        // 增加索引(从1开始)，便于计算显隐
        'x-data': { ...data, idx: currentIndex + 1 },
        ...resetValue,
      },
    }
    return Object.assign(previousValue, payload)
  }, {})

  return {
    definitions: mergeDefinitions,
    type: 'object',
    properties,
  }
}
