import React from 'react'

import {
  SELECT2_ABORT_REASON,
  SELECT2_IDENTIFIER_NOMORE,
  SELECT2_IDENTIFIER_PROGRESS,
  deafultRequestInProgress,
  deafultRequestNoMore,
} from './option-definition'

/**
 * @title 取消请求
 */
export function useAbortController() {
  // 存储 abortController
  const abortControllerRef = React.useRef<AbortController>(new AbortController())

  // 1. 下拉框关闭时触发过 abort，再发起请求的话需要最新的 signal
  // 2. 防抖时直接结束可能存在的上一次请求
  const getRefreshSignal = React.useCallback(() => {
    if (!abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort(SELECT2_ABORT_REASON)
    }

    abortControllerRef.current = new AbortController()
    return abortControllerRef.current.signal
  }, [])

  return [abortControllerRef, getRefreshSignal] as const
}

/**
 * @title 对 options 进行包装处理，增加 加载中 或 没有更多 选项提示目前的进度
 */
export function useMergeOptions(options: any[], loadInProgress: boolean, loadNoMore: boolean) {
  const mergeOptions = React.useMemo<any[]>(() => {
    // 如果没有选项，则返回空数组；如果正在加载中，则返回加载选项
    if (options.length <= 0) {
      if (loadInProgress) {
        return [
          {
            className: 'option-identifier-progress',
            value: SELECT2_IDENTIFIER_PROGRESS,
            disabled: true,
            label: deafultRequestInProgress,
          },
        ]
      }
      return []
    }

    // 如果没有更多数据，给出描述
    if (loadNoMore) {
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
  }, [options, loadInProgress, loadNoMore])

  return mergeOptions
}
