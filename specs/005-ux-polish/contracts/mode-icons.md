# Contract: Mode Icons

## Binding

| Mode code | Label (zh) | Ardot tile | Icon vector node |
|-----------|------------|------------|------------------|
| `eco` | 节能 | `55:797` | `55:800` |
| `kitchen` | 厨宝 | `55:802` | `55:805` |
| `bath` | 浴缸 | `55:807` | `55:810` |
| `auto_temp` | 随温感 | `55:812` | `55:815` |

## Visual states

| State | Tile bg | Icon fill |
|-------|---------|-----------|
| inactive | card white / soft | accent muted blue (`--index-accent-muted` 或稿 `#AABDF7` 系） |
| active | `--index-accent` / `#112959` 系 | light (`#F5F5F5` / 近白） |
| disabled | 同 inactive + 整体降透明 | 同 inactive |

## Behavior

- 点击仍写 `mode` DP（001 契约不变）
- 图标 MUST 为矢量（`@ray-js/svg`），MUST NOT 以 Eco/厨/浴/温文字作为主图标
- 标签文案继续 i18n `dp_mode_*`
