# 手动联调记录（001）

**日期**: 2026-08-12  
**环境**: 代码侧 `npx eslint` + `npx ray build --target tuya` 已通过

| 标准 | 状态 | 说明 |
|------|------|------|
| SC-001 主操作可达 | ⏳ 待 IDE 虚拟设备 | 首页已具备开关/模式/调温 |
| SC-002 主控反馈一致 | ⏳ 待虚拟设备抽样 | Schema 已对齐 |
| SC-003 越界不下发 | ✅ 代码 | `useTempSetGuard` 夹紧 + Toast |
| SC-004 占位页往返 | ⏳ 待 IDE | 路由与返回已实现 |
| SC-005 Figma 视觉 | ⚠️ 阻塞 | Figma 设计工具本会话不可用，见 `docs/design/ui-diff.md` |

请在涂鸦 MiniApp IDE 绑定 Pro_Key `a3cbezgki7lkl8rr` 后补勾 SC-001/002/004。
