import React from 'react'
import { connect, mapProps, mapReadPretty } from '@formily/react'
import { debounce } from 'throttle-debounce'
import { Select as AntdSelect } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { PreviewText } from '@formily/antd-v5'

import {
  SELECT2_IDENTIFIER_NOMORE,
  SELECT2_IDENTIFIER_PROGRESS,
  deafultRequestInProgress,
  deafultRequestNoMore,
  defaultNotFoundContent,
} from './option-definition'

import type { BaseOptionType, DefaultOptionType, SelectProps } from 'antd/lib/select'
import type { ReactFC } from '@formily/react'

export { SELECT2_IDENTIFIER_NOMORE, SELECT2_IDENTIFIER_PROGRESS } from './option-definition'

/**
 * ISelect2Props 继承并覆写了 AntdSelectProps 接口
 */
export interface ISelect2Props<ValueType = any, OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType> extends SelectProps<ValueType, OptionType> {
  // 首次打开下拉框是否自动加载数据
  firstLoad?: boolean
  // 异步函数
  loadData?: (q: string, offset: number) => Promise<OptionType[]>
}

/**
 * @title 可搜索的 remote 选择器，支持滚动加载
 * @param { 后缀图标 } 可通过覆盖 suffixIcon 实现加载状态；也可以直接设置 loading 为 true 实现加载状态。选择后者。
 * @param { loadData } 异步加载选项列表
 *
 * @notice // NOTICE: 为什么没在加载时也显示loading，因为没滚动到底部时用户是看不到该选项，当滚动底部就触发了加载可以第一时间加载，没有抖动
 * @notice // NOTICE: 自定义该选项的样式: `option-identifier-*`
 * @notice // NOTICE: `filterOption={false}` => 必须关闭选项过滤 local 数据，而是通过 onSearch 过滤 remote 数据
 * @notice // NOTICE: `virtual={false}` => 关闭虚拟滚动，否则滚动无法监测触底
 * @notice // NOTICE: 首次打开下拉列表时触发搜索 => `((showSearch ? firstLoad : true) && open)`
 */
