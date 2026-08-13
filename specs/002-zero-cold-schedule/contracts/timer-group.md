# 合约：TimerGroup ↔ DeviceKit

## 常量

| 名 | 值 |
|----|-----|
| `TIMER_CATEGORY` | `zc_schedule` |
| `ZC_ALWAYS_ON_DP_ID` | `"104"` |
| `isAppPush` 默认 | `false` |

## API 映射

| 业务操作 | API | 备注 |
|----------|-----|------|
| 拉取列表 | `device.syncTimerTask({ deviceId, category })` | 归组在客户端 |
| 新增组 | 两次 `addTimer` | 同 aliasName；先 start 后 end；失败回滚 |
| 编辑组 | 两次 `updateTimer` | 更新 time/loops/dps/isAppPush/aliasName |
| 开关组 | 两次 `updateTimerStatus` | 同 status |
| 删除组 | 确认 Dialog 后两次 `removeTimer` | 取消则不调用 |

## addTimer 载荷示例

开始：

```json
{
  "time": "10:34",
  "loops": "0111101",
  "dps": { "104": true },
  "aliasName": "zc_g_abc123",
  "isAppPush": false
}
```

结束：`dps["104"]=false`，其余相同。

## 列表展示规则

- 主文案：`${startTime} - ${endTime}`
- 副文案：`开启时段 | ${loops 中文摘要}`
- 开关：`enabled`
- 孤儿组：不显示为可开关完整组；提示异常

## 禁止

- 调用 `openTimerPage` 作为主 UI
- Timer.dps 写入 104 以外的业务 DP（本 feature 范围）
