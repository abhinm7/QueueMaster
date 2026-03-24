import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { TasksService } from './tasks/tasks.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('🌱 Starting database seed...');
  
  // Create a headless Nest application
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const tasksService = app.get(TasksService);

  const testEmail = 'admin@bro.com';
  let user = await usersService.findByEmail(testEmail);

  if (!user) {
    console.log('Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await usersService.create({ email: testEmail, password: hashedPassword });
    console.log(`User created: ${user.email}`);

    console.log('Injecting 5 dummy tasks...');
    const types = ['export', 'report', 'import'];
    
    for (let i = 0; i < 5; i++) {
      await tasksService.createTask({
        type: types[i % 3],
        payload: { test_run: i, generatedBy: 'seed-script' }
      }, user.id);
    }
    console.log('Tasks queued successfully.');
  } else {
    console.log('Database already seeded. Skipping.');
  }

  await app.close();
  console.log('✅ Seeding complete.');

  process.exit(0);
}

bootstrap();