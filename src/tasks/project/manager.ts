import fs, { PathLike } from 'fs';
import path from 'path';

import { createProjectsWithApps } from '@/models/postgresModel';
import {
  getFirebaseAdminForProject,
  serviceAccountPath,
} from '@/config/firebaseConfig';
import { getProjectManagement } from 'firebase-admin/project-management';
import { App } from 'firebase-admin/app';
import { handleError } from '@/utils/handles';

async function readApps(project: App) {
  try {
    const projectManagement = getProjectManagement(project);
    const androidApps = await projectManagement.listAndroidApps();
    const iosApps = await projectManagement.listIosApps();

    const androidAppsMeta = await Promise.all(
      androidApps.map(async (android) => {
        const androidDetails = projectManagement.androidApp(android.appId);
        const meta = await androidDetails.getMetadata();
        const name = meta.displayName ? meta.displayName : '';
        const pack = meta.packageName;

        let appInfo: IAppInfo = {
          appId: android.appId,
          nickname: name,
          packageName: pack,
        };

        return appInfo;
      })
    );

    const iosAppsMeta = await Promise.all(
      iosApps.map(async (ios) => {
        const iosDetails = projectManagement.iosApp(ios.appId);
        const meta = await iosDetails.getMetadata();
        const name = meta.displayName ? meta.displayName : '';
        const pack = meta.bundleId;

        let appInfo: IAppInfo = {
          appId: ios.appId,
          nickname: name,
          packageName: pack,
        };

        return appInfo;
      })
    );

    // Filter out null values, which represent failed operations.
    const appList = [...iosAppsMeta, ...androidAppsMeta].filter(
      (app) => app !== null
    );

    return appList;
  } catch (error) {
    handleError(error);
    return [];
  }
}

async function readAppByName(
  project: string,
  appName: string,
  appPlatform: string
) {
  try {
    const _project = getFirebaseAdminForProject(project);
    const apps = await readApps(_project);
    for (const app of apps) {
      if (!app) continue;
      if (app.nickname === appName) {
        if (appPlatform === '1' && app.appId.includes('ios')) {
          return app;
        } else if (appPlatform === '0' && app.appId.includes('android')) {
          return app;
        } else {
          continue;
        }
      }
    }
    return null;
  } catch (error) {
    handleError(error);
    return null;
  }
}

async function readApp(project: App, appId: string) {
  try {
    const projectManagement = getProjectManagement(project);
    let app = null;

    if (appId.includes('android')) {
      app = projectManagement.androidApp(appId);
      const meta = await app.getMetadata();
      return meta;
    } else if (appId.includes('ios')) {
      app = projectManagement.iosApp(appId);
      const meta = await app.getMetadata();
      return meta;
    } else {
      return null;
    }
  } catch (error) {
    handleError(error);
    return null;
  }
}

async function readAppDetails(project: App, appId: string) {
  try {
    const projectManagement = getProjectManagement(project);
    let app = null;

    if (appId.includes('android')) {
      app = projectManagement.androidApp(appId);
      const meta = await app.getMetadata();
      const conf = await readAppSettings(project, appId);
      return [meta, conf];
    } else if (appId.includes('ios')) {
      app = projectManagement.iosApp(appId);
      const meta = await app.getMetadata();
      const conf = await readAppSettings(project, appId);
      return [meta, conf];
    } else {
      return null;
    }
  } catch (error) {
    handleError(error);
    return null;
  }
}

