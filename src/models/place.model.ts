import mongoose, { Document, Schema } from 'mongoose';

interface IPhoto {
  id: string;
  url: string;
  caption: string;
  takenAt: Date;
  isPublic: boolean;
  tags: string[];
}

interface IComment {
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

interface ILocation {
  country: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
}

export interface IPlace extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: ILocation;
  photos: IPhoto[];
  category: string[];
  rating: number;
  visitDate: Date;
  isPublic: boolean;
  likes: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlace>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String
  },
  photos: [{
    url: String,
    caption: String,
    takenAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    },
    tags: [String]
  }],
  category: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  visitDate: Date,
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const Place = mongoose.model<IPlace>('Place', PlaceSchema); 