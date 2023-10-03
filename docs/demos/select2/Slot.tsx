import React from 'react'
import { Select2 } from '@odinlin/formily-antd/src/select2'

import { loadData } from './helper'

function Demo() {
  return (
    <div>

      <ul>
        <li>
          <h6>测试 placeholder</h6>
          <Select2
            style={{ width: 300 }}
            placeholder="placeholder is string"
            showSearch={true}
            firstLoad={false}
            loadData={(signal, opts) => loadData('placeholderProp', signal, opts)}
          />
        </li>

        <li>
          <h6>测试 notFoundContent</h6>
          <Select2
            style={{ width: 300 }}
            notFoundContent={<span>没有找到</span>}
            showSearch={true}
            firstLoad={false}
            loadData={(signal, opts) => loadData('notFoundContent', signal, opts)}
          />
        </li>

        <li>
          <h6>测试 optionRender</h6>
          <Select2
            style={{ width: 300 }}
            optionRender={(oriOption, info) => {
              const { value, label } = oriOption
              if (value === 'SELECT2_IDENTIFIER_NOMORE') {
                return (
                  <div>
                    NOMORE
                    {label}
                  </div>
                )
              }
              else if (value === 'SELECT2_IDENTIFIER_PROGRESS') {
                return (
                  <div>
                    Loading
                    {label}
                  </div>
                )
              }
              else {
                return <div>
                  <h5>The slot's value: {value}</h5>
                  <h5>The slot's label: {label}</h5>
                </div>
              }
            }}
            showSearch={true}
            firstLoad={false}
            loadData={(signal, opts) => loadData('optionRender', signal, opts)}
          />
        </li>
      </ul>

    </div>
  )
}

export default Demo
