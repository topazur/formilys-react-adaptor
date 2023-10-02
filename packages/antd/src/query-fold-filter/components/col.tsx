import React from 'react'
import { useExpressionScope, useField } from '@formily/react'
import { Col as AntdCol } from 'antd'
import { FormItem as AntdFormItem } from '@formily/antd-v5'

import type { ColProps } from 'antd'
import type { IFormItemProps } from '@formily/antd-v5'

/**
 * IFormColItemProps 继承了 IFormItemProps 接口
 */
export interface IFormColItemProps extends IFormItemProps {
  getColProps?: (opts: { collapsed: boolean; maxColumns: number }) => ColProps
}

/**
 * @title 容器组件，同时包含 Col 和 FormItem 组件
 * @desc For 'x-decorator'
 */
export const FormColItem: React.FC<React.PropsWithChildren<IFormColItemProps>> = (props) => {
  const {
    // 子元素
    children,
    // 组件 Col 的属性
    getColProps,
    // 组件 FormItem 的属性
    ...restProps
  } = props

  const filed = useField() // 当前字段
  const { collapsed, maxColumns }: { collapsed: boolean; maxColumns: number } = useExpressionScope() // scope传递的值

  /**
   * @title 根据 maxColumns 计算 Col 组件的属性
   */
  const colProps = React.useMemo<ColProps>(() => {
    if (getColProps) { return getColProps({ collapsed, maxColumns }) }
    return {
      order: 0,
      pull: 0,
      push: 0,
      offset: 0,
      span: 24 / maxColumns,
    }
  }, [collapsed, maxColumns])

  /**
   * @title 计算折叠后隐藏的 Col 组件，给予 `display:none` 的样式
   */
  const style = React.useMemo<React.CSSProperties>(() => {
    const { idx } = filed.data as { idx: number }

    // 当收缩成一行时，仅显示 maxColumns-1 个 FormItem，剩余一个由 ButtonGroup 占据
    if (collapsed && idx > maxColumns - 1) { return { display: 'none' } }
    return {}
  }, [filed.data, collapsed, maxColumns])

  return (
    <AntdCol
      // NOTICE: 可覆写自定义 - Fold's field schema
      {...colProps}
      style={style}
    >
      <AntdFormItem
        // NOTICE: 可覆写自定义 - Fold's field schema
        {...restProps}
      >
        {children}
      </AntdFormItem>
    </AntdCol>
  )
}
