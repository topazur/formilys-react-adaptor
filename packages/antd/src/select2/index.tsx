import React from 'react'
import { isArr, isEmpty } from '@formily/shared'
import { connect, mapProps, mapReadPretty } from '@formily/react'
import { useControllableValue, useDebounceFn, useGetState, useLockFn, useMemoizedFn } from 'ahooks'
import { Select as AntdSelect } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { PreviewText } from '@formily/antd-v5'

import {
  SELECT2_ABORT_REASON,
  defaultNotFoundContent,
} from './option-definition'
import { useAbortController, useMergeOptions } from './hooks'

import type { ReactFC } from '@formily/react'
import type { BaseOptionType, DefaultOptionType, SelectProps } from 'antd/lib/select'

export { SELECT2_ABORT_REASON, SELECT2_IDENTIFIER_NOMORE, SELECT2_IDENTIFIER_PROGRESS } from './option-definition'

/**
 * ISelect2Props 继承并覆写了 AntdSelectProps 接口
 */
export interface ISelect2Props<ValueType = any, OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType> extends SelectProps<ValueType, OptionType> {
  // 首次打开下拉框是否自动加载数据
  firstLoad?: boolean
  // 异步函数
  loadData?: (signal: AbortSignal, opts: { q: string; offset: number }) => Promise<any[]>
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
 *
 * @notice // NOTICE: 首次打开下拉列表时触发搜索 => 可搜索：`showSearch && innerOpen && firstLoad`；每次打开都要重新搜索，因为 search值 可能已改变，保存的选项可能不正确
 * @notice // NOTICE: 首次打开下拉列表时触发搜索 => 不可搜索：`!showSearch && innerOpen && getOptions().length <= 0`；不可搜索时没有 search值 的影响，可以保留上次请求结果
 *
 * @notice // NOTICE: 当搜索框有值时，直接关闭弹窗，此时也会触发 onSearch 搜索，search值为空。这里阻止掉该情况
 */
function InternalSelect2<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>(props: ISelect2Props<ValueType, OptionType>) {
  const {
    /* 默认值 */
    listHeight = 200,
    listItemHeight = 24,
    labelInValue = true,
    showSearch = true,
    notFoundContent = defaultNotFoundContent,

    /* 劫持 */
    // suffixIcon,
    loading,
    onSearch,
    onDropdownVisibleChange,

    /* 自定义异步加载 */
    firstLoad = true,
    loadData,

    ...restProps
  } = props

  /**
   * @title 劫持 value 的 state，方便回显
   * @desc 需要组件的状态既可以自己管理，也可以被外部控制
   */
  const [innerValue, setInnerValue] = useControllableValue<any>(props, {
    defaultValue: null,
    defaultValuePropName: 'defaultValue',
    valuePropName: 'value',
    trigger: 'onChange',
  })

  /**
   * @title 劫持 open 的 state，方便判断仅在下拉框开启时才触发搜索
   * @desc 需要组件的状态既可以自己管理，也可以被外部控制
   */
  const [innerOpen, setInnerOpen] = useControllableValue<boolean | undefined>(props, {
    defaultValue: undefined,
    defaultValuePropName: 'defaultOpen',
    valuePropName: 'open',
    trigger: 'onDropdownVisibleChange',
  })

  // 存储选项列表，方便获取到当前最新的选项列表的长度
  const [options, setOptions, getOptions] = useGetState<any[]>([])

  /**
   * @title 取消请求
   */
  const [abortControllerRef, getRefreshSignal] = useAbortController()

  /**
   * @title 异步请求相关状态
   */
  // 是否正在请求中
  const [loadInProgress, setLoadInProgress] = React.useState<boolean>(false)
  // 是否没有更多未加载的，为 true 时已加载完毕
  const [loadNoMore, setLoadNoMore] = React.useState<boolean>(false)
  // 存储当前搜索值，用于在下拉滚动时引用
  const searchValueRef = React.useRef<string>('')

  /**
   * @title 对 options 进行包装处理
   */
  const mergeOptions = useMergeOptions(options, loadInProgress, loadNoMore)

  /**
   * @title 搜索框键入的防抖查询函数
   * @desc 重置选项列表；offset重置为0
   */
  const { run: onSearchDebounceRun, cancel: onSearchDebounceCancel, flush: onSearchDebounceFlush } = useDebounceFn(
    async (q: string) => {
      searchValueRef.current = q

      // 当搜索框有值时，直接关闭弹窗，此时也会触发 onSearch 搜索，search值为空。这里阻止掉该情况，不能简单的判断 search值为空 就阻止
      if (!innerOpen) { return }

      try {
        setLoadNoMore(false)
        setOptions([])
        setLoadInProgress(true)

        const response = await loadData?.(getRefreshSignal(), { q, offset: 0 })
        if (isArr(response) && !isEmpty(response)) {
          setOptions(response)
        }
      }
      catch (error) { }
      finally {
        setLoadInProgress(false)
      }
    },
    {
      wait: 500,
      leading: false,
      trailing: true,
      maxWait: undefined,
    },
  )

  /**
   * @title 下拉列表滚动时的回调，增加静态锁 <触底操作只能等待异步函数完成之后才能再次触发>
   * @desc 往选项列表累加；offset 为上一次的 options 长度
   */
  const onPopupScrollLock = useLockFn(async (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // 没有更多了，则无需触发滚动加载
    if (loadNoMore) { return }

    const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLDivElement
    // 容差值是为了避免由于浏览器像素差异等问题导致的误判
    const tolerance = 2
    // 滚动条滚动的距离(scrollTop) 大于 滚动区域的总高度(scrollHeight)与滚动区域可见部分的高度(clientHeight)的差值
    if (!(scrollTop > scrollHeight - clientHeight - tolerance)) {
      return
    }

    try {
      setLoadInProgress(true)

      const response = await loadData?.(getRefreshSignal(), { q: searchValueRef.current, offset: getOptions().length })
      if (isArr(response) && !isEmpty(response)) {
        setOptions(value => ([...value, ...response]))
      }
      else {
        setLoadNoMore(true)
      }
    }
    catch (error) { }
    finally {
      setLoadInProgress(false)
    }
  })

  /**
   * @title 劫持 onDropdownVisibleChange 方法
   */
  const innerDropdownVisibleChangeHandle = useMemoizedFn((visible: boolean) => {
    setInnerOpen(visible)
    onDropdownVisibleChange?.(visible)

    // showSearch 开启时，根据 firstLoad 判断是否首次打开下拉列表时触发搜索
    if (showSearch) {
      setOptions([]) // 提前清空，防止渲染延迟
      visible && firstLoad && onSearchDebounceRun('')
    }
    else {
      // showSearch 未开启时，默认首次打开下拉列表时触发搜索；后续打开时 若 options 为空，才触发搜索
      visible && getOptions().length <= 0 && onSearchDebounceRun('')
    }
  })

  /**
   * @title 下拉框关闭时手动触发 abort 方法
   */
  React.useEffect(() => {
    // 当下拉框已关闭，则手动触发 abort 方法
    !innerOpen && abortControllerRef.current.abort(SELECT2_ABORT_REASON)
  }, [innerOpen])

  /**
   * @title 卸载清除副作用
   */
  React.useEffect(() => {
    return () => {
      // 卸载时直接结束可能存在的上一次请求
      abortControllerRef.current.abort(SELECT2_ABORT_REASON)

      // 取消当前可能存在的防抖
      onSearchDebounceCancel()
    }
  }, [])

  return (
    <AntdSelect
      {...restProps}
      filterOption={false}
      virtual={false}
      /* 默认值 */
      listHeight={listHeight}
      listItemHeight={listItemHeight}
      labelInValue={labelInValue}
      showSearch={showSearch}
      notFoundContent={notFoundContent}
      /* 劫持 */
      options={mergeOptions}
      value={innerValue}
      onChange={setInnerValue}
      // suffixIcon={loadInProgress ? <LoadingOutlined /> : suffixIcon}
      loading={loadInProgress || loading}
      open={innerOpen}
      onDropdownVisibleChange={innerDropdownVisibleChangeHandle}
      onSearch={showSearch ? onSearchDebounceRun : undefined}
      onPopupScroll={onPopupScrollLock}
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
