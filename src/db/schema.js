import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    password: text('password').notNull(),
    role: text('role').notNull().default('member'), // 'main_team', 'team_lead', 'member'
    departments: text('departments'), // JSON string or comma-separated list of departments
    status: text('status').notNull().default('active'), // 'active', 'offline'
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
    currentDepartment: text('current_department'), // 'research', 'writer', 'speaker', 'graphics'
    category: text('category').default('general'), // 'general', 'tutorial', 'vlog', etc.
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    duration: integer('duration'), // in seconds
    userId: integer('user_id').references(() => users.id),
    assignedTo: integer('assigned_to').references(() => users.id),
    isPublished: boolean('is_published').default(false),
    departmentEnteredAt: timestamp('department_entered_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Video History table for tracking team collaboration
export const videoHistory = pgTable('video_history', {
    id: serial('id').primaryKey(),
    videoId: integer('video_id').references(() => videos.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    department: text('department').notNull(), // 'research', 'writer', 'speaker', 'graphics'
    action: text('action').notNull(), // 'completed'
    timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Projects table (Legacy/Optional)
export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(videos, { relationName: 'creator' }),
    assignments: many(videos, { relationName: 'assignee' }),
    history: many(videoHistory),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
    creator: one(users, {
        fields: [videos.userId],
        references: [users.id],
        relationName: 'creator',
    }),
    assignee: one(users, {
        fields: [videos.assignedTo],
        references: [users.id],
        relationName: 'assignee',
    }),
    history: many(videoHistory),
}));

export const videoHistoryRelations = relations(videoHistory, ({ one }) => ({
    project: one(videos, {
        fields: [videoHistory.videoId],
        references: [videos.id],
    }),
    user: one(users, {
        fields: [videoHistory.userId],
        references: [users.id],
    }),
}));

// Reminders table
export const reminders = pgTable('reminders', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    datetime: timestamp('datetime').notNull(),
    audienceType: text('audience_type').notNull(), // 'all', 'leads', 'members', 'specific'
    targetUsers: text('target_users'), // JSON string of user IDs for specific targeting
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
