# 首页 Schema 核对表（US4）

**日期**: 2026-08-12  
**对照**: `docs/product/Debugfile_ST1_Pro.json` / `src/devices/schema.ts`

| 检查项 | 结果 |
|--------|------|
| Pro_Key `a3cbezgki7lkl8rr` | ✅ |
| Schema 含完整 21 DP | ✅ |
| 首页读写：`switch` / `mode` / `temp_set` | ✅ |
| 首页只读：`temp_current` / `work_state` | ✅ |
| 故障摘要只读展示 `fault`（无写入口） | ✅ |
| `temp_set` min/max 35–65，越界夹紧提示 | ✅ `useTempSetGuard` |
| 只读 DP 无 actions 写入 | ✅ |
| Out of Scope 无完整调节 UI（turbo/变升/浴缸/回差/点动/保温/用气用水） | ✅ |
| 零冷水入口仅只读摘要 + 占位导航 | ✅ |

FR-001 / FR-012：通过（代码审查）。
