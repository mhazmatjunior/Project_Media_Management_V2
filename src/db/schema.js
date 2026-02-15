import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tables Definitions

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    password: text('password').notNull(),
    role: text('role').notNull().default('member'), // 'main_team', 'team_lead', 'member'
    departments: text('departments'), // JSON string or comma-separated list of departments
    status: text('status').notNull().default('active'), // 'active', 'offline'
    tokenVersion: integer('token_version').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Groups table
export const groups = pgTable('groups', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').default('group'), // 'group', 'dm'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Group Members table
export const groupMembers = pgTable('group_members', {
    id: serial('id').primaryKey(),
    groupId: integer('group_id').references(() => groups.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    role: text('role').default('member'), // 'admin', 'member'
    lastReadAt: timestamp('last_read_at').defaultNow(), // For tracking unread messages
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Videos table
export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    videoUrl: text('video_url'),
    status: text('status').notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'archived'
    currentDepartment: text('current_department'), // 'research', 'writer', 'speaker', 'video', 'graphics'
    category: text('category').default('general'), // 'general', 'tutorial', 'vlog', etc.
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    duration: integer('duration'), // in seconds
    userId: integer('user_id').references(() => users.id),
    assignedTo: integer('assigned_to').references(() => users.id),
    isPublished: boolean('is_published').default(false),
    departmentEnteredAt: timestamp('department_entered_at').defaultNow(),
    forwardedAt: timestamp('forwarded_at'),
    previousDepartment: text('previous_department'),
    takebackRequested: boolean('takeback_requested').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Video History table
export const videoHistory = pgTable('video_history', {
    id: serial('id').primaryKey(),
    videoId: integer('video_id').references(() => videos.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    department: text('department').notNull(), // 'research', 'writer', 'speaker', 'video', 'graphics'
    action: text('action').notNull(), // 'completed'
    timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Video Assets table
export const videoAssets = pgTable('video_assets', {
    id: serial('id').primaryKey(),
    videoId: integer('video_id').references(() => videos.id).notNull(),
    department: text('department').notNull(), // 'research', 'writer', 'speaker', 'video', 'graphics'
    fileName: text('file_name').notNull(), // R2 Key
    fileUrl: text('file_url'), // Public URL or just key
    fileType: text('file_type'),
    size: integer('size'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Content topics table (Content Calendar)
export const contentTopics = pgTable('content_topics', {
    id: serial('id').primaryKey(),
    department: text('department').notNull(), // 'Research', 'Writer', etc.
    category: text('category').notNull(), // 'YL', 'CTA'
    topic: text('topic').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
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

// Deadlines table
export const deadlines = pgTable('deadlines', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    datetime: timestamp('datetime').notNull(),
    audienceType: text('audience_type').notNull(), // 'all', 'leads', 'members', 'specific'
    targetUsers: text('target_users'), // JSON string of user IDs for specific targeting
    description: text('description'),
    status: text('status').default('active'), // 'active', 'completed', 'missed'
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    senderId: integer('sender_id').references(() => users.id).notNull(),
    receiverId: integer('receiver_id').references(() => users.id), // Nullable for group messages
    groupId: integer('group_id').references(() => groups.id), // Link to groups table
    channel: text('channel'), // Legacy support or specific channel categorization
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Relations Definitions

export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(videos, { relationName: 'creator' }),
    assignments: many(videos, { relationName: 'assignee' }),
    history: many(videoHistory),
    sentMessages: many(messages, { relationName: 'sender' }),
    receivedMessages: many(messages, { relationName: 'receiver' }),
    groupMemberships: many(groupMembers),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
    members: many(groupMembers),
    messages: many(messages),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
    group: one(groups, {
        fields: [groupMembers.groupId],
        references: [groups.id],
    }),
    user: one(users, {
        fields: [groupMembers.userId],
        references: [users.id],
    }),
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

export const messagesRelations = relations(messages, ({ one }) => ({
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: 'sender',
    }),
    receiver: one(users, {
        fields: [messages.receiverId],
        references: [users.id],
        relationName: 'receiver',
    }),
    group: one(groups, {
        fields: [messages.groupId],
        references: [groups.id],
    }),
}));
