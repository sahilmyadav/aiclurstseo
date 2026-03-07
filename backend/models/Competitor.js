import mongoose from 'mongoose';

const CompetitorSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      index: true
    },
    locationId: {
      type: String,
      required: true,
      index: true
    },
    searchType: {
      type: String,
      enum: ['business', 'user'],
      default: 'business'
    },
    userLocation: {
      lat: Number,
      lng: Number
    },
    keyword: {
      type: String,
      default: ''
    },
    competitors: [{
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        default: null
      },
      address: {
        type: String,
        default: ''
      },
      placeId: {
        type: String,
        required: true,
        unique: true
      },
      types: [{
        type: String
      }],
      priceLevel: Number,
      totalRatings: Number,
      location: {
        lat: Number,
        lng: Number
      },
      photos: [{
        photoReference: String,
        width: Number,
        height: Number
      }]
    }],
    searchLocation: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    lastFetched: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
CompetitorSchema.index({ accountId: 1, locationId: 1, searchType: 1 });

// TTL index to automatically delete expired cache entries
CompetitorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find cached competitors
CompetitorSchema.statics.findCachedCompetitors = function(accountId, locationId, searchType, lat, lng, radius = 5000) {
  // Check if coordinates are within reasonable distance (same search area)
  const searchRadius = radius / 1000; // Convert to km for approximate matching

  return this.findOne({
    accountId,
    locationId,
    searchType,
    expiresAt: { $gt: new Date() }, // Not expired
    $and: [
      { 'searchLocation.lat': { $gte: lat - (searchRadius / 111), $lte: lat + (searchRadius / 111) } },
      { 'searchLocation.lng': { $gte: lng - (searchRadius / 111), $lte: lng + (searchRadius / 111) } }
    ]
  });
};

export default mongoose.model('Competitor', CompetitorSchema);
