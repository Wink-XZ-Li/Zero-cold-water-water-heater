import { useMemo } from 'react';
import { useDevice } from '@ray-js/panel-sdk';
import { showToast } from '@ray-js/ray';
import Strings from '@/i18n';

/**
 * Offline / network guard for home controls.
 */
export function useDeviceOnlineGuard() {
  const network = useDevice(d => d.network);

  const online = useMemo(() => {
    // panel-sdk network shape may vary; treat missing as online to avoid false blocks in IDE
    if (!network) return true;
    if (typeof (network as any).isOnline === 'boolean') {
      return (network as any).isOnline;
    }
    if (typeof (network as any).online === 'boolean') {
      return (network as any).online;
    }
    return true;
  }, [network]);

  const guard = (fn: () => void) => {
    if (!online) {
      showToast({ title: Strings.getLang('device_offline'), icon: 'none' });
      return;
    }
    try {
      fn();
    } catch (e) {
      showToast({ title: Strings.getLang('action_failed'), icon: 'none' });
    }
  };

  return { online, guard };
}
