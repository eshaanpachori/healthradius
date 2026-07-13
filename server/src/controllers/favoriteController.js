import { Favorite } from '../models/Favorite.js';
import { activeProvider } from '../services/hospitalProviders/providerInterface.js';

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id });
    
    // Fetch details for each saved hospital
    const detailedFavorites = [];
    for (const fav of favorites) {
      try {
        const details = await activeProvider.getHospitalDetails(fav.hospitalId);
        if (details && details.source === fav.source) {
          detailedFavorites.push(details);
        }
      } catch (err) {
        // Skip hospitals that are missing/cannot load
      }
    }

    res.json({
      success: true,
      data: {
        favorites: detailedFavorites
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.body;
    const userId = req.user._id;

    // Check duplicate
    const existing = await Favorite.findOne({ user: userId, source, hospitalId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Hospital is already in your favorites.' });
    }

    // Verify hospital exists first
    const hospitalExists = await activeProvider.getHospitalDetails(hospitalId);
    if (!hospitalExists) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const favorite = await Favorite.create({
      user: userId,
      source,
      hospitalId
    });

    res.status(201).json({
      success: true,
      message: 'Hospital added to favorites',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({ user: userId, source, hospitalId });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite entry not found.' });
    }

    await favorite.deleteOne();

    res.json({
      success: true,
      message: 'Hospital removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};
