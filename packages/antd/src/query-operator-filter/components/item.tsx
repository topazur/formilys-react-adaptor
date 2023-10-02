import React from 'react'
import { Space as AntdSpace } from 'antd'
import { FormItem as AntdFormItem } from '@formily/antd-v5'

import type { SpaceCompactProps } from 'antd/lib/space/Compact'
import type { IFormItemProps } from '@formily/antd-v5'

/**
 * IQueryItemProps 合并了 IFormItemProps 和 IFormItemProps 接口
 */
export interface IQueryItemProps {
  formItem?: IFormItemProps
  spaceCompact?: SpaceCompactProps
}

/**
 * @title 容器组件，同时包含 FormItem 和 Space.Compact 组件
 * @desc For 'x-decorator'
 */
export const QueryItem: React.FC<React.PropsWithChildren<IQueryItemProps>> = (props) => {
  const { formItem, spaceCompact, children } = props

  return (
    <AntdFormItem {...formItem}>
      <AntdSpace.Compact {...spaceCompact}>
        {children}
      </AntdSpace.Compact>
    </AntdFormItem>
  )
}

export default QueryItem
