import { appConfig } from '@/config/app';
import type { PlanId } from '@/types';

/** People allowed per plan; the server can lower or raise these without an app update. */
export function peopleAllowed(plan: PlanId): number {
  return appConfig.plans[plan].people;
}

/** Whether another person can be added. Lowering a limit removes nobody. */
export function canAddPerson(plan: PlanId, currentCount: number): boolean {
  return currentCount < peopleAllowed(plan);
}

export const PLAN_ORDER: readonly PlanId[] = ['free', 'plus', 'family'];
