import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';

export const search = async (req, res, next) => {
  try {
    const { 
      q, 
      category,
      minPrice,
      maxPrice,
      sort = 'relevance',
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'active' };

    // Text search if query provided
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query['searchMeta.category'] = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { 'pricing.price': 1 };
        break;
      case 'price_desc':
        sortOptions = { 'pricing.price': -1 };
        break;
      case 'rating':
        sortOptions = { 'stats.averageRating': -1 };
        break;
      default:
        if (q) {
          sortOptions = { score: { $meta: 'textScore' } };
        } else {
          sortOptions = { 'stats.averageRating': -1 };
        }
    }

    const services = await Service.find(
      query,
      q ? { score: { $meta: 'textScore' } } : null
    )
      .populate('freelanceId', 'username profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true })
      .sort({ order: 1 });
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};