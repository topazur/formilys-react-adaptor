import React, { useMemo } from 'react'
import { createForm } from '@formily/core'
import {
  DatePicker,
  Input,
  NumberPicker,
  Select,
} from '@formily/antd-v5'
import { QueryFoldForm } from '@odinlin/formily-antd'

import type { IFormFeedback } from '@formily/core'
import type { ISchema } from '@formily/react'

const schemas: ISchema[] = [
  {
    'type': 'string',
    'name': 'input1',
    'title': '普通输入框 (占用内部的 $ref 和 x-data 属性)',
    'x-component': 'Input',
    '$ref': '#/definitions/aaaaa',
    'x-data': { bbbbbb: '$ref 不会被覆盖，如果想修改请直接修改definitions；x-data会被合并' },
  },
  {
    'type': 'string',
    'name': 'input2',
    'title': '普通输入框 (带冒号、必填星号、提示)',
    'x-component': 'Input',
    'x-decorator-props': {
      asterisk: true,
      colon: true,
      tooltip: '提示提示',
      tooltipLayout: 'icon',
    },
  },
  {
    'type': 'string',
    'name': 'number1',
    'title': '大小',
    'x-component': 'NumberPicker',
    'x-decorator-props': {
      size: ['small', 'default', 'large'][0],
    },
  },
  {
    'type': 'string',
    'name': 'number2',
    'title': '前后缀内容',
    'x-component': 'NumberPicker',
    'x-decorator-props': {
      addonBefore: 'addonBefore',
      addonAfter: 'addonAfter',
    },
  },
  {
    'type': 'string',
    'name': 'select2',
    'title': '反馈⽂案',
    'x-component': 'Select',
    'x-decorator-props': {
      feedbackText: 'feedbackText',
    },
  },
  {
    'type': 'string',
    'name': 'select3',
    'title': '扩展描述⽂案',
    'x-component': 'Select',
    'x-decorator-props': {
      extra: 'extra',
    },
  },
  {
    'type': 'string',
    'name': 'date2',
    'title': '复写 x-decorator-props.getColProps 修改 span',
    'x-component': 'DatePicker.RangePicker',
    'x-decorator-props.getColProps': ({ collapsed, maxColumns }) => {
      return {
        span: 16,
      }
    },
  },
]

function Demo() {
  const form = useMemo(() => createForm(), [])

  return (
    <QueryFoldForm
      form={form}
      components={{
        Input,
        NumberPicker,
        Select,
        DatePicker,
      }}
      schemas={schemas}
      onAutoSubmit={(values) => {
        console.log('[vscode-log] Schema.tsx@Line 100: ', values)
      }}
      onAutoSubmitFailed={(feedbacks: IFormFeedback[]) => {
        console.log('[vscode-log] Schema.tsx@Line 103: ', feedbacks)
      }}
    />
  )
}

export default Demo
