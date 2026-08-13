# Research: 002 零冷水定时

**Date**: 2026-08-13

## 1. 云定时 API 选型

**Decision**: 使用 `@ray-js/ray` 的 `device.syncTimerTask` / `addTimer` / `updateTimer` / `updateTimerStatus` / `removeTimer`（DeviceKit）。

**Rationale**: 官方文档与 typings 完备；支持 `aliasName`、`loops`、`isAppPush`、`dps`；满足成对模型。

**Alternatives considered**:
- `openTimerPage`：无法强制「一组两个时间段」与米家交互 → 否决
- 仅本地存储配对：换机丢失 → 否决

## 2. 成组键 aliasName

**Decision**: 面板生成 `zc_g_<uuid>`（无连字符或短 uuid），开始/结束 Timer 共用；用户不可见。

**Rationale**: 云端原生字段，换端可 sync 还原组；无需本地表。

**Alternatives considered**:
- 用 loops+time 启发式配对：碰撞风险 → 否决
- 本地 SQLite：超范围 → 否决

## 3. category

**Decision**: 固定常量 `zc_schedule`。

**Rationale**: 与设备其他品类定时隔离；sync 只拉本 feature 任务。

## 4. DP 映射

**Decision**: Timer `dps` 使用字符串键 `"104"`，值 `true`/`false`，对应 Schema `zc_always_on`（id 104）。

**Rationale**: 用户明确开始/结束对应 dpid 104；与物模型一致。

## 5. 半组失败策略

**Decision**:
- **新增**：先 add 开始，再 add 结束；若结束失败则 `removeTimer` 开始并 Toast 失败
- **删除**：先删一侧再删另一侧；若第二侧失败，Toast 并立即 `syncTimerTask` 刷新；提供「清理异常定时」入口（可选，P2）展示孤儿
- **编辑**：顺序 update 两侧；失败则 sync 回读纠偏并提示

**Rationale**: 满足 SC-003，避免脏列表。

## 6. UI 参考与视觉

**Decision**: 信息结构/操作流对齐米家截图（列表 + 时间段编辑）；颜色/圆角/背景用 001 `--index-*` 变量。

**Rationale**: 用户选 C + 方案 1；伊莱克斯无正式定时帧。

**Alternatives considered**: 像素级抄米家青绿 → 违品牌与宪章 → 否决

## 7. 左滑删除

**Decision**: 优先实现左滑露出删除；若 Ray/WebView 手势不稳，用列表项「删除」操作或长按 + Dialog，但 **MUST** 二次确认。

**Rationale**: 规格要求左滑或等价；二次确认已用户锁定。

## 8. isAppPush

**Decision**: 表单可编辑，默认 `false`。

**Rationale**: 用户 2026-08-13 确认。

## 9. 路由

**Decision**: 新路径 `/pages/zero-cold-schedule/index` 与 `/pages/zero-cold-schedule-edit/index`；首页入口改指向列表；删除或重定向旧 `zero-cold-placeholder`。

**Rationale**: 语义清晰，避免占位文案残留。

## 10. Picker 组件

**Decision**: 时间与星期选择优先 SmartUI（DatetimePicker / 自定义星期多选 + ActionSheet/Popup）；与 Skill 组件目录一致。

**Rationale**: 宪章 III/V。
