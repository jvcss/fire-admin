import { Request, Response } from 'express';

import {
  getFirebaseAdminForProject,
  serviceAccountPath,
} from '@/config/firebaseConfig';

import {
  readApps,
  readApp,
  orderAppsInProjects,
  readProjects,
  appsInProjects,
  searchForAppInProjects,
  moutAppMobileConfigs,
  fetchData,
} from '@/tasks/project/manager';

import { handleError } from '../utils/handles';

async function getAllProjectsWithApps(req: Request, res: Response) {
  try {
    const projects = await readProjects(serviceAccountPath);
    if (!projects) {
      res.status(204);
    } else {
      const manager = await orderAppsInProjects(projects);
      res.status(200).json(manager);
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function getProjectApps(req: Request, res: Response) {
  const projectId = req.params.projectId;
  try {
    const project = getFirebaseAdminForProject(projectId);
    let apps = await readApps(project);
    if (apps.length == 0) {
      res.status(204).json({});
    } else {
      res.status(200).json(apps);
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function getProjectApp(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const appId = req.params.appName;
  try {
    const project = getFirebaseAdminForProject(projectId);
    const app = await readApp(project, appId);
    if (app == null) {
      res.status(204).json({});
    } else {
      res.status(200).json(app);
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function getApps(req: Request, res: Response) {
  try {
    const projects = await readProjects(serviceAccountPath);
    if (!projects) {
      res.status(204).json();
    } else {
      const apps = await appsInProjects(projects);
      res.status(200).json(apps);
    }
  } catch (error) {
    handleError(error);
  }
}

async function getApp(req: Request, res: Response) {
  try {
    const appName = req.params.appName;
    const appPlatform = req.params.platform;
    const projects = await readProjects(serviceAccountPath);
    if (!projects) {
      res.status(204).json();
    } else {
      const appProjectResult = await searchForAppInProjects(
        projects,
        appName,
        appPlatform
      );
      res.status(200).json(appProjectResult);
    }
  } catch (error) {
    handleError(error);
  }
}

async function getAppConfigs(req: Request, res: Response) {
  try {
    const appName = req.params.appName;
    const appOptions = await moutAppMobileConfigs(appName);
    res.status(200).json(appOptions);
  } catch (error) {
    handleError(error);
  }
}

async function getUpdate(req: Request, res: Response) {
  try {
    await fetchData();
    res.status(200).json('Publisher Databse Up To date');
  } catch (error) {
    handleError(error, res);
  }
}

export {
  getAllProjectsWithApps,
  getProjectApps,
  getProjectApp,
  getApps,
  getApp,
  getAppConfigs,
  getUpdate,
};
