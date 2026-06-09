const Donation = require('../models/Donation');
const User = require('../models/User');

/**
 * Smart Matching Algorithm
 * Finds the best NGOs for a donation based on:
 * 1. Distance (closest first) — using MongoDB $geoNear
 * 2. Priority scoring based on expiry urgency
 *
 * @param {Object} donation - The donation document
 * @param {Number} maxDistance - Maximum distance in meters (default 50km)
 * @param {Number} limit - Max number of NGOs to return
 * @returns {Array} Ranked list of nearby NGOs
 */
const findNearbyNGOs = async (donation, maxDistance = 50000, limit = 10) => {
  try {
    const nearbyNGOs = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: donation.location.coordinates
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: { role: 'ngo', isActive: true }
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          organization: 1,
          address: 1,
          distance: 1,
          location: 1
        }
      }
    ]);

    return nearbyNGOs;
  } catch (error) {
    console.error('Error finding nearby NGOs:', error);
    return [];
  }
};

/**
 * Get prioritized donations for an NGO
 * Combines distance-based sorting with expiry urgency
 *
 * @param {Array} coordinates - [lng, lat] of the NGO
 * @param {Number} maxDistance - Maximum distance in meters
 * @returns {Array} Prioritized donations
 */
const getPrioritizedDonations = async (coordinates, maxDistance = 50000) => {
  try {
    const donations = await Donation.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coordinates
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: {
            status: 'pending',
            expiryTime: { $gt: new Date() }
          }
        }
      },
      {
        $addFields: {
          // Calculate hours until expiry
          hoursUntilExpiry: {
            $divide: [
              { $subtract: ['$expiryTime', new Date()] },
              1000 * 60 * 60
            ]
          },
          // Distance in km
          distanceKm: { $divide: ['$distance', 1000] }
        }
      },
      {
        $addFields: {
          // Priority score: lower = higher priority
          // Weight: 60% expiry urgency + 40% distance
          priorityScore: {
            $add: [
              { $multiply: ['$hoursUntilExpiry', 0.6] },
              { $multiply: ['$distanceKm', 0.4] }
            ]
          }
        }
      },
      {
        $sort: { priorityScore: 1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'donor',
          foreignField: '_id',
          as: 'donorInfo'
        }
      },
      {
        $unwind: '$donorInfo'
      },
      {
        $project: {
          foodName: 1,
          quantity: 1,
          unit: 1,
          description: 1,
          expiryTime: 1,
          image: 1,
          location: 1,
          address: 1,
          status: 1,
          distance: 1,
          distanceKm: 1,
          hoursUntilExpiry: 1,
          priorityScore: 1,
          createdAt: 1,
          'donorInfo.name': 1,
          'donorInfo.phone': 1,
          'donorInfo.email': 1
        }
      }
    ]);

    return donations;
  } catch (error) {
    console.error('Error getting prioritized donations:', error);
    return [];
  }
};

module.exports = { findNearbyNGOs, getPrioritizedDonations };
