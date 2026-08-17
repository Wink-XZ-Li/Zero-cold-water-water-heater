import React from 'react';
import { View, Text } from '@ray-js/ray';
import { Switch, SwipeCell } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { isOvernightPeriod, loopsSummary, formatOnceDateLabel, type TimerGroup } from '@/utils/timer-group';
import styles from './index.module.less';

type Props = {
  group: TimerGroup;
  toggling?: boolean;
  leaving?: boolean;
  onToggle?: (enabled: boolean) => void;
  onPress?: () => void;
  onDelete?: () => void;
  onCleanup?: () => void;
};

const SWIPE_DELETE_WIDTH = 80;

function readChecked(event: unknown): boolean {
  if (typeof event === 'boolean') return event;
  if (event && typeof event === 'object') {
    const { detail } = event as { detail?: unknown };
    if (typeof detail === 'boolean') return detail;
    if (detail && typeof detail === 'object' && 'value' in (detail as Record<string, unknown>)) {
      return !!(detail as { value?: boolean }).value;
    }
  }
  return false;
}

function timeTitle(group: TimerGroup): string {
  const end = isOvernightPeriod(group.startTime, group.endTime)
    ? `${Strings.getLang('schedule_next_day')} ${group.endTime}`
    : group.endTime;
  return `${group.startTime} - ${end}`;
}

/**
 * Row text opens edit; Switch is a sibling (not child of text hit area)
 * so Ray click bubbling cannot navigate while toggling.
 * Complete groups swipe to reveal delete; orphans keep an on-row cleanup.
 */
export function ScheduleGroupItem({
  group,
  toggling,
  leaving,
  onToggle,
  onPress,
  onDelete,
  onCleanup,
}: Props) {
  const days = [
    Strings.getLang('schedule_day_sun'),
    Strings.getLang('schedule_day_mon'),
    Strings.getLang('schedule_day_tue'),
    Strings.getLang('schedule_day_wed'),
    Strings.getLang('schedule_day_thu'),
    Strings.getLang('schedule_day_fri'),
    Strings.getLang('schedule_day_sat'),
  ];
  const summary = loopsSummary(
    group.loops,
    {
      once: Strings.getLang('schedule_repeat_once'),
      everyDay: Strings.getLang('schedule_every_day'),
      weekdays: Strings.getLang('schedule_weekdays'),
      days,
    },
    formatOnceDateLabel(
      group.date,
      Strings.getLang('schedule_every_day') === '每天' ? 'zh' : 'en'
    )
  );

  const card = (
    <View
      className={`${styles.item} ${group.orphan ? styles.orphan : ''}`}
      hoverClassName={leaving || group.orphan ? undefined : styles.itemHover}
      hoverStartTime={20}
      hoverStayTime={120}
    >
      <View className={styles.main}>
        <View className={styles.textCol} onClick={group.orphan || leaving ? undefined : onPress}>
          <Text className={styles.time}>{timeTitle(group)}</Text>
          {group.orphan ? (
            <Text className={styles.sub}>{Strings.getLang('schedule_orphan')}</Text>
          ) : (
            <Text className={styles.sub}>
              {Strings.getLang('schedule_period_label')}
              {summary ? ` | ${summary}` : ''}
            </Text>
          )}
        </View>
        {!group.orphan && (
          <View className={styles.switchWrap}>
            <Switch
              checked={group.enabled}
              disabled={!!toggling || !!leaving}
              activeColor="var(--index-accent)"
              onChange={(event: unknown) => {
                onToggle?.(readChecked(event));
              }}
            />
          </View>
        )}
      </View>
      {group.orphan ? (
        <View className={styles.actions}>
          <Text className={styles.actionDanger} onClick={onCleanup}>
            {Strings.getLang('schedule_cleanup')}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const wrapClass = `${styles.rowWrap} ${leaving ? styles.leaving : ''}`;

  if (group.orphan) {
    return <View className={wrapClass}>{card}</View>;
  }

  return (
    <View className={wrapClass}>
      <SwipeCell
        rightWidth={SWIPE_DELETE_WIDTH}
        name={group.aliasName}
        disabled={!!leaving}
        slot={{
          right: (
            <View
              className={styles.swipeDelete}
              hoverClassName={styles.swipeDeleteHover}
              hoverStartTime={20}
              hoverStayTime={70}
              onClick={onDelete}
            >
              <Text className={styles.swipeDeleteText}>{Strings.getLang('delete')}</Text>
            </View>
          ),
        }}
      >
        {card}
      </SwipeCell>
    </View>
  );
}

export default ScheduleGroupItem;
