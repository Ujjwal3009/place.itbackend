import axios from 'axios';
import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';
import { Place } from '../models/place.model';
import bcrypt from 'bcrypt';

// Indian name components for generating usernames
const indianNames = {
  first: [
    'Aarav', 'Vihaan', 'Arjun', 'Krishna', 'Aditya', 'Rohan', 'Vivaan', 'Dhruv',
    'Ishaan', 'Shivam', 'Riya', 'Aadhya', 'Ananya', 'Diya', 'Saanvi', 'Aanya',
    'Pari', 'Aditi', 'Myra', 'Neha', 'Dev', 'Kabir', 'Yash', 'Reyansh', 'Veer',
    'Sai', 'Arnav', 'Arun', 'Aryan', 'Zara', 'Kiara', 'Avni', 'Sara', 'Mira'
  ],
  last: [
    'Patel', 'Kumar', 'Singh', 'Shah', 'Sharma', 'Verma', 'Gupta', 'Reddy',
    'Kapoor', 'Malhotra', 'Joshi', 'Chopra', 'Mehta', 'Sinha', 'Rao', 'Chauhan',
    'Yadav', 'Tiwari', 'Bhat', 'Nair', 'Menon', 'Iyer', 'Kaur', 'Gill'
  ],
  cities: [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Mysore'
  ]
};

// Function to generate random Indian name
function generateIndianName() {
  const firstName = indianNames.first[Math.floor(Math.random() * indianNames.first.length)];
  const lastName = indianNames.last[Math.floor(Math.random() * indianNames.last.length)];
  return { firstName, lastName };
}

// Function to generate username variations
function generateUsername(firstName: string, lastName: string): string {
  const variations = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`,
    `the.${firstName.toLowerCase()}`,
    `${firstName.toLowerCase()}.travels`,
    `wandering.${firstName.toLowerCase()}`,
    `${firstName.toLowerCase()}.wanderlust`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

// Function to generate username variations
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let suffix = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${suffix}`;
    suffix++;
  }

  return username;
}

// Function to generate Indian bio
function generateBio(firstName: string, city: string): string {
  const bioTemplates = [
    `🇮🇳 Exploring India one city at a time | Based in ${city}`,
    `Travel enthusiast capturing the essence of Incredible India 📸`,
    `${firstName} | Travel & Photography | Discovering hidden gems of India`,
    `Wanderlust 🌏 | Indian Culture 🪔 | Travel Stories 📝`,
    `Sharing my journey through the diverse landscapes of India ✨`,
    `${city} 📍| Travel Blogger | Food & Culture Explorer`,
    `Creating memories across India 🇮🇳 | Photography 📸 | Adventure 🌟`,
    `Professional wanderer documenting the beauty of India`,
    `Travel • Culture • Photography | Based in ${city} 🏠`,
    `Exploring the unexplored | Indian travel diaries 📝`
  ];
  return bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
}

// Pexels API configuration
const pexelsConfig = {
  headers: {
    'Authorization': 'bj5Sr52WZYM80EO4WyNnnm5CFOzzDm46RHj0vOn31UbNyQvpGswUwZ3d'
  }
};

// Function to fetch tourist attractions from OSM
async function getTouristAttractions(): Promise<any[]> {
  try {
    const response = await axios.get(
      'https://overpass-api.de/api/interpreter?data=[out:json];node["tourism"="attraction"](18,73,35,90);out;'
    );
    return response.data.elements || [];
  } catch (error) {
    console.error('Error fetching OSM attractions:', error);
    return [];
  }
}

