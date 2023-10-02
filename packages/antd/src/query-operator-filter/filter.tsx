import React from 'react'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Form as AntdForm, FormGrid as AntdFormGrid, FormButtonGroup, Reset, Submit } from '@formily/antd-v5'

import { QueryItem, QueryItemButton, QueryItemSelect } from './components'
import { generateSchema } from './utils/schema-generate'

import type { Form } from '@formily/core'
import type { ISchema } from '@formily/react'
import type { FormProps as AntdFormProps } from '@formily/antd-v5'
import type { IFormatter } from './type'
import type { IColumnCondition } from './utils/convert-result'
import type { IQueryFieldItem } from './utils/schema-generate'

/**
 * IQueryOperatorFilterProps 继承并覆写了 AntdFormProps 接口
 */
export interface IQueryOperatorFilterProps<ValueType extends object = any> extends Omit<AntdFormProps, 'form'> {
  // 覆写 form 实例，改成必传属性
  form: Form<ValueType>

  // 传入的 Field 组件列表
  components?: { [key: string]: React.FC }
  definitions?: Record<string, ISchema>
  definitionFields?: IQueryFieldItem[] // local
  conditions?: IColumnCondition[] // remote

  // 覆盖按钮组
  buttonSumbit?: string | false
  buttonReset?: string | false
  onReset?: () => void
  buttonManage?: string | false
  onManageChange?: () => void

  // 表达式格式化函数
  formatter?: IFormatter
}

/**
 * @title 通用 Form 组件，单个Item包含了 字段名、操作符和输入控件。
 * @idea 交互形式参考: https://yunxiao.aliyun.com
 */
export const QueryOperatorFilter: React.FC<IQueryOperatorFilterProps> = (props) => {
  const {
    form,

    components,
    definitions,
    definitionFields,
    conditions,

    buttonSumbit = '查询',
    buttonReset = '重置',
    onReset,
    buttonManage = '管理条件',
    onManageChange,

    formatter = (type: string, key: string, idx: number) => key,
    onAutoSubmit = console.log,
    onAutoSubmitFailed = console.log,

    ...restProps
  } = props

  const SchemaField = createSchemaField({
    // 组件列表
    components: Object.assign({}, components, {
      QueryGrid: AntdFormGrid,
      QueryItem,
      QueryItemButton,
      QueryItemSelect,
    }),
    // 协议表达式作用域，用于实现协议表达式变量注入
    // Schema 的每个属性都能使用字符串表达式{{expression}}，表达式变量可以从 createSchemaField 中传入，也可以从 SchemaField 组件中传入
    // https://react.formilyjs.org/zh-CN/api/shared/schema#内置表达式作用域
    scope: { formatter },
  })

  /**
   * @title 生成 ISchema 传递给 SchemaField 组件
   * @param definitions https://react.formilyjs.org/zh-CN/api/shared/schema#详细说明
   * @param schemas 业务定义字段配置
   */
  const schema = React.useMemo(() => {
    // 仅筛选出服务端存储的字段并渲染，其他字段会被过滤掉
    const remoteFields = conditions?.map((cond) => {
      const { field } = cond

      const currentField = definitionFields?.find(item => item.field === field)
      // 本地也没找到对应的field，表示是非法字段
      if (!currentField) { return { field: '', operatorOptions: [] } }

      return { field, operatorOptions: currentField.operatorOptions }
    })?.filter(cond => !!cond.field)

    return generateSchema(definitions, remoteFields)
  }, [definitions, definitionFields, conditions])

  return (
    <FormProvider form={form}>
      <AntdForm
        {...restProps}
        form={form}
        // 回车提交事件回调
        onAutoSubmit={onAutoSubmit}
        // 回车提交校验失败事件回调
        onAutoSubmitFailed={onAutoSubmitFailed}
      >
        {/* JSON Schema Field */}
        <SchemaField schema={schema} />

        {/* 按钮组 */}
        <FormButtonGroup
          className='ant-formily-operator-button-group'
          style={{ display: 'flex', width: '100%' }}
          align="right"
        >
          {buttonSumbit && <Submit>{buttonSumbit}</Submit>}
          {buttonReset && <Reset onClick={onReset}>{buttonReset}</Reset>}
          {buttonManage && <Button
            type="default"
            icon={<PlusOutlined />}
            size='middle'
            onClick={onManageChange}
          >{buttonManage}</Button>}
        </FormButtonGroup>
      </AntdForm>
    </FormProvider>
  )
}

export default QueryOperatorFilter
