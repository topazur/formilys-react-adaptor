---
nav:
  title: 筛选类表单
  order: 1
group:
  title: 展开收起
  order: 0
---

# Fold Demo

- 展开收起原理就是最后一个按钮组是填充撑满的，其他 `Col` 根据折叠情况显隐。

- 展现了 `FormItem` 各种 [api](https://antd5.formilyjs.org/zh-CN/components/form-item#api) 的示例，都是可以覆盖传入。`schemas` 是 [ISchema[]](https://react.formilyjs.org/zh-CN/api/shared/schema) 类型是为了有顺序，索引用于计算 `Col` 显隐。

- `defaultCollapsed` 默认折叠状态，默认值为 `true`；`maxColumns` 每行最多显示多少个 `Col`，默认值为 `3`；

- 给 Reset 组件传递了 onReset 事件，表单的默认的重置到初始值失效，你可以自定义重置逻辑。

<code src="../demos/fold/Schema.tsx"></code>