async function getImageForPlace(place: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(place)}&per_page=1`,
      pexelsConfig
    );
    return response.data.photos[0]?.src?.large || '';
  } catch (error) {
    console.error(`Error fetching image for ${place}:`, error);
    return '';
  }
}

async function createUser(index: number) {
  const { firstName, lastName } = generateIndianName();
  const baseUsername = generateUsername(firstName, lastName);
  const username = await generateUniqueUsername(baseUsername);
  const email = `${username}@example.com`;
  const password = await bcrypt.hash('password123', 10);
  const city = indianNames.cities[Math.floor(Math.random() * indianNames.cities.length)];

  const user = new User({
    username,
    email,
    password,
    fullName: `${firstName} ${lastName}`,
    bio: generateBio(firstName, city),
    profilePhoto: '',
    location: {
      country: 'India',
      city
    },
    preferences: {
      placeTypes: [
        ...new Set([
          'Historical',
          'Cultural',
          'Nature',
          'Architecture',
          'Religious',
          'Food',
          'Adventure',
          'Heritage'
        ].sort(() => Math.random() - 0.5).slice(0, 4))
      ],
      travelStyle: [
        ...new Set([
          'Adventure',
          'Cultural',
          'Photography',
          'Backpacking',
          'Luxury',
          'Budget',
          'Solo',
          'Family'
        ].sort(() => Math.random() - 0.5).slice(0, 3))
      ],
      activities: [
        ...new Set([
          'Sightseeing',
          'Photography',
          'Local Food',
          'Temple Visits',
          'Street Food',
          'Shopping',
          'Hiking',
          'Festival'
        ].sort(() => Math.random() - 0.5).slice(0, 4))
      ],
      accommodation: [
        ...new Set([
          'Hotel',
          'Resort',
          'Heritage Stay',
          'Homestay',
          'Hostel',
          'Boutique Hotel'
        ].sort(() => Math.random() - 0.5).slice(0, 3))
      ]
    },
    social: {
      instagram: username,
      twitter: username,
      facebook: username
    },
    settings: {
      emailNotifications: true,
      language: 'en',
      currency: 'INR',
      privacy: {
        defaultPhotoPrivacy: true,
        profileVisibility: 'public',
        showLocation: true,
        showVisitedPlaces: true
      }
    },
    stats: {
      totalPlaces: 0,
      totalPhotos: 0,
      totalPublicPlaces: 0,
      totalPrivatePlaces: 0,
      joinedDate: new Date(),
      lastActive: new Date()
    }
  });

  await user.save();
  return user;
}

async function createPlaceForUser(userId: string, attraction: any, imageUrl: string) {
  const placeName = attraction.tags?.name || 'Tourist Attraction';
  
  const place = new Place({
    userId,
    title: placeName,
    description: `Beautiful view of ${placeName}, a fascinating tourist attraction in India.`,
    location: {
      country: 'India',
      city: attraction.tags?.city || attraction.tags?.place || 'Unknown City',
      coordinates: {
        latitude: attraction.lat,
        longitude: attraction.lon
      },
      address: attraction.tags?.address || `Tourist Attraction, ${placeName}`
    },
    photos: [{
      url: imageUrl,
      caption: `A stunning view of ${placeName}`,
      takenAt: new Date(),
      isPublic: true,
      tags: ['India', 'Tourism', 'Heritage', 'Architecture']
    }],
    category: ['Historical', 'Cultural', 'Architecture'],
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
    visitDate: new Date(),
    isPublic: true,
    likes: Math.floor(Math.random() * 100),
    comments: []
  });

  await place.save();
  return place;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Fetch tourist attractions from OSM
    const attractions = await getTouristAttractions();
    console.log(`Fetched ${attractions.length} attractions from OSM`);

    // Create 100 users
    for (let i = 1; i <= 100; i++) {
      const user = await createUser(i);
      console.log(`Created user ${i}: ${user.username}`);

      // Create 1 place for each user
      const attraction = attractions[Math.floor(Math.random() * attractions.length)];
      if (attraction && attraction.tags?.name) {
        const imageUrl = await getImageForPlace(attraction.tags.name);
        const place = await createPlaceForUser(user._id, attraction, imageUrl);
        console.log(`Created place for ${user.username}: ${place.title}`);
      }
    }

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();