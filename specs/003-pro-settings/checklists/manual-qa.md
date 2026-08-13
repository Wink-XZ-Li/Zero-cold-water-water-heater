# 003 瀑布浴与能耗报告壳 · 手动 QA

**分支**: `003-pro-settings`  
**日期**: 2026-08-13  
**验收**: ⏳ IDE 待勾

| ID | 场景 | 结果 | 备注 |
|----|------|------|------|
| SC-001 | 首页找到并完成瀑布浴开/关，与设备一致 | ⏳ IDE | DP `turbo` |
| SC-002 | 离线时拨动瀑布浴无假成功 | ⏳ IDE | `disabled={!online}` |
| SC-003 | 能耗报告入口 → 壳页 → 返回，连续 3 次无卡死 | ⏳ IDE | |
| SC-004 | 对照 Ardot 信息结构 | ✅ 文档 | `docs/design/pro-settings-ui-diff.md` |

构建门禁：`npm run lint` ✅ / `npm run build` ✅（2026-08-13 实现会话）