async function readAppSettings(project: App, appId: string) {
  try {
    const projectManagement = getProjectManagement(project);
    let app = null;

    if (appId.includes('android')) {
      app = projectManagement.androidApp(appId);
      const configString = await app.getConfig();
      const config = JSON.parse(configString);
      return config;
    } else if (appId.includes('ios')) {
      app = projectManagement.iosApp(appId);
      const configString = await app.getConfig();
      // if return string should handle it with regex
      // Handle XML parsing for iOS config here
      const xml2js = require('xml2js');
      const parser = new xml2js.Parser();
      const config = await new Promise((resolve, reject) => {
        parser.parseString(configString, (error: Error, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      return config;
    }
  } catch (error) {
    handleError(error);
  }
}

async function readProjects(directoryPath: PathLike) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    const cleanNames = files.map((fileName) => {
      const cleanName = path.parse(fileName).name;
      return cleanName;
    });
    return cleanNames;
  } catch (error) {
    handleError(error);
    return null;
  }
}

async function searchForAppInProjects(
  projects: string[],
  appName: string,
  appPlatform: string
) {
  try {
    for (const project of projects) {
      const _project = getFirebaseAdminForProject(project);
      const apps = await readApps(_project);
      for (const app of apps) {
        if (!app) continue;
        if (appPlatform === '1' && app.appId.includes('ios')) {
          if (app.nickname === appName) {
            return project;
          }
        } else if (appPlatform === '0' && app.appId.includes('android')) {
          if (app.nickname === appName) {
            return project;
          }
        }
      }
    }
  } catch (error) {
    handleError(error);
  }
  return 'app inexistente';
}

///
//  {
//   "v5" : {
//     "android" : {
//       "appName": "projectName"
//     },
//     "ios" : {
//       "appName": "projectName"
//     }
//   },
//   "v4" : {
//     "android" : {
//       "appName": "projectName"
//     },
//     "ios" : {
//       "appName": "projectName"
//     }
//   }
//  }
//  */
async function orderAppsInProjects(projects: string[]) {
  var output: IAppConfiguration = {};
  try {
    for (const project of projects) {
      const _project = getFirebaseAdminForProject(project);
      const apps = await readApps(_project);

      for (const app of apps) {
        if (!app) continue;
        const { appId, packageName, nickname } = app;
        let version, platform;

        //determine the version based on the package name
        if (packageName.startsWith('br.com')) {
          version = 'v4';
        } else {
          version = 'v5';
        }

        //determine the platform based on the appId
        if (appId.includes('android')) {
          platform = 'android';
        } else if (appId.includes('ios')) {
          platform = 'ios';
        } else {
          platform = 'unknown';
        }

        //initialize the output structure if not already done
        if (!output[version]) {
          output[version] = {};
        }
        if (!output[version][platform]) {
          output[version][platform] = {};
        }
        output[version][platform][nickname] = project;
      }
    }
  } catch (error) {
    handleError(error);
  }
  return output;
}

type AppModel = {
  appId: string;
  nickname: string | undefined;
  packageName: string;
};

async function appsInProjects(projects: string[]) {
  var output: IAppInfo[] = [];
  try {
    for (const project of projects) {
      const _project = getFirebaseAdminForProject(project);
      const apps = await readApps(_project);
      output = [...apps, ...output];
    }
  } catch (error) {
    handleError(error);
  }
  return output;
}

async function moutAppMobileConfigs(appName: string) {
  try {
    const projects = await readProjects(serviceAccountPath);
    const platformIOS = '1';
    const platformAndroid = '0';
    if (!projects) return null;
    const appIOSProject = await searchForAppInProjects(
      projects,
      appName,
      platformIOS
    );
    const appAndroidProject = await searchForAppInProjects(
      projects,
      appName,
      platformAndroid
    );

    const iosApp = await readAppByName(appIOSProject, appName, platformIOS);
    const androidApp = await readAppByName(
      appAndroidProject,
      appName,
      platformAndroid
    );

    const projectIOS = getFirebaseAdminForProject(appIOSProject);
    const projectAndroid = getFirebaseAdminForProject(appIOSProject);
    let iosAppConf;
    let androidAppConf;
    if (iosApp) {
      iosAppConf = await readAppSettings(projectIOS, iosApp.appId);
    }
    if (androidApp) {
      androidAppConf = await readAppSettings(projectAndroid, androidApp.appId);
    }

    const iosDict = iosAppConf.plist.dict[0];

    const clientIdIndex = iosDict.key.indexOf('CLIENT_ID');
    const iosApiKeyIndex = iosDict.key.indexOf('API_KEY');
    const iosStorageBucketIndex = iosDict.key.indexOf('STORAGE_BUCKET');
    const iosMessagingSenderIdIndex = iosDict.key.indexOf('GCM_SENDER_ID');

    const iosClientId = iosDict.string[clientIdIndex];
    const iosApiKey = iosDict.string[iosApiKeyIndex];
    const iosStorageBucket = iosDict.string[iosStorageBucketIndex];
    const iosMessagingSenderId = iosDict.string[iosMessagingSenderIdIndex];

    let androidClientId;
    for (const clientId of androidAppConf.client[0].oauth_client) {
      if (clientId.client_type === 3) {
        androidClientId = clientId.client_id;
      }
    }

    const appOptions = {
      android: {
        apiKey: androidAppConf.client[0].api_key[0].current_key,
        appId: androidApp!.appId,
        messagingSenderId: androidAppConf.project_info.project_number,
        projectId: androidAppConf.project_info.project_id,
        databaseURL: androidAppConf.project_info.firebase_url,
        storageBucket: androidAppConf.project_info.storage_bucket,
      },
      ios: {
        apiKey: iosApiKey,
        appId: iosApp ? iosApp.appId : '',
        messagingSenderId: iosMessagingSenderId,
        projectId: appIOSProject,
        databaseURL: `https://${appIOSProject}.firebaseio.com`,
        storageBucket: iosStorageBucket,
        androidClientId: androidClientId,
        iosClientId: iosClientId,
        iosBundleId: iosApp ? iosApp.packageName : '',
      },
    };
    return appOptions;
  } catch (error) {
    handleError(error);
    return null;
  }
}

async function fetchData() {
  const projects = await readProjects(serviceAccountPath);
  let fullRepresentationOfDatabaseToRedis = [];
  if (!projects)
    throw Error(`Projects not found at the path: [${serviceAccountPath}]`);

  for (const project of projects) {
    const p = getFirebaseAdminForProject(project);
    const _apps = await readApps(p);
    const s_a = await fs.promises.readFile(
      `${serviceAccountPath}\\${project}.json`,
      { encoding: 'utf-8' }
    );
    const projectData = {
      project_name: project,
      service_account: JSON.parse(s_a), // Parse the service account JSON
      apps: await Promise.all(
        _apps.map(async (app) => {
          const appInfo = await readAppDetails(p, app!.appId);
          let apiKey;
          let pack;
          let version;

          if (appInfo![0].platform.includes('IOS')) {
            const iosDict = appInfo![1].plist.dict[0];
            const iosApiKeyIndex = iosDict.key.indexOf('API_KEY');
            apiKey = iosDict.string[iosApiKeyIndex];
            pack = appInfo![0].bundleId;
          } else {
            apiKey = appInfo![1].client[0].api_key[0].current_key;
            pack = appInfo![0].packageName;
          }

          if (pack.startsWith('br.com')) {
            version = 'V4';
          } else {
            version = 'V5';
          }

          return {
            app_id: appInfo![0].appId,
            app_name: appInfo![0].displayName,
            app_platform: appInfo![0].platform,
            app_package: pack,
            app_version: version,
            published: false,
            publish_code: '0.0.0',
            app_api_key: apiKey,
          };
        })
      ),
    };

    fullRepresentationOfDatabaseToRedis.push(projectData);
  }

  createProjectsWithApps(fullRepresentationOfDatabaseToRedis);

  // Now `fullRepresentationOfDatabaseToRedis` contains the JSON representation
  // for Redis with all projects and their associated apps.

  // Assuming you have a function to store this data in Redis, call it here.
  //storeDataInRedis(fullRepresentationOfDatabaseToRedis);
}

export {
  readProjects,
  searchForAppInProjects,
  orderAppsInProjects,
  appsInProjects,
  readApps,
  readApp,
  readAppByName,
  readAppSettings,
  moutAppMobileConfigs,
  fetchData,
  readAppDetails,
};
