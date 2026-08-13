# Data Model: 002 零冷水定时

## TimerGroup（业务实体）

| 字段 | 类型 | 说明 |
|------|------|------|
| aliasName | string | 成组键，如 `zc_g_<uuid>` |
| startTimerId | string | 开始 Timer id |
| endTimerId | string | 结束 Timer id |
| startTime | string | `HH:mm` |
| endTime | string | `HH:mm` |
| loops | string | 7 位，索引 0=周日 … 6=周六 |
| isAppPush | boolean | 组内两侧应一致；编辑时同步写入 |
| enabled | boolean | 两侧 status 均为 true 时为开；开关时两侧同写 |
| orphan | boolean | 仅一侧存在时 true，不可当完整组编辑保存 |

## Cloud Timer（DeviceKit TimerModel 子集）

| 字段 | 用途 |
|------|------|
| timerId | 更新/删除/开关 |
| time | 运行时刻 |
| loops | 重复 |
| dps | `{"104": true\|false}` |
| aliasName | 归组 |
| isAppPush | 通知 |
| status | 启用 |

## 校验规则

- 完整组：恰好 1 个 start（104 true）+ 1 个 end（104 false），同 aliasName
- 保存：`startTime !== endTime`
- `loops`：至少一位为 `1`
- `isAppPush` 默认 `false`
- category 恒为 `zc_schedule`

## 状态流转

```text
[空列表] --新增成功--> [组 enabled]
[组] --关开关--> [组 disabled]（两侧 status false）
[组] --开开关--> [组 enabled]
[组] --编辑保存--> [组 字段更新]
[组] --二次确认删除--> [移除]
[半组新增失败] --回滚--> [空/原列表]
```
