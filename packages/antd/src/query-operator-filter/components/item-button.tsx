import React from 'react'
import { Button as AntdButton, Tooltip as AntdTooltip } from 'antd'
import { useExpressionScope } from '@formily/react'
import { usePrefixCls, useToken } from '@formily/antd-v5/lib/__builtins__'
import { useOverflow } from '@formily/antd-v5/lib/form-item/hooks'

import type { ButtonProps as AntdButtonProps } from 'antd'
import type { IFormatter } from '../type'

/**
 * IQueryItemButtonProps 继承并覆写了 AntdButtonProps 接口
 */
export interface IQueryItemButtonProps extends AntdButtonProps {
  field?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * @title 字段名显示组件 (继承disable禁用状态下的样式、适配主题色、超出隐藏、tooltip)
 */
export const QueryItemButton: React.FC<IQueryItemButtonProps> = (props) => {
  const {
    field,
    align = 'left',
    style,
    ...restProps
  } = props

  // 自定义格式化展示方法，可针对 字段名 格式化展示
  const { formatter }: { formatter: IFormatter } = useExpressionScope()

  // 样式前缀: antd's prefixCls + formily's tag
  const prefixCls = usePrefixCls('formily-item', props)
  const { token } = useToken()
  // 计算 Button 内容的样式 (内置样式可被覆盖; align决定文本对齐方向; 覆盖disabled下的背景色和文本颜色，使用当前主题的默认颜色)
  const oStyle = React.useMemo<React.CSSProperties>(() => {
    return Object.assign(
      { flex: 'none', width: '110px', cursor: 'default' },
      style,
      { textAlign: align, backgroundColor: token.colorBgContainer, color: token.colorText },
    )
  }, [token, style, align])

  /***********************************************************************/
  /***********************************************************************/

  const tooltipNode = React.useMemo(() => {
    return field ? formatter('tooltip', field, -1) : null
  }, [field, formatter])
  // 计算 Button 内文本是否超出
  const { containerRef, contentRef, overflow } = useOverflow<
    HTMLDivElement,
    HTMLSpanElement
  >()
  // 内部 Div 容器是专门用于计算 Button 内文本是否超出而设置的，由于 Button 存在 padding 不能直接把 ref 传给 Button
  const overflowChildren = (
    <AntdButton {...restProps} disabled={true} style={oStyle}>
      <div className={`${prefixCls}-label-content`} ref={containerRef}>
        <span ref={contentRef}>
          {field ? formatter('field', field, -1) : null}
        </span>
      </div>
    </AntdButton>
  )
  // 计算 tooltip dom
  const getOverflowTooltip = () => {
    if (overflow) {
      return (
        <div>
          <div>{field ? formatter('field', field, -1) : null}</div>
          {tooltipNode && <div>{tooltipNode}</div>}
        </div>
      )
    }

    // 没有超出只显示可能存在的tooltip
    return tooltipNode
  }

  // 业务传入的tooltip 或者 文本超出
  if (!!tooltipNode || overflow) {
    return (
      <AntdTooltip placement="top" title={getOverflowTooltip()}>
        {overflowChildren}
      </AntdTooltip>
    )
  }
  return overflowChildren
}

export default QueryItemButton
