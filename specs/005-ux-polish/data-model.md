# Data Model: 005 UX Polish

本 feature 无新设备 DP。以下为 UI 领域实体（展示层）。

## ModeTileVisual

| 字段 | 说明 |
|------|------|
| `code` | `eco` / `kitchen` / `bath` / `auto_temp`（与 schema `mode` 枚举一致；`no_mode` 无磁贴） |
| `labelKey` | i18n 键（`dp_mode_*`） |
| `icon` | 矢量图标标识（叶/帽/浴缸/温度计） |
| `active` | 是否当前 `mode === code` |

**校验**: 切换仍走既有 `isEnumAllowed` + `actions.mode.set`；禁用时不可写。

## FaultBannerView

| 字段 | 说明 |
|------|------|
| `hasFault` | 来自既有 `useFaultSummary` |
| `codes` | 置位故障码列表（如 E0…） |
| `primaryLabel` | 首个码的可读文案 |
| `detailLines` | 点击弹层中展示的全部「码 + 文案」行 |

**状态**:
- `hasFault===false` → 不渲染横幅
- 点击 → 打开就地摘要（非路由）→ 关闭后回到首页

**禁止**: UI 写 `fault` DP。

## PageShellSpacing

| Token 意图 | 约定值 |
|------------|--------|
| 内容水平 padding | `32rpx` |
| 主块垂直 gap | `32rpx` |
| 底安全区 padding-bottom | `120rpx`（可滚动页） |

适用于：`home`、`energy-report`、`zero-cold-schedule`、`zero-cold-schedule-edit` 的主内容容器。

## UiDiffItem

| 字段 | 说明 |
|------|------|
| `id` / 描述 | 差异说明 |
| `status` | `aligned` \| `accepted_exception` |
| `note` | 关闭理由或例外说明 |
