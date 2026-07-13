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
  isApproved?: boolean; // admin approval state (defaults to true for existing mock data if undefined)
  roiPotential: string; // e.g. "8.5%", "12.0%"
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

export const initialProperties: Property[] = [
  {
    id: "prop-1",
    title: "10 Marla Premium Residential Plot - DHA Bahawalpur",
    price: 8500000, // 85 Lakhs
    location: "DHA Bahawalpur",
    sector: "Sector A",
    type: "Residential Plot",
    size: "10 Marla",
    description: "An outstanding opportunity to acquire a premium 10 Marla residential plot in the highly sought-after Sector A of DHA Bahawalpur. Situated on a 40ft wide street, this plot offers immediate possession and construction opportunities. Excellent investment potential with rapid development nearby including parks, modern infrastructure, and commercial spaces.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Muhammad Ali",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      experience: "8 Years"
    },
    amenities: [
      "Underground Electricity",
      "Sewerage System",
      "24/7 Security Patrol",
      "Sui Gas",
      "Boundary Wall",
      "Water Supply"
    ],
    purpose: "Buy",
    isFeatured: true,
    isCorner: false,
    isParkFacing: true,
    isMainBoulevard: false,
    possessionStatus: "Possession",
    installmentAvailable: false,
    roiPotential: "9.5%",
    nearby: {
      schools: "DHA School System (3 mins)",
      hospitals: "DHA Medical Complex (5 mins)",
      mosques: "Sector A Mosque (1 min)",
      markets: "Sector A Commercial Market (2 mins)"
    },
    viewsCount: 450
  },
  {
    id: "prop-2",
    title: "Luxury 1 Kanal Modern Villa - DHA Bahawalpur",
    price: 38000000, // 3.8 Crore
    location: "DHA Bahawalpur",
    sector: "Sector B",
    type: "Villa",
    size: "1 Kanal",
    bedrooms: 5,
    bathrooms: 6,
    description: "An architecturally designed double-story 1 Kanal luxury villa featuring premium finishes, Italian tile flooring, custom woodwork, and import-grade kitchen fittings. Comprises 5 spacious bedrooms with attached wardrobes, custom luxury bathrooms, 2 servant quarters, dual car garage, and a beautifully manicured lawn. Located close to the Main Boulevard.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Waqas Ahmad Chaudhary",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "/images/waqas_ceo.png",
      experience: "CEO - 15 Years"
    },
    amenities: [
      "Central Heating & Cooling",
      "Smart Home Automation",
      "Manicured Lawn",
      "Servant Quarters",
      "Double Glazed Windows",
      "Solar Power Backup Enabled",
      "Underground Utilities"
    ],
    purpose: "Buy",
    isFeatured: true,
    isCorner: true,
    isParkFacing: false,
    isMainBoulevard: true,
    possessionStatus: "Possession",
    installmentAvailable: false,
    roiPotential: "11.2%",
    nearby: {
      schools: "Army Public School (4 mins)",
      hospitals: "CMH Bahawalpur (8 mins)",
      mosques: "Jamia Mosque Sector B (2 mins)",
      markets: "Main Commercial Area (3 mins)"
    },
    viewsCount: 680
  },
  {
    id: "prop-3",
    title: "5 Marla Commercial Plot on Main Boulevard - DHA Bahawalpur",
    price: 18500000, // 1.85 Crore
    location: "DHA Bahawalpur",
    sector: "Sector C",
    type: "Commercial Plot",
    size: "5 Marla",
    description: "Prime commercial plot located on the Main Boulevard of DHA Bahawalpur Sector C. Perfect for constructing a commercial plaza, retail outlet, or executive office building. High footfall area with excellent visibility and grand parking facilities. Commercial plots in DHA are yielding high rental returns.",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Kamran Shah",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      experience: "6 Years"
    },
    amenities: [
      "Main Boulevard Facing",
      "Spacious Parking Lot",
      "Underground Electrification",
      "High Foot Traffic Zone",
      "Approved for 5-story building"
    ],
    purpose: "Project",
    isFeatured: true,
    isCorner: false,
    isParkFacing: false,
    isMainBoulevard: true,
    possessionStatus: "Possession",
    installmentAvailable: true,
    roiPotential: "14.5%",
    nearby: {
      schools: "DHA College for Boys (5 mins)",
      hospitals: "Sector C Clinic (1 min)",
      mosques: "Central Grand Mosque (2 mins)",
      markets: "Markaz Market (Directly on site)"
    },
    viewsCount: 390
  },
  {
    id: "prop-4",
    title: "1 Kanal Corner Plot on Installment Plan - DHA Multan",
    price: 12500000, // 1.25 Crore
    location: "DHA Multan",
    sector: "Sector H",
    type: "Residential Plot",
    size: "1 Kanal",
    description: "Get a highly lucrative 1 Kanal residential corner plot in Sector H, DHA Multan. This property is available on an attractive 2-year installment plan with only a 25% down payment. Located next to a beautiful green park and community sports club. This is a rare chance to invest in Multan's premium gated community.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Muhammad Ali",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      experience: "8 Years"
    },
    amenities: [
      "Corner Location",
      "2-Year Installment Plan",
      "Facing Jogging Track",
      "Gated Security",
      "Water Filtration Plant"
    ],
    purpose: "Buy",
    isFeatured: false,
    isCorner: true,
    isParkFacing: true,
    isMainBoulevard: false,
    possessionStatus: "Non-Possession",
    installmentAvailable: true,
    roiPotential: "8.8%",
    nearby: {
      schools: "Beaconhouse School System (6 mins)",
      hospitals: "Multan Medical Center (10 mins)",
      mosques: "Sector H Mosque (2 mins)",
      markets: "Sector H Mini-Market (3 mins)"
    },
    viewsCount: 280
  },
  {
    id: "prop-5",
    title: "Modern 10 Marla House for Rent - DHA Lahore",
    price: 120000, // 1.2 Lakh per month
    location: "DHA Lahore",
    sector: "Phase 6",
    type: "House",
    size: "10 Marla",
    bedrooms: 4,
    bathrooms: 5,
    description: "Fully furnished modern design 10 Marla double-story house available for rent in DHA Phase 6, Lahore. Features 4 designer bedrooms with attached closets, modern kitchen, stylish dining hall, drawing room, servant room, and secure garage space for two cars. Ideal for executive families.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Kamran Shah",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      experience: "6 Years"
    },
    amenities: [
      "Fully Furnished",
      "UPS & Solar Panel Setup",
      "CCTV Surveillance",
      "2-Car Garage",
      "Modern Kitchen Appliances"
    ],
    purpose: "Rent",
    isFeatured: true,
    isCorner: false,
    isParkFacing: false,
    isMainBoulevard: false,
    possessionStatus: "Possession",
    installmentAvailable: false,
    roiPotential: "4.5%",
    nearby: {
      schools: "Lahore Grammar School (5 mins)",
      hospitals: "National Hospital Phase 6 (10 mins)",
      mosques: "Phase 6 Block Mosque (1 min)",
      markets: "CCA Phase 6 (3 mins)"
    },
    viewsCount: 195
  },
  {
    id: "prop-6",
    title: "1 Kanal Luxury House - Bahria Town Lahore",
    price: 65000000, // 6.5 Crore
    location: "Bahria Town Projects",
    sector: "Sector C",
    type: "House",
    size: "1 Kanal",
    bedrooms: 6,
    bathrooms: 7,
    description: "A stunning Spanish design 1 Kanal house for sale in Sector C, Bahria Town Lahore. Situated in a fully secure and high-profile residential zone. The property includes a large drawing/dining room, double kitchens, fully customized bathrooms with jacuzzi, executive study room, and custom imported woodwork.",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Waqas Ahmad Chaudhary",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "/images/waqas_ceo.png",
      experience: "CEO - 15 Years"
    },
    amenities: [
      "Spanish Architecture",
      "Jacuzzi Baths",
      "Imported Double Kitchens",
      "Servant Rooms",
      "Lawn & Backyard Garden",
      "Bahria Gated Security"
    ],
    purpose: "Buy",
    isFeatured: true,
    isCorner: false,
    isParkFacing: true,
    isMainBoulevard: false,
    possessionStatus: "Possession",
    installmentAvailable: false,
    roiPotential: "8.2%",
    nearby: {
      schools: "Mazhar-ul-Uloom School (3 mins)",
      hospitals: "Bahria Town Hospital (5 mins)",
      mosques: "Grand Jamia Mosque Bahria (4 mins)",
      markets: "Safari Mall (3 mins)"
    },
    viewsCount: 512
  },
  {
    id: "prop-7",
    title: "1 Kanal Elite Residential Plot - DHA Islamabad",
    price: 24000000, // 2.4 Crore
    location: "DHA Islamabad",
    sector: "Phase 2",
    type: "Residential Plot",
    size: "1 Kanal",
    description: "An elite 1 Kanal flat residential plot for sale in Phase 2, DHA Islamabad. It is fully developed and ready for construction. Nestled in a peaceful block with modern roads, security, and a beautiful mountain view backdrop. Highly demanded sector with high resale values.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Kamran Shah",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      experience: "6 Years"
    },
    amenities: [
      "Underground Gas & Electric",
      "Hill View Backdrop",
      "Eco-friendly Surroundings",
      "Secured Boundary Wall",
      "Possession Ready"
    ],
    purpose: "Buy",
    isFeatured: false,
    isCorner: false,
    isParkFacing: false,
    isMainBoulevard: false,
    possessionStatus: "Possession",
    installmentAvailable: false,
    roiPotential: "10.0%",
    nearby: {
      schools: "DHA Army Public School (5 mins)",
      hospitals: "Avicenna Medical Center (8 mins)",
      mosques: "Phase 2 Grand Mosque (3 mins)",
      markets: "Giga Mall (7 mins)"
    },
    viewsCount: 320
  },
  {
    id: "prop-8",
    title: "10 Marla Park-Facing Plot on Easy Installments - DHA Bahawalpur",
    price: 9000000, // 90 Lakhs
    location: "DHA Bahawalpur",
    sector: "Sector D",
    type: "Residential Plot",
    size: "10 Marla",
    description: "Incredible opportunity to own a 10 Marla residential plot in DHA Bahawalpur Sector D, facing a lush green community park. Available on a 1.5-year easy installment plan. Development work is moving at an extreme pace, with possession expected soon. Highly recommended for long-term investments.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ],
    agent: {
      name: "Waqas Ahmad Chaudhary",
      phone: "+92300-0066255",
      whatsapp: "923000066255",
      image: "/images/waqas_ceo.png",
      experience: "CEO - 15 Years"
    },
    amenities: [
      "Park Facing",
      "18-Month Installment Plan",
      "Paved Wide Streets",
      "Underground Gas Pipelines",
      "24/7 Gated Entry"
    ],
    purpose: "Project",
    isFeatured: true,
    isCorner: false,
    isParkFacing: true,
    isMainBoulevard: false,
    possessionStatus: "Non-Possession",
    installmentAvailable: true,
    roiPotential: "13.8%",
    nearby: {
      schools: "DHA School System (4 mins)",
      hospitals: "Sector D Clinic (2 mins)",
      mosques: "Sector D Mosque (1 min)",
      markets: "Sector D Commercial Plaza (3 mins)"
    },
    viewsCount: 489
  }
];
