import { useMemo } from 'react';
import { useProps } from '@ray-js/panel-sdk';
import { parseFaultBitmap } from '@/utils/dp';

export function useFaultSummary() {
  const fault = useProps(p => p.fault);
  return useMemo(() => parseFaultBitmap(fault as number), [fault]);
}
