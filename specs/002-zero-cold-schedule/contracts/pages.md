# 页面合约：002 零冷水定时

| 路由名 | path | 页面 | 说明 |
|--------|------|------|------|
| `/` | `/pages/home/index` | Home | 「零冷水预热」→ 定时列表 |
| `/zero-cold-schedule` | `/pages/zero-cold-schedule/index` | ScheduleList | 定时组列表 |
| `/zero-cold-schedule-edit` | `/pages/zero-cold-schedule-edit/index` | ScheduleEdit | 新增/编辑；query: `mode=create\|edit&aliasName=` |

旧路由 `/zero-cold-placeholder`：实现时移除或 301 式 redirect 到列表，避免残留占位文案。
