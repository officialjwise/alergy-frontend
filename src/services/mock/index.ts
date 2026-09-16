import { mockAuthService } from './authService';
import { mockHistoryService } from './historyService';
import { mockIngredientService } from './ingredientService';
import { mockInsightsService } from './insightsService';
import { mockProfileService } from './profileService';
import { mockScanService } from './scanService';
import type { Services } from '../types';

export const mockServices: Services = {
  ingredients: mockIngredientService,
  profiles: mockProfileService,
  scan: mockScanService,
  history: mockHistoryService,
  auth: mockAuthService,
  insights: mockInsightsService,
};
