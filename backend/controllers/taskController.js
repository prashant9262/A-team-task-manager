const Task = require('../models/Task');

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, project, assignee } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'Medium',
      project,
      assignee: assignee || null,
    });

    const populated = await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignee', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks?projectId=xxx
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, search } = req.query;
    let query = {};

    if (projectId) query.project = projectId;

    // Members only see their own tasks
    if (req.user.role !== 'Admin') {
      query.assignee = req.user._id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update tasks assigned to them
    if (req.user.role !== 'Admin' && task.assignee?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('project', 'name')
      .populate('assignee', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/stats
const getDashboardStats = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'Admin') {
      matchQuery.assignee = req.user._id;
    }

    const totalTasks = await Task.countDocuments(matchQuery);

    const tasksByStatus = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const overdueTasks = await Task.countDocuments({
      ...matchQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });

    let tasksPerUser = [];
    if (req.user.role === 'Admin') {
      tasksPerUser = await Task.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$assignee', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$user.name', 'Unassigned'] }, count: 1 } },
      ]);
    }

    res.json({ totalTasks, tasksByStatus, overdueTasks, tasksPerUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboardStats };
