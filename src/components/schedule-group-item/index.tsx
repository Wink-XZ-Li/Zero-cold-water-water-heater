import React from 'react';
import { View, Text } from '@ray-js/ray';
import { Switch } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { loopsSummary, type TimerGroup } from '@/utils/timer-group';
import styles from './index.module.less';

type Props = {
  group: TimerGroup;
  toggling?: boolean;
  onToggle?: (enabled: boolean) => void;
  onPress?: () => void;
  onDelete?: () => void;
  onCleanup?: () => void;
};

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

/**
 * Row text opens edit; Switch is a sibling (not child of text hit area)
 * so Ray click bubbling cannot navigate while toggling.
 */
export function ScheduleGroupItem({
  group,
  toggling,
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
  const summary = loopsSummary(group.loops, {
    everyDay: Strings.getLang('schedule_every_day'),
    weekdays: Strings.getLang('schedule_weekdays'),
    days,
  });

  return (
    <View className={`${styles.item} ${group.orphan ? styles.orphan : ''}`}>
      <View className={styles.main}>
        <View className={styles.textCol} onClick={group.orphan ? undefined : onPress}>
          <Text className={styles.time}>
            {group.startTime} - {group.endTime}
          </Text>
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
              disabled={!!toggling}
              activeColor="var(--index-accent)"
              onChange={(event: unknown) => {
                onToggle?.(readChecked(event));
              }}
            />
          </View>
        )}
      </View>
      <View className={styles.actions}>
        {group.orphan ? (
          <Text className={styles.actionDanger} onClick={onCleanup}>
            {Strings.getLang('schedule_cleanup')}
          </Text>
        ) : (
          <Text className={styles.actionDanger} onClick={onDelete}>
            {Strings.getLang('delete')}
          </Text>
        )}
      </View>
    </View>
  );
}

export default ScheduleGroupItem;
