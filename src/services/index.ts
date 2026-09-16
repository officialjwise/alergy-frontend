import { apiMode } from './config';
import { httpServices } from './http';
import { mockServices } from './mock';
import type { Services } from './types';

/** Resolves the active service set. The only place the mock/real switch is read. */
export function getServices(): Services {
  return apiMode === 'real' ? httpServices : mockServices;
}

export { apiMode, mockConfig } from './config';
export { ServiceError } from './types';
export type { Services, AnalyzeInput } from './types';
export { evaluateProduct } from './verdictEngine';
