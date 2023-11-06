import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { fetchData } from '@/tasks/project/manager';

const prisma = new PrismaClient();
//const redis:  = new createClient();

async function updateDatabase() {
  try {
    //should return a whole database
    const firebaseData = await fetchData();
    // Update PostgreSQL database
    // await prisma.firebaseData.create({
    //     data: firebaseData,
    // });
    // Update Redis cache
    // await redis.connect();
    // await redis.set('cached_data', JSON.stringify(firebaseData));

    console.log('Data updated successfully');
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    await prisma.$disconnect();
    //redis.quit();
  }
}

setInterval(updateDatabase, 7 * 24 * 60 * 60 * 1000);

// Initial run
updateDatabase();
