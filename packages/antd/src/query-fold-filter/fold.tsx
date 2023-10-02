import React from 'react'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button as AntdButton, Col as AntdCol, Row as AntdRow } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Form as AntdForm, FormItem as AntdFormItem, FormButtonGroup, Reset, Submit } from '@formily/antd-v5'

import { FormColItem } from './components/col'
import { generateSchema } from './utils/schema-generate'

import type { Form } from '@formily/core'
import type { ISchema } from '@formily/react'
import type { RowProps } from 'antd'
import type { FormProps as AntdFormProps, IFormItemProps } from '@formily/antd-v5'

/**
 * IQueryOperatorFilterProps 继承并覆写了 AntdFormProps 接口
 */
export interface IQueryFoldFormProps<ValueType extends object = any> extends Omit<AntdFormProps, 'form'> {
  // 覆写 form 实例，改成必传属性
  form: Form<ValueType>

  // 传入的 Field 组件列表
  components?: { [key: string]: React.FC }
  definitions?: Record<string, ISchema>
  schemas?: ISchema[]

  // 默认的折叠状态
  defaultCollapsed?: boolean
  // 每行的最大列数量
  maxColumns?: number
  // 覆盖栅格 Row 组件属性
  rowProps?: RowProps

  // 覆盖按钮组 FormItem 组件属性
  buttonGroup?: IFormItemProps
  buttonSumbit?: string | false
  buttonReset?: string | false
  onReset?: () => void
  buttonFold?: [string, string]
}

/**
 * @title 通用 Form 组件，通过栅格实现展开收起的功能。
 * @method {❌ FormGrid} => 该组件使用了 observer，且 shouldVisible 判断显隐逻辑复杂；Form的参数无法透传到FormItem上。
 * @method {✅ 使用 antd 栅格布局} => 按钮组自动撑满，逻辑简单，且Form的参数可以透传到FormItem上。
 * @todo 该版本需求是收起时只显示一行，如果想要收起时显示多行则需迭代新功能。
 * @idea 交互形式参考: https://procomponents.ant.design/components/query-filter
 */
export const QueryFoldForm: React.FC<React.PropsWithChildren<IQueryFoldFormProps>> = (props) => {
  const {
    form,

    components,
    definitions,
    schemas,

    defaultCollapsed = true,
    maxColumns = 3,
    rowProps,

    buttonGroup,
    buttonSumbit = '查询',
    buttonReset = '重置',
    buttonFold = ['展开', '收起'],
    onReset,

    onAutoSubmit = console.log,
    onAutoSubmitFailed = console.log,

    ...restProps
  } = props

  // 折叠状态
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  const SchemaField = createSchemaField({
    // 组件列表
    components: Object.assign({ FormColItem }, components),
    scope: {
      collapsed,
      maxColumns,
    },
  })

  /**
   * @title 生成 ISchema 传递给 SchemaField 组件
   * @param definitions https://react.formilyjs.org/zh-CN/api/shared/schema#详细说明
   * @param schemas 业务定义字段配置
   */
  const schema = React.useMemo(() => {
    return generateSchema(definitions, schemas)
  }, [definitions, schemas])

  return (
    <FormProvider form={form}>
      <AntdForm
        layout="vertical"
        colon={false}
        feedbackLayout="terse"
        size='default'
        // NOTICE: 可覆写自定义 - Fold's props
        {...restProps}
        form={form}
        // 回车提交事件回调
        onAutoSubmit={onAutoSubmit}
        // 回车提交校验失败事件回调
        onAutoSubmitFailed={onAutoSubmitFailed}
      >
        <AntdRow
          wrap={true}
          gutter={[20, 0]}
          justify="start"
          align="bottom"
          // NOTICE: 可覆写自定义 - Fold's props
          {...rowProps}
        >
          {/* json schema */}
          <SchemaField schema={schema} />

          {/* 按钮组: 一直显示、默认撑满剩余列、当数量小于maxColumns时无需折叠按钮 */}
          <AntdCol flex="auto">
            <AntdFormItem
              // NOTICE: 可覆写自定义 - Fold's props
              {...buttonGroup}
            >
              <FormButtonGroup
                className='ant-formily-fold-button-group'
                style={{ display: 'flex', width: '100%' }}
                align="right"
              >
                {buttonSumbit && <Submit>{buttonSumbit}</Submit>}
                {buttonReset && <Reset onClick={onReset}>{buttonReset}</Reset>}
                {
                  buttonFold && schemas && schemas.length >= maxColumns
                  && <AntdButton
                    type="link"
                    style={{ paddingLeft: 5, paddingRight: 5 }}
                    onClick={() => setCollapsed(value => !value)}
                  >
                    {
                      collapsed
                        ? (<React.Fragment>
                          {buttonFold[0]}
                          <DownOutlined />
                        </React.Fragment>)
                        : (<React.Fragment>
                          {buttonFold[1]}
                          <UpOutlined />
                        </React.Fragment>)
                    }
                  </AntdButton>
                }
              </FormButtonGroup>
            </AntdFormItem>
          </AntdCol>
        </AntdRow>
      </AntdForm>
    </FormProvider>
  )
}
