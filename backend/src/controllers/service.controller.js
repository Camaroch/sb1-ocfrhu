import { Service } from '../models/Service.js';
import { ApiError } from '../utils/ApiError.js';
import { extractKeywords } from '../utils/textProcessing.js';

export const createService = async (req, res, next) => {
  try {
    const { title, description, category, pricing } = req.body;
    
    const keywords = extractKeywords(title + ' ' + description);
    
    const service = new Service({
      freelanceId: req.user._id,
      title,
      description,
      category,
      pricing,
      searchMeta: {
        keywords,
        category
      }
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
    
    const query = { status: 'active' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    const services = await Service.find(query)
      .populate('freelanceId', 'username profileImage')
      .sort({ 'stats.averageRating': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('freelanceId', 'username profileImage');
    
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }

    // Increment views
    service.stats.views += 1;
    await service.save();

    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      freelanceId: req.user._id
    });

    if (!service) {
      throw new ApiError(404, 'Service not found');
    }

    const updates = req.body;
    if (updates.title || updates.description) {
      updates.searchMeta = {
        ...service.searchMeta,
        keywords: extractKeywords(
          (updates.title || service.title) + ' ' + 
          (updates.description || service.description)
        )
      };
    }

    Object.assign(service, updates);
    await service.save();

    res.json(service);
  } catch (error) {
    next(error);
  }
};