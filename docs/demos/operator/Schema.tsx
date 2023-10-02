import React from 'react'
import { createForm } from '@formily/core'
import {
  DatePicker,
  Input,
  Select,
} from '@formily/antd-v5'
import { QueryOperatorFilter, convertValuesToConditions, getInitialValue } from '@odinlin/formily-antd'

import { definitions, fields, formatter } from './json'

import type { IFormFeedback } from '@formily/core'
import type { IColumnCondition } from '@odinlin/formily-antd'

const conditions: IColumnCondition[] = [
  {
    field: 'subject',
    operator: 'LIKE',
    value: ['张'],
  },
  {
    field: 'status',
    operator: 'CONTAINS',
    value: [],
  },
  {
    field: 'assignedTo',
    operator: 'CONTAINS',
    value: ['6269eb0cacd13cfd506e5499'],
  },
  {
    field: 'gmtCreate',
    operator: 'MORE_THAN',
    value: [],
  },
  {
    field: 'gmtModified',
    operator: 'BETWEEN',
    value: [],
  },
]

const form = createForm({
  // form.setInitialValues
  initialValues: getInitialValue(fields, conditions),
})

export default () => {
  return (
    <div>
      <QueryOperatorFilter
        form={form}
        components={{
          Input,
          Select,
          DatePicker,
        }}
        definitions={definitions}
        definitionFields={fields}
        conditions={conditions}
        formatter={formatter}
        onAutoSubmit={(values: any) => {
          console.log('values: ', convertValuesToConditions(values))
          // console.log("[vscode-log] Schema.tsx@Line 103: ", form.getFormGraph());
        }}
        onAutoSubmitFailed={(feedbacks: IFormFeedback[]) => {
          console.log('[vscode-log] Schema.tsx@Line 103: ', feedbacks)
        }}
      >
      </QueryOperatorFilter>
    </div>
  )
}
