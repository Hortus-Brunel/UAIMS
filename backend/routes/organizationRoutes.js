const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authenticate, authorize } = require('../middlewares/auth');
const { successResponse } = require('../utils/response');

// GET /api/organization/faculties
router.get('/faculties', async (req, res, next) => {
  try {
    const faculties = await prisma.faculty.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { departments: true } } },
    });
    return successResponse(res, 'Faculties retrieved.', { faculties });
  } catch (err) { next(err); }
});

// GET /api/organization/faculties/:id/departments
router.get('/faculties/:id/departments', async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      where: { facultyId: req.params.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { classes: true } } },
    });
    return successResponse(res, 'Departments retrieved.', { departments });
  } catch (err) { next(err); }
});

// GET /api/organization/departments/:id/classes
router.get('/departments/:id/classes', async (req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      where: { departmentId: req.params.id },
      orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
      include: { level: true },
    });
    return successResponse(res, 'Classes retrieved.', { classes });
  } catch (err) { next(err); }
});

// GET /api/organization/departments/:id/programmes
router.get('/departments/:id/programmes', async (req, res, next) => {
  try {
    const programmes = await prisma.programme.findMany({
      where: { departmentId: req.params.id },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, 'Programmes retrieved.', { programmes });
  } catch (err) { next(err); }
});

// GET /api/organization/academic-levels
router.get('/academic-levels', async (req, res, next) => {
  try {
    const levels = await prisma.academicLevel.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, 'Academic levels retrieved.', { levels });
  } catch (err) { next(err); }
});

// GET /api/organization/clubs
router.get('/clubs', async (req, res, next) => {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { name: 'asc' },
      include: { faculty: { select: { name: true, shortCode: true } } },
    });
    return successResponse(res, 'Clubs retrieved.', { clubs });
  } catch (err) { next(err); }
});

// GET /api/organization/departments  — flat list (all departments)
router.get('/departments', async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { faculty: { select: { name: true, shortCode: true } } },
    });
    return successResponse(res, 'All departments retrieved.', { departments });
  } catch (err) { next(err); }
});

// GET /api/organization/classes  — flat list (all classes)
router.get('/classes', async (req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
      include: { department: { select: { name: true } }, level: { select: { name: true } } },
    });
    return successResponse(res, 'All classes retrieved.', { classes });
  } catch (err) { next(err); }
});

// GET /api/organization/programmes  — flat list (all programmes)
router.get('/programmes', async (req, res, next) => {
  try {
    const programmes = await prisma.programme.findMany({
      orderBy: { name: 'asc' },
      include: { department: { select: { name: true, faculty: { select: { name: true } } } } },
    });
    return successResponse(res, 'All programmes retrieved.', { programmes });
  } catch (err) { next(err); }
});

// GET /api/organization/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, 'Categories retrieved.', { categories });
  } catch (err) { next(err); }
});

// POST /api/organization/categories (L2+)
router.use(authenticate);
router.post('/categories', authorize('L2_DEPT_ADMIN'), async (req, res, next) => {
  try {
    const { name, description, colorHex } = req.body;
    const category = await prisma.category.create({ data: { name, description, colorHex } });
    return successResponse(res, 'Category created.', { category }, 201);
  } catch (err) { next(err); }
});

// PATCH /api/organization/categories/:id (L2+)
router.patch('/categories/:id', authorize('L2_DEPT_ADMIN'), async (req, res, next) => {
  try {
    const { name, description, colorHex } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(description && { description }), ...(colorHex && { colorHex }) },
    });
    return successResponse(res, 'Category updated.', { category });
  } catch (err) { next(err); }
});

// DELETE /api/organization/categories/:id (L4+)
router.delete('/categories/:id', authorize('L4_UNIVERSITY_ADMIN'), async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    return successResponse(res, 'Category deleted.');
  } catch (err) { next(err); }
});

module.exports = router;
