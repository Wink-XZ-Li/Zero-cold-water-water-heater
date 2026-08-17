import { showToast } from '@ray-js/ray';
import Strings from '@/i18n';

export type ScheduleOp = 'add' | 'update' | 'delete';

const ING: Record<ScheduleOp, string> = {
  add: 'schedule_adding',
  update: 'schedule_updating',
  delete: 'schedule_deleting',
};

const OK: Record<ScheduleOp, string> = {
  add: 'schedule_add_success',
  update: 'schedule_update_success',
  delete: 'schedule_delete_success',
};

export function toastScheduleProgress(op: ScheduleOp): void {
  showToast({ title: Strings.getLang(ING[op]), icon: 'loading', duration: 20000 });
}

export function toastScheduleSuccess(op: ScheduleOp): void {
  showToast({ title: Strings.getLang(OK[op]), icon: 'success' });
}
