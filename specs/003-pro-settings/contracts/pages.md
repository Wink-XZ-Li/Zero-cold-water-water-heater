# 页面合约：003

## 路由

| route | path | name |
|-------|------|------|
| `/energy-report` | `/pages/energy-report/index` | EnergyReport |

首页 `/` 保持不变；在内容区追加组件，不改原有路由。

## 导航流

```text
Home
  ├─ ZeroColdEntry（002：开关 + 预热→定时列表）
  ├─ WaterfallBathEntry（turbo Switch）
  └─ EnergyReportEntry → EnergyReport 页面壳 → navigateBack
```

## 页面职责

| 页面 | 职责 |
|------|------|
| home | 展示瀑布浴行 + 能耗入口；传入 disabled |
| energy-report | 004 壳：静态信息结构 + 空态；可返回 |

## 非目标

- 不删除或改写 `zero-cold-schedule*` 路由
- 不在报告页实现真实图表交互
