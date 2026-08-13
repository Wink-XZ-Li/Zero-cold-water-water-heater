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
      <View className={styles.main} onClick={group.orphan ? undefined : onPress}>
        <View className={styles.textCol}>
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
          <View
            className={styles.switchWrap}
            onClick={e => {
              // prevent row navigation when flipping switch
              e?.stopPropagation?.();
            }}
          >
            <Switch
              checked={group.enabled}
              disabled={!!toggling}
              activeColor="var(--index-accent)"
              onChange={(event: { detail?: boolean } | boolean) => {
                const checked = typeof event === 'boolean' ? event : !!event?.detail;
                onToggle?.(checked);
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
