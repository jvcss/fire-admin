import { PrismaClient, Version } from '@prisma/client';

const prisma = new PrismaClient();

async function createProjectWithApp(
  projectName: string,
  apiKey: string,
  appId: string,
  appName: string,
  appPlatform: string,
  appPackage: string,
  appVersion: Version,
  published: boolean,
  publishCode: string
) {
  try {
    const project = await prisma.projectApp.create({
      data: {
        project_name: projectName,
        apps: {
          create: {
            app_api_key: apiKey,
            app_id: appId,
            app_name: appName,
            app_platform: appPlatform,
            app_package: appPackage,
            app_version: appVersion,
            published: published,
            publish_code: publishCode,
          },
        },
      },
    });
    console.log('Created project with app:', project);
  } catch (error) {
    console.error('Error creating project:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createProjectWithoutApp(
  projectName: string,
  serviceAccountJson: any
) {
  try {
    const project = await prisma.projectApp.create({
      data: {
        project_name: projectName,
        service_account: serviceAccountJson,
      },
    });
    console.log('Created project with app:', project);
  } catch (error) {
    console.error('Error create Project Without App:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createProjectWithApps(
  projectName: string,
  serviceAccountJson: any,
  apps: any[] // list of apps details
) {
  try {
    const project = await prisma.projectApp.create({
      data: {
        project_name: projectName,
        service_account: serviceAccountJson,
        apps: {
          create: apps.map((app) => ({
            app_api_key: app.app_api_key,
            app_id: app.app_id,
            app_name: app.app_name,
            app_platform: app.app_platform,
            app_package: app.app_package,
            app_version: app.app_version,
            published: app.published,
            publish_code: app.publish_code,
          })),
        },
      },
    });
    console.log('Created project with apps:', project);
  } catch (error) {
    console.error('Error create Project Wit Apps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createProjectsWithApps(fullRepresentationOfDatabase: any) {
  try {
    for (const projectData of fullRepresentationOfDatabase) {
      const { project_name, service_account, apps } = projectData;
      if (apps.length > 0) {
        await createProjectWithApps(project_name, service_account, apps);
      } else {
        await createProjectWithoutApp(project_name, service_account);
      }
    }
  } catch (error) {
    console.error('Error create Projects Wit Apps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export {
  createProjectWithApp,
  createProjectWithoutApp,
  createProjectWithApps,
  createProjectsWithApps,
};
