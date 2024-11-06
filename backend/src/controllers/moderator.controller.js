import { Report } from '../models/Report.js';
import { ModeratorAction } from '../models/ModeratorAction.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';

export const getReports = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const reports = await Report.find({ status })
      .populate('reporterId', 'username')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments({ status });

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { action, reason } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    const moderatorAction = new ModeratorAction({
      moderatorId: req.user._id,
      actionType: action,
      targetType: report.type,
      targetId: report.targetId,
      reason
    });

    // Execute action based on type
    switch (action) {
      case 'ban_user':
        await User.findByIdAndUpdate(report.targetId, {
          'status.banned': true,
          'status.active': false
        });
        break;
      case 'remove_content':
        switch (report.type) {
          case 'service':
            await Service.findByIdAndUpdate(report.targetId, {
              status: 'deleted'
            });
            break;
          case 'review':
            await Review.findByIdAndUpdate(report.targetId, {
              status: 'hidden'
            });
            break;
        }
        break;
      case 'warn_user':
        // Implement warning system
        break;
    }

    await moderatorAction.save();

    report.status = 'resolved';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    report.moderatorNotes = reason;
    await report.save();

    res.json({ message: 'Report resolved successfully' });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { type, targetId, reason, description } = req.body;

    // Validate target exists
    let target;
    switch (type) {
      case 'service':
        target = await Service.findById(targetId);
        break;
      case 'user':
        target = await User.findById(targetId);
        break;
      case 'review':
        target = await Review.findById(targetId);
        break;
    }

    if (!target) {
      throw new ApiError(404, 'Reported content not found');
    }

    const report = new Report({
      type,
      targetId,
      reporterId: req.user._id,
      reason,
      description
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};