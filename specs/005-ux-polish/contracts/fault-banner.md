# Contract: Fault Banner Polish

## Display

| 条件 | UI |
|------|-----|
| `hasFault===false` | 不渲染 |
| `hasFault===true` | 白卡片条：警示矢量图标 +「故障提醒：{primary}」+ hint「点击查看处理方案」+ 右箭头 |

对照 Ardot `55:781`。

## Interaction

| 动作 | 结果 |
|------|------|
| 点击横幅 | 打开就地摘要（`showModal` 或 Dialog）：列出当前全部 `codes` 的可读文案 |
| 确认关闭 | 回到首页，无路由变化 |
| 写 DP | **禁止** |

## Non-goals

- 故障手册页 / 客服工单
- 清除故障按钮
