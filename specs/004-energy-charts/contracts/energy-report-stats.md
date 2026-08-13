# Contract: Energy Report Statistics UI

## Page

| 项 | 约定 |
|----|------|
| Route | `/energy-report`（003 已注册，004 不改路径） |
| Entry | 首页 `energy-report-entry` → `navigateTo` |
| Back | `navigateBack`；不得改写首页 DP 状态 |

## Controls

| Control | Behavior |
|---------|----------|
| Metric 用水/用气 | 可切换；默认用水；切换后保持 period，重载图表 |
| Period 日/周/月/年 | 可切换；默认日；重载图表与日期标签格式 |
| Date ‹ › | 步进锚点并重载；禁止越过「今天」向前 |

## Chart

| 项 | 约定 |
|----|------|
| Component | `@ray-js/stat-charts` `StatCharts`（首选） |
| DP | water → id 25；gas → id 24 |
| type | `sum` |
| chartType | `line` 或 `line-area` |
| 数据 | 云端统计 API（组件内或等价 `getStatisticsRang*`）；禁止 mock |
| 空/加载/失败 | 可区分；有数据时不展示「尚未开放/后续版本」横幅 |

## Copy

| Key 语义 | 场景 |
|----------|------|
| 能耗报告 | 标题 |
| 用水量 / 用气量 | metric |
| 日周月年 | period |
| 用水量 L / 用气量 m³ | 图表标题 |
| ±15% 误差 | 用水相关页脚（保留） |
| 加载中 / 暂无数据 / 获取失败 | 状态文案 |

## Non-goals

- 不改 002 定时、003 瀑布浴主路径
- 不写任何 DP
- 不导出/分享报表
