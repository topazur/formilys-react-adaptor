import React from 'react'
import { Select as AntdSelect } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { connect, mapProps, mapReadPretty, useExpressionScope } from '@formily/react'
import { PreviewText } from '@formily/antd-v5/lib/preview-text'

import type { ReactFC } from '@formily/react'
import type { SelectProps as AntdSelectProps } from 'antd'
import type { IFormatter } from '../type'

// 可被覆盖的属性
const defaultCoverableProps: AntdSelectProps = {
  style: { flex: 'none', width: '100px' },
  listHeight: 256, // 设置弹窗滚动高度
  disabled: false, // 禁用
  placeholder: '', // 选择框默认文本
  allowClear: false, // 自定义清除按钮
  mode: undefined, // 单选
  showSearch: false, // 不显示搜索按钮
}

// 不可被覆盖的属性
const defaultNotCoveredProps: AntdSelectProps = {
  virtual: false, // 关闭虚拟滚动
  labelInValue: true, // 把 Select 的 value 类型从 string 变为对象格式
}

// 选择器 value 的类型，仅在劫持内部使用
interface ValueType {
  label: React.ReactNode
  value: string
}

/**
 * IQueryItemSelectProps 继承并覆写了 AntdSelectProps 接口
 */
export interface IQueryItemSelectProps extends Omit<AntdSelectProps, 'options' | 'defaultValue' | 'value' | 'onChange' | 'optionRender' | 'onSelect' | 'onDeselect' | 'filterOption' | 'filterSort'> {
  hideSelectedOption?: boolean// 是否隐藏已选择选项

  options?: string[] // 覆写属性: 仅传递 value，label 通过 formatter 来格式化
  // defaultValue?: string | null;// 覆写属性的类型 (删除该属性)
  value?: string | null// 覆写属性的类型
  onChange?: (value: string) => void// 覆写属性的类型
}

/**
 * @title 目标是同时翻译 label 和 value & 隐藏已选中的选项。
 * @method {❌单独使用optionRender属性} => 只能针对 DropDown 中的 Option，而无法对 value 格式化展示
 * @method {❌遍历生成 Option 组件，通过style隐藏已选中的选项} => 可能由于高度不正确，rc-virtual-list.ScrollTo 抛出警告
 * @method {❌使用dropdownRender} => 无法抛弃virtual的相关dom；全部重写的话还要处理选中事件等操作
 * @method {❌使用mode="combobox"和getInputElement回显value} => 需要额外处理事情较多；这个属性被 antd 禁止，强行使用可能会出问题
 * @method {❌通过getRawInputElement替换input} => 无法复写value；这个属性被 antd 禁止，强行使用可能会出问题
 * @method {✅劫持value和onChange方法} => 通过劫持可以保持外部是 string 类型，内部却是对象类型（可直接回显）
 */
const InternalQueryItemSelect: React.FC<IQueryItemSelectProps> = (props) => {
  const {
    hideSelectedOption,

    options,
    value,
    onChange,
    ...restProps
  } = props

  // 自定义格式化展示方法，可针对 value和option 格式化展示
  const { formatter }: { formatter: IFormatter } = useExpressionScope()

  /**
   * @title 劫持 value 的 state，方便回显
   */
  const [internalValue, setInternalValue] = React.useState<ValueType | undefined | null>(value
    ? {
        value,
        label: formatter('operator', value, -1),
      }
    : null)

  /**
   * @title 先过滤已选中的选项(通过 hideSelectedOption 控制)，再转化 options 的数据结构
   */
  const internalOptions = React.useMemo<ValueType[] | undefined>(() => {
    return options
      ?.filter((item) => {
        // 隐藏已选中的选项
        if (hideSelectedOption && (item === value)) {
          return false
        }
        return true
      })
      ?.map((item) => {
        return {
          value: item,
          label: item,
        }
      })
  }, [options, value, hideSelectedOption])

  /**
   * @title 自定义渲染下拉选项
   */
  const internalOptionRender = React.useCallback((oriOption, info) => {
    const { value } = oriOption as ValueType

    return formatter('operator', value, info.index)
  }, [formatter])

  /**
   * @title 劫持 onChange 方法
   */
  const internalChangeHandle = React.useCallback((value: ValueType, option: ValueType[]) => {
    const { value: valueStr } = value

    // 外部存储字符串，只需要value即可
    onChange?.(valueStr)
    // 内部存储整个对象，用于回显
    setInternalValue({
      ...value,
      label: formatter('operator', valueStr, -1),
    })
  }, [onChange])

  return (
    <AntdSelect<ValueType>
      {...defaultCoverableProps}
      {...restProps}
      {...defaultNotCoveredProps}
      value={internalValue}
      options={internalOptions}
      optionRender={internalOptionRender}
      onChange={internalChangeHandle}
    />
  )
}

/***********************************************************************/
/***********************************************************************/

/**
 * @title 主要用于对第三方组件库的无侵入接入 Formily
 * @docs https://react.formilyjs.org/zh-CN/api/shared/connect
 */
export const QueryItemSelect: ReactFC<IQueryItemSelectProps> = connect(
  InternalQueryItemSelect,
  mapProps(
    {
      // 手动映射dataSource到自定义组件中
      dataSource: 'options',
      loading: true,
    },
    (props, field) => {
      const { options, suffixIcon } = props

      // NOTICE: 当可选用的操作符小于等于1时，隐藏该选择器的UI，但是保留数据
      if (options && options.length <= 1) {
        field.hidden = true
      }

      // 覆盖 loading和validating 时的 suffix
      const suffixIconRender = field?.['loading'] || field?.['validating']
        ? (
          <LoadingOutlined />
          )
        : (
            suffixIcon
          )

      return Object.assign({}, props, { suffixIcon: suffixIconRender })
    },
  ),
  mapReadPretty(PreviewText.Select),
)

export default QueryItemSelect
