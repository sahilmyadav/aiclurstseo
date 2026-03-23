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
      primaryCategory: String,
      categories: {
        primaryCategory: {
          displayName: String,
          name: String
        },
        additionalCategories: [{
          displayName: String,
          name: String
        }]
      },
      phoneNumbers: {
        primaryPhone: String
      },
      websiteUri: String,
      regularHours: {
        periods: [{
          openDay: String,
          openTime: {
            hours: Number,
            minutes: Number
          },
          closeDay: String,
          closeTime: {
            hours: Number,
            minutes: Number
          }
        }],
        weekdayText: [String]
      },
      businessStatus: String,
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
      }],
      totalPhotos: {
        type: Number,
        default: 0
      },
      reviews: [{
        authorName: String,
        rating: Number,
        text: String,
        time: Number,
        relativeTimeDescription: String,
        profilePhotoUrl: String
      }],
      totalReviews: {
        type: Number,
        default: 0
      }
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