const InternalSelect2: React.FC<ISelect2Props> = (props) => {
  const {
    value,
    onChange,
    onDropdownVisibleChange,
    // suffixIcon,
    loading,
    showSearch = true,
    labelInValue = true,

    firstLoad,
    loadData,

    ...restProps
  } = props

  /**
   * @title 劫持 value 的 state，方便回显
   */
  const [internalValue, setInternalValue] = React.useState<any>(value)

  /**
   * @title 异步请求相关状态
   */
  const [stateInProgress, setStateInProgress] = React.useState<boolean>(false) // 是否正在请求中
  const [stateNoMore, setStateNoMore] = React.useState<boolean>(false) // 是否还有更多未加载
  const [options, setOptions] = React.useState<any[]>([]) // 存储选项列表

  /**
   * @title 滚动加载相关状态
   */
  const searchValueRef = React.useRef<string>('') // 存储当前搜索值，用于在下拉滚动时引用
  const prevOptionsLenRef = React.useRef<number>(0) // 存储上一次的选项长度，用于在下拉滚动时引用
  const popupScrollLockRef = React.useRef<boolean>(false) // 存储下拉滚动锁定状态，用于在下拉滚动时引用

  /**
   * @title 对 options 进行包装处理
   */
  const mergeOptions = React.useMemo<any[]>(() => {
    // 如果没有选项，则返回空数组；如果正在加载中，则返回加载选项
    if (options.length <= 0) {
      if (stateInProgress) {
        return options.concat({
          value: SELECT2_IDENTIFIER_PROGRESS,
          disabled: true,
          label: deafultRequestInProgress,
        })
      }
      return []
    }

    // 如果没有更多数据，给出描述
    if (stateNoMore) {
      return options.concat({
        className: 'option-identifier-nomore',
        value: SELECT2_IDENTIFIER_NOMORE,
        disabled: true,
        label: deafultRequestNoMore,
      })
    }

    // 如果正在请求中或者没在加载时，给出加载提示
    return options.concat({
      className: 'option-identifier-progress',
      value: SELECT2_IDENTIFIER_PROGRESS,
      disabled: true,
      label: deafultRequestInProgress,
    })
  }, [options, stateInProgress, stateNoMore])

  /**
   * @title 搜索框键入的防抖查询函数
   * @desc 重置选项列表；offset重置为0
   */
  const onSearchDebounceFetcher = React.useMemo(() => {
    const onSearch = async (q: string) => {
      searchValueRef.current = q

      try {
        setStateNoMore(false)
        setStateInProgress(true)
        setOptions([])

        const response = await loadData?.(q, 0)
        if (response && response.length > 0) {
          setOptions(response)
        }
      }
      catch (error) { }
      finally {
        setStateInProgress(false)
      }
    }

    return debounce(800, onSearch)
  }, [loadData])

  /**
   * @title 下拉列表滚动时的回调，增加静态锁 <触底操作只能等待异步函数完成之后才能再次触发>
   * @desc 往选项列表累加；offset 为上一次的 options 长度
   */
  const onPopupScrollLockFetcher = React.useCallback(async (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // 没有更多了，则无需触发滚动加载
    if (stateNoMore) { return }

    const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLDivElement
    // 容差值是为了避免由于浏览器像素差异等问题导致的误判
    const tolerance = 2
    // 滚动条滚动的距离(scrollTop) 大于 滚动区域的总高度(scrollHeight)与滚动区域可见部分的高度(clientHeight)的差值
    if (!(scrollTop > scrollHeight - clientHeight - tolerance)) {
      return
    }

    // 增加竞态锁
    if (popupScrollLockRef.current) { return }

    try {
      popupScrollLockRef.current = true
      setStateInProgress(true)

      const response = await loadData?.(searchValueRef.current, prevOptionsLenRef.current)
      if (response && response.length > 0) {
        setOptions(value => ([...value, ...response]))
      }
      else {
        setStateNoMore(true)
      }
    }
    catch (error) { }
    finally {
      popupScrollLockRef.current = false
      setStateInProgress(false)
    }
  }, [stateNoMore, loadData])

  /**
   * @title 劫持 onChange 方法
   */
  const internalChangeHandle = React.useCallback((value: any, option: any) => {
    // 外部存储字符串
    onChange?.(value, option)
    // 内部存储整个对象，用于回显
    setInternalValue(value)
  }, [onChange])

  /**
   * @title 劫持 onDropdownVisibleChange 方法
   */
  const internalDropdownVisibleChangeHandle = React.useCallback((open: boolean) => {
    onDropdownVisibleChange?.(open)

    // showSearch 开启时，根据 firstLoad 判断是否首次打开下拉列表时触发搜索
    // showSearch 未开启时，默认首次打开下拉列表时触发搜索
    if ((showSearch ? firstLoad : true) && open) {
      onSearchDebounceFetcher('')
    }
  }, [showSearch, firstLoad, onDropdownVisibleChange])

  /**
   * @title 监听
   */
  React.useEffect(() => {
    prevOptionsLenRef.current = options.length
  }, [options.length])

  return (
    <AntdSelect
      notFoundContent={defaultNotFoundContent}
      listHeight={200}
      {...restProps}
      filterOption={false}
      virtual={false}
      /* 以下属性经过包装处理 */
      labelInValue={labelInValue}
      // suffixIcon={stateInProgress ? <LoadingOutlined /> : suffixIcon}
      loading={stateInProgress || loading}
      value={internalValue}
      onChange={internalChangeHandle}
      options={mergeOptions}
      showSearch={showSearch}
      onSearch={showSearch ? onSearchDebounceFetcher : undefined}
      onDropdownVisibleChange={internalDropdownVisibleChangeHandle}
      onPopupScroll={onPopupScrollLockFetcher}
    />
  )
}

export const Select2: ReactFC<ISelect2Props<any, any>> = connect(
  InternalSelect2,
  mapProps(
    {
      dataSource: 'options',
      loading: true,
    },
    (props, field) => {
      const { suffixIcon, ...restProps } = props

      // 覆盖 loading和validating 时的 suffix
      const suffixIconRender = field?.['loading'] || field?.['validating']
        ? (
          <LoadingOutlined />
          )
        : (
            suffixIcon
          )

      return Object.assign({}, restProps, { suffixIcon: suffixIconRender })
    },
  ),
  mapReadPretty(PreviewText.Select),
)

export default Select2
