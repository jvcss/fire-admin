import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

import {
  getFirebaseAdminForProject,
  serviceAccountPath,
} from '../config/firebaseConfig'; // Adjust the import path

import app from '@/index';
import { IncomingMessage, Server, ServerResponse } from 'node:http';

describe('API Endpoint Tests', () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(() => {
    // Start the server before tests
    server = app.listen(3001);
    // Mock Firebase Admin initialization
    jest.mock('firebase-admin/app', () => {
      return {
        initializeApp: jest.fn(),
        getApps: jest.fn().mockReturnValue([]),
        cert: jest.fn(),
      };
    });
  });

  afterAll((done) => {
    // Close the server after tests
    server.close(done);
    // Restore the original implementation
    jest.unmock('firebase-admin/app');
  });

  // it('Should return the structured relation version, platform, project, app', async () => {
  //   const response = await request(app).get(
  //     '/projects'
  //   );
  //   expect(response.body).not.toBeNull();
  //   expect(response.statusCode).toBe(200)
  //   expect(Array.isArray(response.body)).toBe(true);
  //   response.body.forEach((app) => {
  //     expect(app).toHaveProperty('v4');
  //     expect(app).toHaveProperty('v5');
  //   });
  // });

  // it('Should return the list of apps for a project', async () => {
  //   const response = await request(server).get(
  //     '/projects/escolar-manager-smart/apps'
  //   );
  //   expect(response.body).not.toBeNull();
  //   expect(response.statusCode).toBe(200)
  //   expect(Array.isArray(response.body)).toBe(true);
  //   response.body.forEach((content) => {
  //     expect(content).toHaveProperty('appId');
  //     expect(content).toHaveProperty('nickname');
  //     expect(content).toHaveProperty('packageName');
  //   });
  // });

  // it('Should return one app metadata for a project', async () => {
  //   const response = await request(server).get(
  //     '/projects/escolar-manager-smart/apps/0/1:375192504801:android:15a13e545ce8d33585eaa0'
  //   );
  //   expect(response.body).not.toBeNull();
  //   expect(response.statusCode).toBe(200);
  // });

  // it('should receive all apps in a project', async () => {
  //   const response = await request(app).get(
  //     '/apps'
  //   );
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).not.toBeNull();
  //   expect(Array.isArray(response.body)).toBe(true);
  // });

  // it('should receive one app from a project', async () => {
  //   const response = await request(app).get(
  //     '/apps/espa/0'
  //   );
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).not.toBeNull();
  //   expect(typeof response.body).toBe('string');
  // });
});
