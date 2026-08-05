export type UserRole = 'student' | 'agent' | 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  universityId?: string;
  universityName?: string;
  avatar?: string;
  phone?: string;
  isVerifiedAgent?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  emailVerified?: boolean;
  createdAt: string;
}

export interface AgentVerification {
  id: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  businessName: string;
  idType: 'national_id' | 'passport' | 'drivers_license' | 'business_reg';
  idNumber: string;
  idDocumentUrl: string;
  proofOfOwnershipUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type AccommodationType = 
  | 'hostel'
  | 'self_contain'
  | 'single_room'
  | 'flat_apartment'
  | 'shared_lodge'
  | 'studio';

export type GenderPreference = 'any' | 'male_only' | 'female_only' | 'coed';

export type Facility = 
  | 'wifi'
  | 'electricity_247'
  | 'solar_power'
  | 'water_running'
  | 'security_guard'
  | 'cctv'
  | 'kitchen'
  | 'ac'
  | 'gym'
  | 'laundry'
  | 'parking'
  | 'furnished'
  | 'balcony';

export type InstitutionType = 'University' | 'Polytechnic' | 'College of Education';
export type InstitutionOwnership = 'Federal' | 'State' | 'Private';

export interface University {
  id: string;
  name: string;
  shortName: string;
  country: string;
  state: string;
  city: string;
  institutionType?: InstitutionType;
  ownership?: InstitutionOwnership;
  category?: string; // e.g. 'Federal University', 'State University', 'Private University', 'Federal Polytechnic', etc.
  zone?: 'South West' | 'South East' | 'South South' | 'North West' | 'North East' | 'North Central';
  campuses: string[];
  coordinates: { lat: number; lng: number };
  studentCount: string;
  totalListings: number;
  image: string;
}

export interface ListingRatings {
  security: number;
  water: number;
  electricity: number;
  internet: number;
  cleanliness: number;
  noise: number;
  value: number;
  overall: number;
  count: number;
}

export interface Listing {
  id: string;
  title: string;
  universityId: string;
  universityName: string;
  campus: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: AccommodationType;
  price: number;
  currency: string;
  pricePeriod: 'year' | 'semester' | 'month';
  totalRooms: number;
  availableRooms: number;
  gender: GenderPreference;
  distanceToCampusMinutes: number;
  distanceToCampusKm: number;
  description: string;
  facilities: Facility[];
  rules: string[];
  images: string[];
  videoUrl?: string;
  video360Url?: string;
  accommodationTypeName?: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentAvatar: string;
  isAgentVerified: boolean;
  isFeatured: boolean;
  isPaused: boolean;
  isOccupied: boolean;
  status: 'active' | 'pending_approval' | 'flagged' | 'paused';
  viewsCount: number;
  enquiriesCount: number;
  savesCount: number;
  ratings: ListingRatings;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  security: number;
  water: number;
  electricity: number;
  internet: number;
  cleanliness: number;
  noise: number;
  value: number;
  overall: number;
  comment: string;
  createdAt: string;
}

export interface InspectionBooking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  listingId: string;
  listingTitle: string;
  studentId: string;
  studentName: string;
  agentId: string;
  agentName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'student' | 'agent';
  text: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'inspection_update' | 'new_listing' | 'price_change' | 'message' | 'announcement' | 'agent_verification';
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ReportItem {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterName: string;
  reason: 'fake_listing' | 'inaccurate_pricing' | 'unresponsive_agent' | 'misleading_photos' | 'fraud_attempt' | 'other';
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface RoommatePost {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  universityName: string;
  department: string;
  level: string; // e.g. "300 Level"
  gender: 'Male' | 'Female';
  budgetPerHead: number;
  location: string; // e.g. "Onike / Akoka, UNILAG"
  roomType: string; // e.g. "2 Bedroom Flat"
  description: string;
  preferredQualities: string[];
  contactPhone: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  universityId: string;
  campus: string;
  institutionType: string; // 'all' | 'University' | 'Polytechnic' | 'College of Education'
  ownership: string; // 'all' | 'Federal' | 'State' | 'Private'
  state: string; // 'all' or specific Nigerian state name
  type: string;
  minPrice: number | null;
  maxPrice: number | null;
  gender: string;
  maxDistanceMinutes: number | null;
  facilities: Facility[];
  onlyVerifiedAgents: boolean;
  sortBy: 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest';
}

export interface AiSearchResult {
  interpretedQuery: string;
  universityName?: string;
  maxPrice?: number;
  preferredType?: string;
  requiredFacilities?: Facility[];
  genderPreference?: GenderPreference;
  matchedListingIds: string[];
  explanation: string;
}
