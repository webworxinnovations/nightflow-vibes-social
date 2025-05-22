// Types
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'dj' | 'fan' | 'promoter' | 'venue' | 'sub-promoter';
  bio?: string;
  location?: string;
  genres?: string[];
  followers?: number;
  following?: number;
  coverImage?: string;
  isFollowing?: boolean;
  isLive?: boolean;
  parentPromoterId?: string; // For sub-promoters, references main promoter
}

export interface SubPromoter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  parentPromoterId: string; // References the main promoter id
  ticketsSold: number;
  uniqueCode: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description: string;
  lineup: User[];
  image: string;
  price: number;
  ticketsSold: number;
  maxCapacity: number;
  promoter: User;
  isLive?: boolean;
  vibe?: number;
  subPromoterSales?: SubPromoterSale[]; // Track sales by sub-promoters
}

export interface SubPromoterSale {
  subPromoterId: string;
  eventId: string;
  ticketsSold: number;
  totalRevenue: number;
  lastSaleDate?: string;
}

// Define the missing interfaces
export interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  hasLiked?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
}

export interface SongRequest {
  id: string;
  song: Song;
  fan: User;
  message?: string;
  tipAmount: number;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

// Mock Users (DJs, Promoters, Fans)
export const users: User[] = [
  {
    id: '1',
    name: 'DJ Jnyc',
    username: 'PartyWithJnyc',
    avatar: '/lovable-uploads/56a20a5c-18c3-476b-bce8-ce10030b6e26.png',
    role: 'dj',
    bio: 'House music maestro with 10+ years of experience. Resident DJ at Echoplex.',
    location: 'Los Angeles, CA',
    genres: ['House', 'Tech House', 'Deep House'],
    followers: 15420,
    following: 342,
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG5pZ2h0Y2x1YnxlbnwwfHwwfHx8MA%3D%3D',
    isFollowing: true,
    isLive: true
  },
  {
    id: '2',
    name: 'Maya Chen',
    username: 'mayabeats',
    avatar: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVtYWxlJTIwZGp8ZW58MHx8MHx8fDA%3D',
    role: 'dj',
    bio: 'Techno and breaks specialist. Playing at clubs and festivals worldwide.',
    location: 'Berlin, Germany',
    genres: ['Techno', 'Breaks', 'Acid'],
    followers: 28750,
    following: 210,
    coverImage: 'https://images.unsplash.com/photo-1571266028253-6c7f1cac3643?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVjaG5vfGVufDB8fDB8fHww',
    isFollowing: false
  },
  {
    id: '3',
    name: 'Jamal Washington',
    username: 'djjamal',
    avatar: 'https://images.unsplash.com/photo-1604904612715-47bf9d9bc670?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjBtYW58ZW58MHx8MHx8fDA%3D',
    role: 'dj',
    bio: 'Hip-hop and R&B specialist with roots in Atlanta. Bringing Southern vibes everywhere.',
    location: 'Atlanta, GA',
    genres: ['Hip-Hop', 'R&B', 'Trap'],
    followers: 32100,
    following: 425,
    coverImage: 'https://images.unsplash.com/photo-1520870121499-7dddb6ccbcde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGlwJTIwaG9wfGVufDB8fDB8fHww',
    isFollowing: true,
    isLive: true
  },
  {
    id: '4',
    name: 'Sophie Martinez',
    username: 'sophiegrooves',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmVtYWxlJTIwZGp8ZW58MHx8MHx8fDA%3D',
    role: 'dj',
    bio: 'Progressive and melodic techno. Creating immersive musical journeys.',
    location: 'Miami, FL',
    genres: ['Progressive House', 'Melodic Techno', 'Organic House'],
    followers: 18300,
    following: 198,
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRqJTIwc2V0fGVufDB8fDB8fHww',
    isFollowing: false
  },
  {
    id: '5',
    name: 'Ravi Patel',
    username: 'ravimixes',
    avatar: 'https://images.unsplash.com/photo-1589040133262-c5b23c332713?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5kaWFuJTIwbWFufGVufDB8fDB8fHww',
    role: 'dj',
    bio: 'Fusion specialist mixing Eastern sounds with electronic dance music.',
    location: 'London, UK',
    genres: ['Global Bass', 'Bhangra', 'Electronica'],
    followers: 12450,
    following: 302,
    coverImage: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3Ryb25pYyUyMG11c2ljfGVufDB8fDB8fHww',
    isFollowing: true
  },
  {
    id: '6',
    name: 'Nightlife Productions',
    username: 'nightlifepro',
    avatar: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fGxvZ298ZW58MHx8MHx8fDA%3D',
    role: 'promoter',
    bio: 'Premier event promotion company specializing in underground electronic music events.',
    location: 'New York, NY',
    followers: 45200,
    following: 187,
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZXZlbnR8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: '7',
    name: 'Echoplex Venue',
    username: 'echoplex',
    avatar: 'https://images.unsplash.com/photo-1519915734606-32a9e3b6176a?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2x1YiUyMGxvZ298ZW58MHx8MHx8fDA%3D',
    role: 'venue',
    bio: 'Iconic music venue featuring the best in electronic, indie, and alternative music.',
    location: 'Los Angeles, CA',
    followers: 35800,
    following: 215,
    coverImage: 'https://images.unsplash.com/photo-1574879948818-1cfda7aa5b1a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNsdWJ8ZW58MHx8MHx8fDA%3D'
  }
];

// Mock Sub-Promoters
export const subPromoters: SubPromoter[] = [
  {
    id: 'sp1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '555-123-4567',
    parentPromoterId: '6', // Nightlife Productions
    ticketsSold: 28,
    uniqueCode: 'ALEX2025'
  },
  {
    id: 'sp2',
    name: 'Taylor Williams',
    email: 'taylor@example.com',
    phone: '555-234-5678',
    parentPromoterId: '6', // Nightlife Productions
    ticketsSold: 42,
    uniqueCode: 'TAYLOR2025'
  },
  {
    id: 'sp3',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    parentPromoterId: '6', // Nightlife Productions
    ticketsSold: 15,
    uniqueCode: 'JORDAN2025'
  }
];

// Mock Sub-Promoter Sales Data
export const subPromoterSales: SubPromoterSale[] = [
  {
    subPromoterId: 'sp1',
    eventId: '1',
    ticketsSold: 15,
    totalRevenue: 675, // 15 tickets × $45
    lastSaleDate: '2025-06-10T14:30:00Z'
  },
  {
    subPromoterId: 'sp2',
    eventId: '1',
    ticketsSold: 22,
    totalRevenue: 990, // 22 tickets × $45
    lastSaleDate: '2025-06-11T09:15:00Z'
  },
  {
    subPromoterId: 'sp1',
    eventId: '2',
    ticketsSold: 8,
    totalRevenue: 280, // 8 tickets × $35
    lastSaleDate: '2025-06-09T16:45:00Z'
  },
  {
    subPromoterId: 'sp3',
    eventId: '1',
    ticketsSold: 10,
    totalRevenue: 450, // 10 tickets × $45
    lastSaleDate: '2025-06-08T11:20:00Z'
  }
];

// Mock Events
export const events: Event[] = [
  {
    id: '1',
    title: 'Neon Dreams Festival',
    date: '2025-06-15',
    time: '22:00 - 06:00',
    venue: 'Echoplex',
    address: '1154 Glendale Blvd, Los Angeles, CA 90026',
    description: 'Experience the ultimate house music festival featuring top DJs from around the world.',
    lineup: [users[0], users[1], users[3]],
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvbmNlcnR8ZW58MHx8MHx8fDA%3D',
    price: 45,
    ticketsSold: 850,
    maxCapacity: 1200,
    promoter: users[5],
    isLive: true,
    vibe: 4
  },
  {
    id: '2',
    title: 'Bass Therapy',
    date: '2025-06-20',
    time: '23:00 - 04:00',
    venue: 'Underground Bunker',
    address: '123 Hidden St, Miami, FL 33127',
    description: 'Miami\'s premier bass music event featuring cutting-edge producers and DJs.',
    lineup: [users[2], users[4]],
    image: 'https://images.unsplash.com/photo-1571751239073-5cfa6942964a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHJhdmV8ZW58MHx8MHx8fDA%3D',
    price: 35,
    ticketsSold: 420,
    maxCapacity: 600,
    promoter: users[5]
  },
  {
    id: '3',
    title: 'Global Fusion',
    date: '2025-07-10',
    time: '21:00 - 03:00',
    venue: 'Skyline Terrace',
    address: '456 Rooftop Ave, New York, NY 10001',
    description: 'An international showcase of electronic music blending cultural sounds from around the world.',
    lineup: [users[4], users[1]],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2x1YnxlbnwwfHwwfHx8MA%3D%3D',
    price: 30,
    ticketsSold: 320,
    maxCapacity: 500,
    promoter: users[5]
  }
];

// Mock Posts
export const posts: Post[] = [
  {
    id: '1',
    user: users[0],
    content: 'Just dropped my new mix! Check it out on SoundCloud. Link in bio. #HouseMusic #NewMix',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRqJTIwc2V0fGVufDB8fDB8fHww',
    likes: 342,
    comments: 48,
    shares: 21,
    timestamp: '2025-06-01T14:32:00Z',
    hasLiked: true
  },
  {
    id: '2',
    user: users[5],
    content: 'Announcing our biggest event yet! Neon Dreams Festival tickets on sale now. Don\'t miss the early bird special! #NeonDreams #Festival',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvbmNlcnR8ZW58MHx8MHx8fDA%3D',
    likes: 521,
    comments: 78,
    shares: 112,
    timestamp: '2025-05-30T10:15:00Z',
    hasLiked: false
  },
  {
    id: '3',
    user: users[1],
    content: 'Berlin techno scene never disappoints. Inspired after playing at Berghain last night. New tracks coming soon!',
    likes: 284,
    comments: 32,
    shares: 14,
    timestamp: '2025-05-29T08:45:00Z',
    hasLiked: true
  },
  {
    id: '4',
    user: users[2],
    content: 'Studio session vibes. Working on something special for my set at Bass Therapy next month!',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZGlvJTIwc2Vzc2lvbnxlbnwwfHwwfHx8MA%3D%3D',
    likes: 198,
    comments: 23,
    shares: 8,
    timestamp: '2025-05-28T16:20:00Z',
    hasLiked: false
  },
  {
    id: '5',
    user: users[6],
    content: 'We\'re excited to announce our summer lineup! Check our website for the full schedule. #SummerSessions',
    image: 'https://images.unsplash.com/photo-1574879948818-1cfda7aa5b1a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNsdWJ8ZW58MHx8MHx8fDA%3D',
    likes: 412,
    comments: 45,
    shares: 67,
    timestamp: '2025-05-27T12:10:00Z',
    hasLiked: true
  },
  {
    id: '6',
    user: users[3],
    content: 'Miami sunsets and melodic techno. The perfect combination for tonight\'s rooftop set.',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0JTIwcm9vZnRvcHxlbnwwfHwwfHx8MA%3D%3D',
    likes: 256,
    comments: 31,
    shares: 12,
    timestamp: '2025-05-26T22:05:00Z',
    hasLiked: false
  },
  {
    id: '7',
    user: users[4],
    content: 'Just finalized the set list for Global Fusion. Get ready for a journey through sound!',
    likes: 187,
    comments: 21,
    shares: 9,
    timestamp: '2025-05-25T15:30:00Z',
    hasLiked: true
  },
  {
    id: '8',
    user: users[0],
    content: 'Throwback to last year\'s Neon Dreams Festival. Can\'t wait to headline again this year!',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG5pZ2h0Y2x1YnxlbnwwfHwwfHx8MA%3D%3D',
    likes: 328,
    comments: 42,
    shares: 18,
    timestamp: '2025-05-24T11:45:00Z',
    hasLiked: false
  },
  {
    id: '9',
    user: users[5],
    content: 'Behind the scenes at event planning. So much goes into creating these magical nights!',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZXZlbnQlMjBwbGFubmluZ3xlbnwwfHwwfHx8MA%3D%3D',
    likes: 178,
    comments: 24,
    shares: 7,
    timestamp: '2025-05-23T14:20:00Z',
    hasLiked: true
  },
  {
    id: '10',
    user: users[2],
    content: 'Just landed in Atlanta! Home sweet home. Ready for studio time and local shows this week.',
    likes: 215,
    comments: 28,
    shares: 5,
    timestamp: '2025-05-22T09:15:00Z',
    hasLiked: false
  }
];

// Mock Songs for Requests
export const songs: Song[] = [
  {
    id: '1',
    title: 'Strobe',
    artist: 'Deadmau5',
    albumArt: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWxidW0lMjBhcnR8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: '2',
    title: 'Opus',
    artist: 'Eric Prydz',
    albumArt: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWxidW0lMjBhcnR8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: '3',
    title: 'Levels',
    artist: 'Avicii',
    albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFsYnVtJTIwYXJ0fGVufDB8fDB8fHww'
  },
  {
    id: '4',
    title: 'Sicko Mode',
    artist: 'Travis Scott',
    albumArt: 'https://images.unsplash.com/photo-1598387846148-47e82ebd2b3d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFsYnVtJTIwYXJ0fGVufDB8fDB8fHww'
  },
  {
    id: '5',
    title: 'One More Time',
    artist: 'Daft Punk',
    albumArt: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFsYnVtJTIwYXJ0fGVufDB8fDB8fHww'
  }
];

// Mock Song Requests
export const songRequests: SongRequest[] = [
  {
    id: '1',
    song: songs[0],
    fan: {
      id: '101',
      name: 'Jamie Smith',
      username: 'jamies',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww',
      role: 'fan'
    },
    message: 'Love this track! Would make my night to hear it!',
    tipAmount: 20,
    status: 'pending',
    timestamp: '2025-06-01T23:15:00Z'
  },
  {
    id: '2',
    song: songs[1],
    fan: {
      id: '102',
      name: 'Tyler Johnson',
      username: 'tylerj',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
      role: 'fan'
    },
    message: 'Playing this for my birthday would be amazing!',
    tipAmount: 50,
    status: 'accepted',
    timestamp: '2025-06-01T23:05:00Z'
  },
  {
    id: '3',
    song: songs[2],
    fan: {
      id: '103',
      name: 'Emily Chen',
      username: 'emilyc',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
      role: 'fan'
    },
    tipAmount: 10,
    status: 'declined',
    timestamp: '2025-06-01T22:50:00Z'
  },
  {
    id: '4',
    song: songs[3],
    fan: {
      id: '104',
      name: 'Marcus Williams',
      username: 'marcusw',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
      role: 'fan'
    },
    message: 'This would fit perfectly in your set right now!',
    tipAmount: 25,
    status: 'pending',
    timestamp: '2025-06-01T22:40:00Z'
  },
  {
    id: '5',
    song: songs[4],
    fan: {
      id: '105',
      name: 'Sofia Rodriguez',
      username: 'sofiar',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
      role: 'fan'
    },
    message: 'For the vibes! Please play this next!',
    tipAmount: 15,
    status: 'pending',
    timestamp: '2025-06-01T22:30:00Z'
  }
];

// Utility functions to get data
export const getLiveEvents = () => events.filter(event => event.isLive);
export const getLiveDjs = () => users.filter(user => user.role === 'dj' && user.isLive);
export const getUpcomingEvents = () => 
  events.filter(event => new Date(event.date) > new Date()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

export const getDjById = (id: string) => users.find(user => user.id === id && user.role === 'dj');
export const getEventById = (id: string) => events.find(event => event.id === id);
export const getPostsByUser = (userId: string) => posts.filter(post => post.user.id === userId);

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMins > 0) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else {
    return 'Just now';
  }
};

export const getSubPromotersByParentId = (parentId: string) => 
  subPromoters.filter(sp => sp.parentPromoterId === parentId);

export const getSubPromoterSalesByEventId = (eventId: string) =>
  subPromoterSales.filter(sale => sale.eventId === eventId);
  
export const getSubPromoterSalesByPromoterId = (promoterId: string) => {
  const promoterSubPromoters = getSubPromotersByParentId(promoterId);
  const subPromoterIds = promoterSubPromoters.map(sp => sp.id);
  return subPromoterSales.filter(sale => subPromoterIds.includes(sale.subPromoterId));
};

export const getEventsByPromoter = (promoterId: string) =>
  events.filter(event => event.promoter.id === promoterId);

export const generateTicketLink = (eventId: string, subPromoterCode: string) =>
  `https://tipdrop.app/tickets/${eventId}?code=${subPromoterCode}`;
