import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getAnalyticsLogsStatusLog, ScrollView, View, Text, navigateBack } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import { useDevice } from '@ray-js/panel-sdk';
import dayjs from 'dayjs';
import { parseFaultBitmap } from '@/utils/dp';
import styles from './index.module.less';

const PAGE_SIZE = 50;

const WORK_STATE_MAP: Record<string, string> = {
  off: '关机',
  standby: '待机中',
  bath_heating: '卫浴加热中',
  zc_heating: '循环加热中',
};

type ValueType = 'bool' | 'value' | 'enum' | 'bitmap';

type DpMeta = {
  id: number;
  label: string;
  type: ValueType;
  unit?: string;
};

const DP_META: DpMeta[] = [
  { id: 1, label: '1-开关', type: 'bool' },
  { id: 7, label: '7-设置温度', type: 'value', unit: '℃' },
  { id: 9, label: '9-出水温度', type: 'value', unit: '℃' },
  { id: 11, label: '11-进水温度', type: 'value', unit: '℃' },
  { id: 15, label: '15-工作状态', type: 'enum' },
  { id: 23, label: '23-故障告警', type: 'bitmap' },
  { id: 24, label: '24-耗气量', type: 'value', unit: 'L' },
  { id: 25, label: '25-耗水量', type: 'value', unit: 'L' },
  { id: 101, label: '101-单次零冷水', type: 'bool' },
  { id: 102, label: '102-零冷水水控预热开关', type: 'bool' },
];

const DP_META_MAP: Record<number, DpMeta> = DP_META.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<number, DpMeta>);

const ALL_DP_IDS = DP_META.map(d => String(d.id)).join(',');
const ZERO_COLD_DP_IDS = '101,102,15';

type TabDef = {
  key: string;
  label: string;
  dpIds: string;
  mixed: boolean;
};

const DP_TABS: TabDef[] = [
  { key: 'all', label: '全部', dpIds: ALL_DP_IDS, mixed: true },
  { key: 'zero_cold', label: '零冷水', dpIds: ZERO_COLD_DP_IDS, mixed: true },
  ...DP_META.map(d => ({
    key: `dp_${d.id}`,
    label: d.label,
    dpIds: String(d.id),
    mixed: false,
  })),
];

interface LogItem {
  timeStamp: number;
  dpId: number | string;
  value: string;
}

function formatFault(value: string): string {
  const { codes, hasFault } = parseFaultBitmap(Number(value));
  if (!hasFault) return '无故障';
  return codes.length > 0 ? codes.join('、') : '未知故障';
}

function normalizeDpId(dpId: number | string): number | null {
  if (typeof dpId === 'number' && !Number.isNaN(dpId)) return dpId;
  const first = String(dpId).split(',')[0].trim();
  const num = Number(first);
  return Number.isNaN(num) ? null : num;
}

function formatBool(value: string): string {
  const s = String(value).toLowerCase();
  return s === 'true' || s === '1' ? '开' : '关';
}

function formatValue(value: unknown, meta?: DpMeta): string {
  const raw = value == null ? '' : String(value);
  if (!meta) return raw;
  switch (meta.type) {
    case 'bool':
      return formatBool(raw);
    case 'enum':
      return WORK_STATE_MAP[raw] || raw;
    case 'bitmap':
      return formatFault(raw);
    case 'value':
      return meta.unit ? `${raw} ${meta.unit}` : raw;
    default:
      return raw;
  }
}

function toMillis(timeStamp: number): number {
  return timeStamp > 1e12 ? timeStamp : timeStamp * 1000;
}

export function Logs() {
  const { devInfo } = useDevice();
  const [list, setList] = useState<LogItem[]>([]);
  const hasNext = useRef(true);
  const fetchGen = useRef(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const currentTab = DP_TABS[activeTab];

  const fetchData = useCallback(
    async (reqOffset: number, tabIndex: number, append: boolean) => {
      const tab = DP_TABS[tabIndex];
      if (!tab || !devInfo?.devId) return;
      const gen = fetchGen.current + 1;
      fetchGen.current = gen;
      setLoading(true);
      try {
        const res = await getAnalyticsLogsStatusLog({
          devId: devInfo.devId,
          dpIds: tab.dpIds,
          offset: reqOffset,
          limit: PAGE_SIZE,
          sortType: 'DESC',
        });
        if (gen !== fetchGen.current) return;
        setOffset(reqOffset);
        hasNext.current = !!res.hasNext;
        const next = (res.dps || []) as LogItem[];
        setList(d => (append ? [...d, ...next] : next));
      } catch (e) {
        console.error('[Logs] fetchData error:', e);
        if (gen !== fetchGen.current) return;
        hasNext.current = false;
        if (!append) setList([]);
      } finally {
        if (gen === fetchGen.current) setLoading(false);
      }
    },
    [devInfo?.devId]
  );

  const loadMore = useCallback(() => {
    if (!hasNext.current || loading) return;
    fetchData(offset + PAGE_SIZE, activeTab, true);
  }, [offset, activeTab, fetchData, loading]);

  const handleTabChange = (index: number) => {
    if (index === activeTab) return;
    setActiveTab(index);
  };

  useEffect(() => {
    setList([]);
    hasNext.current = true;
    setOffset(0);
    fetchData(0, activeTab, false);
  }, [activeTab, fetchData]);

  let preDay = '';

  return (
    <View className={styles.page}>
      <NavBar
        title="设备日志"
        leftArrow
        border={false}
        background="var(--index-main-bg)"
        onClickLeft={() => navigateBack()}
      />
      <ScrollView scrollX enhanced showScrollbar={false} className={styles.tabScroll}>
        <View className={styles.tabRow}>
          {DP_TABS.map((tab, index) => (
            <View
              key={tab.key}
              className={`${styles.tabItem} ${activeTab === index ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(index)}
            >
              <Text className={activeTab === index ? styles.tabTextActive : styles.tabText}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <ScrollView
        className={styles.scroll}
        scrollY
        enhanced
        showScrollbar={false}
        lowerThreshold={300}
        onScrollToLower={loadMore}
      >
        {list.map((item, idx) => {
          const date = dayjs(toMillis(item.timeStamp));
          const curDay = date.format('YYYY-MM-DD');
          let dayBegin = false;
          if (curDay !== preDay) {
            dayBegin = true;
            preDay = curDay;
          }

          const dpId = normalizeDpId(item.dpId);
          const meta = dpId == null ? undefined : DP_META_MAP[dpId];
          const actionText = formatValue(item.value, meta);
          const showName = currentTab.mixed;

          return (
            <View key={`${item.timeStamp}-${item.dpId}-${idx}`}>
              {dayBegin && <View className={styles.day}>{curDay}</View>}
              <View className={styles.item}>
                <Text className={styles.time}>{date.format('HH:mm')}</Text>
                {showName ? (
                  <Text className={styles.dpName}>{meta?.label || `DP ${item.dpId}`}</Text>
                ) : null}
                <Text className={styles.action}>{actionText}</Text>
              </View>
            </View>
          );
        })}
        {loading && <View className={styles.loading}>加载中...</View>}
        {!loading && list.length === 0 && <View className={styles.empty}>暂无数据</View>}
      </ScrollView>
    </View>
  );
}

export default Logs;
