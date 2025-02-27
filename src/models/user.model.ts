import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Interfaces
interface INotification {
  message: string;
  createdAt: Date;
}

interface ISocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

interface IPreferences {
  placeTypes: string[];
  travelStyle: string[];
  activities: string[];
  accommodation: string[];
}

interface ISocial {
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

interface IPrivacySettings {
  defaultPhotoPrivacy: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  showLocation: boolean;
  showVisitedPlaces: boolean;
}

interface ISettings {
  emailNotifications: boolean;
  language: string;
  currency: string;
  privacy: IPrivacySettings;
}

interface IStats {
  totalPlaces: number;
  totalPhotos: number;
  totalPublicPlaces: number;
  totalPrivatePlaces: number;
  joinedDate: Date;
  lastActive: Date;
}

interface ILocation {
  country: string;
  city: string;
}

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePhoto: string;
  bio: string;
  location: ILocation;
  preferences: IPreferences;
  social: ISocial;
  settings: ISettings;
  stats: IStats;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Add this interface to properly type the document with timestamps
interface IUserDocument extends IUser {
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    country: String,
    city: String
  },
  preferences: {
    placeTypes: [String],
    travelStyle: [String],
    activities: [String],
    accommodation: [String]
  },
  social: {
    type: Object,
    default: {}
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    privacy: {
      defaultPhotoPrivacy: {
        type: Boolean,
        default: true
      },
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      },
      showLocation: {
        type: Boolean,
        default: true
      },
      showVisitedPlaces: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalPlaces: {
      type: Number,
      default: 0
    },
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalPublicPlaces: {
      type: Number,
      default: 0
    },
    totalPrivatePlaces: {
      type: Number,
      default: 0
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update the virtual for user's full profile
UserSchema.virtual('fullProfile').get(function(this: IUserDocument) {
  return {
    id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    profilePhoto: this.profilePhoto,
    bio: this.bio,
    location: this.location,
    social: this.social,
    preferences: this.preferences,
    settings: this.settings,
    stats: this.stats,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Ensure virtuals are included when converting document to JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password; // Remove password from JSON output
    return ret;
  }
});

// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'location.country': 1, 'location.city': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);