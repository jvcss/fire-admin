import express, { Router } from 'express';
import * as projectController from '@/controllers/projectController';

const projectRouter: Router = express.Router();

projectRouter.get('/', projectController.getAllProjectsWithApps);

projectRouter.get('/:projectId/apps', projectController.getProjectApps);

projectRouter.get('/:projectId/apps/:appName', projectController.getProjectApp);

projectRouter.get('/apps', projectController.getApps);

projectRouter.get('/apps/:appName/:platform', projectController.getApp);

projectRouter.get('/apps/:appName', projectController.getAppConfigs);

// once per week
projectRouter.get('/update', projectController.getUpdate);

export default projectRouter;
