export interface Property {
  id: string;
  title: string;
  price: number; // in PKR
  location: string; // e.g. "DHA Bahawalpur"
  sector: string; // e.g. "Sector A", "Sector B"
  type: "Residential Plot" | "Commercial Plot" | "Villa" | "House" | "Plot" | "Apartment" | "Shop" | "Office" | "Farm House" | "Building";
  size: string; // e.g. "10 Marla", "1 Kanal", "5 Marla", "2 Kanal"
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  furnishedStatus?: "Furnished" | "Semi-Furnished" | "Unfurnished";
  description: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
    whatsapp: string;
    image: string;
    experience: string;
  };
  amenities: string[];
  purpose: "Buy" | "Rent" | "Project";
  isFeatured: boolean;
  isPremium?: boolean;
  isHot?: boolean;
  createdAt?: string;
  isCorner: boolean;
  isParkFacing: boolean;
  isMainBoulevard: boolean;
  possessionStatus: "Possession" | "Non-Possession";
  installmentAvailable: boolean;
  installmentDetails?: {
    downPayment: number;
    monthlyInstallment: number;
    durationMonths?: number;
  };
  locationDetails?: {
    country: string;
    city: string;
    society: string;
    sector: string;
    block: string;
    street: string;
    latitude: number;
    longitude: number;
  };
  contactDetails?: {
    type: "Owner" | "Dealer" | "Agency";
    name: string;
    phone: string;
    agencyName?: string;
  };
  verificationDetails?: {
    channel: "SMS" | "WhatsApp";
    phone: string;
    isVerified: boolean;
  };
  isApproved?: boolean; // admin approval state
  roiPotential: string;
  nearby: {
    schools: string;
    hospitals: string;
    mosques: string;
    markets: string;
  };
  viewsCount: number;
  videoUrl?: string;
  virtualTour?: string;
}

export const initialProperties: Property[] = [];
