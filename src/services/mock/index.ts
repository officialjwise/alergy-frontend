import { mockActionPlanService } from './actionPlanService';
import { mockAuthService } from './authService';
import { mockBadgeService } from './badgeService';
import { mockGroupService } from './groupService';
import { mockHistoryService } from './historyService';
import { mockIngredientService } from './ingredientService';
import { mockInsightsService } from './insightsService';
import { mockNotificationService } from './notificationService';
import { mockProfileService } from './profileService';
import { mockReactionService } from './reactionService';
import { mockScanService } from './scanService';
import type { Services } from '../types';

export const mockServices: Services = {
  ingredients: mockIngredientService,
  profiles: mockProfileService,
  scan: mockScanService,
  history: mockHistoryService,
  auth: mockAuthService,
  insights: mockInsightsService,
  reactions: mockReactionService,
  badges: mockBadgeService,
  actionPlan: mockActionPlanService,
  groups: mockGroupService,
  notifications: mockNotificationService,
};
