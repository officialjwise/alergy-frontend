import { mockConfig } from '../config';
import { ServiceError } from '../types';
import { delay, jitter } from '@/utils/delay';

/** Waits a realistic amount of time and honours the "fail next call" switch. */
export async function simulate(scale = 1): Promise<void> {
  await delay(jitter(mockConfig.latency * scale));
  if (mockConfig.failNext) {
    mockConfig.failNext = false;
    throw new ServiceError('Mock network failure', 'network');
  }
}
