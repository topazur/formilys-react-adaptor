import type { ISchema } from '@formily/react'
import type { IFormatter, IQueryFieldItem } from '@odinlin/formily-antd'

export const fields: IQueryFieldItem[] = [
  {
    field: 'subject',
    operator: 'LIKE',
    operatorOptions: ['LIKE'],
    isMultiple: false,
  },
  {
    field: 'status',
    operator: 'CONTAINS',
    operatorOptions: ['CONTAINS', 'NOT_CONTAINS'],
    isMultiple: true,
  },
  {
    field: 'assignedTo',
    operator: 'CONTAINS',
    operatorOptions: ['CONTAINS', 'NOT_CONTAINS'],
    isMultiple: true,
  },
  {
    field: 'gmtCreate',
    operator: 'MORE_THAN',
    operatorOptions: ['MORE_THAN', 'MORE_THAN_AND_EQUAL', 'LESS_THAN', 'LESS_THAN_AND_EQUAL', 'BETWEEN'],
    isMultiple: false,
  },
  {
    field: 'gmtModified',
    operator: 'BETWEEN',
    operatorOptions: ['MORE_THAN', 'MORE_THAN_AND_EQUAL', 'LESS_THAN', 'LESS_THAN_AND_EQUAL', 'BETWEEN'],
    isMultiple: false,
  },
]

export const definitions: Record<string, ISchema> = {
  subject: {
    'type': 'string',
    'x-component': 'Input',
    'readOnly': false,
    'required': false,
  },
  status: {
    'type': 'string',
    'x-component': 'Input',
    'readOnly': false,
    'required': false,
  },
  assignedTo: {
    'type': 'string',
    'x-component': 'Input',
    'readOnly': false,
    'required': false,
  },
  gmtCreate: {
    'type': 'string',
    'readOnly': false,
    'required': false,
    'x-reactions': {
      dependencies: ['.operator'],
      fulfill: {
        schema: {
          'x-component': '{{ $deps[0] === \'BETWEEN\' ? \'DatePicker.RangePicker\': \'DatePicker\' }}',
        },
      },
    },
  },
  gmtModified: {
    'type': 'string',
    'x-component': 'Input',
    'readOnly': false,
    'required': false,
    'x-reactions': {
      dependencies: ['.operator'],
      fulfill: {
        schema: {
          'x-component': '{{ $deps[0] === \'BETWEEN\' ? \'DatePicker.RangePicker\': \'DatePicker\' }}',
        },
      },
    },
  },
}

const translates = {
  field: {
    subject: '名称',
    status: '状态',
    assignedTo: '负责人',
    gmtCreate: '创建日期',
    gmtModified: '更新日期',
  },
  tooltip: {
    subject: '名称的tooltip',
    // status: '状态',
    // assignedTo: '负责人',
    // gmtCreate: '创建日期',
    // gmtModified: '更新日期',
  },
  operator: {
    LIKE: '包含',
    NOT_LIKE: '不包含',
    CONTAINS: '包含',
    NOT_CONTAINS: '不包含',
    EQUALS: '相等',
    NOT_EQUALS: '不相等',
    MORE_THAN: '大于',
    MORE_THAN_AND_EQUAL: '大于等于',
    LESS_THAN: '小于',
    LESS_THAN_AND_EQUAL: '小于等于',
    BETWEEN: '介于',
  },
}

export const formatter: IFormatter = (type: string, key: string, idx: number) => {
  return translates[type]?.[key]
}
