import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Videos table
export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    videoUrl: text('video_url'),
    status: text('status').notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'archived'
    category: text('category').default('general'), // 'general', 'tutorial', 'vlog', etc.
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    duration: integer('duration'), // in seconds
    userId: integer('user_id').references(() => users.id),
    isPublished: boolean('is_published').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table (if you need project management)
export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'), // 'active', 'completed', 'archived'
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
