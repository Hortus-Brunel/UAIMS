-- Enable uuid extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Academic Levels
INSERT INTO "academic_levels" ("id", "name") VALUES 
(gen_random_uuid(), 'Level 100'),
(gen_random_uuid(), 'Level 200'),
(gen_random_uuid(), 'Level 300'),
(gen_random_uuid(), 'Level 400'),
(gen_random_uuid(), 'Level 500'),
(gen_random_uuid(), 'MSc'),
(gen_random_uuid(), 'PhD')
ON CONFLICT ("name") DO NOTHING;

-- 2. Categories
INSERT INTO "categories" ("id", "name", "description", "colorHex") VALUES 
(gen_random_uuid(), 'Academics', 'Academic timetables and notes', '#1B3A6B'),
(gen_random_uuid(), 'Exams', 'Examination timetables and venues', '#DC2626'),
(gen_random_uuid(), 'Events', 'University events and seminars', '#D97706'),
(gen_random_uuid(), 'Scholarships', 'Scholarship and financial aid', '#059669'),
(gen_random_uuid(), 'General', 'General notices', '#4B5563')
ON CONFLICT ("name") DO NOTHING;

-- 3. Super Admin User
INSERT INTO "users" ("id", "fullName", "email", "matricule", "passwordHash", "accessLevel", "isEmailVerified", "isActive", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'ASSONKENG NGUIMDO ORTUS BRUNEL', 'oassonkeng@gmail.com', 'FE24A228', '$2b$12$hBrYElsykis9XxfVBQ5OROJsQ/YxKjscio2aR4O..aVNexnKu23FK', 'L5_SUPER_ADMIN', true, true, NOW(), NOW())
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "accessLevel" = EXCLUDED."accessLevel";
