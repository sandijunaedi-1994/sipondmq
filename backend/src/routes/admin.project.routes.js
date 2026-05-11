const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.project.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply middleware to require admin access (LEGAL_VIEW or admin token)
router.use(authMiddleware.requireAuth);

// -- Projects (McDaftarTugas) --
router.get('/', controller.getProjects);
router.post('/', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);

// -- Budget (McBudget) --
router.get('/:projectId/budgets', controller.getProjectBudgets);
router.post('/:projectId/budgets', controller.createBudget);
router.delete('/budgets/:budgetId', controller.deleteBudget);
// -- Sub Tasks (McSubTugas) --
router.post('/:projectId/tasks', controller.createSubTask);
router.put('/tasks/:taskId', controller.updateSubTask);
router.delete('/tasks/:taskId', controller.deleteSubTask);

module.exports = router;
