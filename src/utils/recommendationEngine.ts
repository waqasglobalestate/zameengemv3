import { Property } from "@/data/initialProperties";
import { SavedSearch } from "@/context/AppStateContext";

export interface UserPreferences {
  targetBudget: number;
  locations: string[];
  propertyTypes: string[];
  purpose: "Buy" | "Rent";
}

export interface RecommendationScore {
  total: number;
  breakdown: {
    searchHistory: number;
    locationMatch: number;
    budgetProximity: number;
    dealValue: number;
  };
}

// 1. Extract user preferences from saved history
export function extractUserPreferences(
  savedSearches: SavedSearch[],
  savedProperties: Property[],
  recentlyViewed: Property[]
): UserPreferences {
  // Default values
  let targetBudget = 15000000; // 1.5 Crore default
  const locations: string[] = [];
  const propertyTypes: string[] = [];
  let purpose: "Buy" | "Rent" = "Buy";

  // Gather prices from saved/recent properties
  const prices = [...savedProperties, ...recentlyViewed].map(p => p.price);
  if (prices.length > 0) {
    // Calculate average price
    targetBudget = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  } else if (savedSearches.length > 0) {
    // Gather prices from saved searches
    const searchPrices: number[] = [];
    savedSearches.forEach(s => {
      if (s.minPrice) searchPrices.push(s.minPrice);
      if (s.maxPrice) searchPrices.push(s.maxPrice);
    });
    if (searchPrices.length > 0) {
      targetBudget = searchPrices.reduce((sum, p) => sum + p, 0) / searchPrices.length;
    }
  }

  // Gather locations
  savedProperties.forEach(p => {
    if (p.location && !locations.includes(p.location)) locations.push(p.location);
  });
  recentlyViewed.forEach(p => {
    if (p.location && !locations.includes(p.location)) locations.push(p.location);
  });
  savedSearches.forEach(s => {
    if (s.location && !locations.includes(s.location)) locations.push(s.location);
  });

  // Gather property types
  savedProperties.forEach(p => {
    if (p.type && !propertyTypes.includes(p.type)) propertyTypes.push(p.type);
  });
  recentlyViewed.forEach(p => {
    if (p.type && !propertyTypes.includes(p.type)) propertyTypes.push(p.type);
  });
  savedSearches.forEach(s => {
    if (s.type && !propertyTypes.includes(s.type)) propertyTypes.push(s.type);
  });

  // Extract purpose
  const purposes = savedSearches.map(s => s.purpose);
  if (purposes.includes("Rent")) {
    const rentCount = purposes.filter(p => p === "Rent").length;
    const buyCount = purposes.filter(p => p === "Buy").length;
    if (rentCount > buyCount) purpose = "Rent";
  }

  return {
    targetBudget,
    locations: locations.length > 0 ? locations : ["DHA Bahawalpur"],
    propertyTypes: propertyTypes.length > 0 ? propertyTypes : ["Residential Plot"],
    purpose
  };
}

// 2. Calculate average prices per sector + type + size to evaluate bargain deals
export function calculateSectorAverages(properties: Property[]): Record<string, number> {
  const groups: Record<string, { total: number; count: number }> = {};

  properties.forEach(p => {
    // Group key: Location + Sector + Type + Size (Marla/Kanal)
    const key = `${p.location}_${p.sector}_${p.type}_${p.size}`.toLowerCase().replace(/\s+/g, "");
    if (!groups[key]) {
      groups[key] = { total: 0, count: 0 };
    }
    groups[key].total += p.price;
    groups[key].count += 1;
  });

  const averages: Record<string, number> = {};
  Object.keys(groups).forEach(key => {
    averages[key] = groups[key].total / groups[key].count;
  });

  return averages;
}

// 3. Compute detailed AI recommendation score for a property
export function calculateRecommendationScore(
  property: Property,
  preferences: UserPreferences,
  sectorAverages: Record<string, number>
): RecommendationScore {
  // Score elements (Total 100)
  let searchHistory = 0; // max 30
  let locationMatch = 0; // max 25
  let budgetProximity = 0; // max 25
  let dealValue = 0; // max 20

  // 1. Search History Match (30 pts)
  if (property.purpose === preferences.purpose) searchHistory += 10;
  if (preferences.propertyTypes.includes(property.type)) searchHistory += 10;
  if (preferences.locations.some(loc => property.location.toLowerCase().includes(loc.toLowerCase()))) {
    searchHistory += 10;
  }

  // 2. Location Match (25 pts)
  const isExactLocation = preferences.locations.some(loc => 
    property.location.toLowerCase() === loc.toLowerCase() ||
    (property.sector && loc.toLowerCase().includes(property.sector.toLowerCase()))
  );
  if (isExactLocation) {
    locationMatch = 25;
  } else {
    // Check if same general city/society (e.g. DHA Bahawalpur)
    const isGeneralLocation = preferences.locations.some(loc => {
      const p1 = loc.split(" ")[0].toLowerCase();
      const p2 = property.location.split(" ")[0].toLowerCase();
      return p1.length > 2 && p1 === p2;
    });
    if (isGeneralLocation) {
      locationMatch = 15;
    }
  }

  // 3. Budget Proximity (25 pts)
  const diffPct = Math.abs(property.price - preferences.targetBudget) / preferences.targetBudget;
  budgetProximity = Math.max(0, Math.round(25 * (1 - diffPct)));

  // 4. Deal Value (20 pts)
  // Check sector average to calculate if it's a bargain deal
  const groupKey = `${property.location}_${property.sector}_${property.type}_${property.size}`.toLowerCase().replace(/\s+/g, "");
  const avgPrice = sectorAverages[groupKey];
  
  if (avgPrice && property.price < avgPrice) {
    const discountPct = (avgPrice - property.price) / avgPrice;
    // 1.5 points per 1% discount, max 12 points
    dealValue += Math.min(12, Math.round(discountPct * 100 * 1.5));
  } else if (avgPrice && property.price === avgPrice) {
    dealValue += 6; // average price gets moderate score
  } else {
    dealValue += 4; // premium priced properties
  }

  if (property.isFeatured) {
    dealValue += 8; // Featured listings get extra score
  }

  const total = searchHistory + locationMatch + budgetProximity + dealValue;

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown: {
      searchHistory,
      locationMatch,
      budgetProximity,
      dealValue
    }
  };
}

// 4. Categorize recommendations
export interface RecommendationResult {
  similar: { property: Property; score: RecommendationScore }[];
  betterDeals: { property: Property; score: RecommendationScore; savings: number }[];
  newListings: { property: Property; score: RecommendationScore }[];
}

export function generateRecommendations(
  allProperties: Property[],
  savedProperties: Property[],
  recentlyViewed: Property[],
  savedSearches: SavedSearch[]
): RecommendationResult {
  const preferences = extractUserPreferences(savedSearches, savedProperties, recentlyViewed);
  const averages = calculateSectorAverages(allProperties);

  // Exclude properties already saved by the user
  const savedIds = savedProperties.map(p => p.id);
  const candidateProperties = allProperties.filter(p => !savedIds.includes(p.id));

  // Score all candidate properties
  const scoredCandidates = candidateProperties.map(property => {
    const score = calculateRecommendationScore(property, preferences, averages);
    
    // Calculate bargain savings
    const groupKey = `${property.location}_${property.sector}_${property.type}_${property.size}`.toLowerCase().replace(/\s+/g, "");
    const avgPrice = averages[groupKey];
    const savings = avgPrice && property.price < avgPrice ? Math.round(avgPrice - property.price) : 0;

    return { property, score, savings };
  });

  // Sort candidates by total recommendation score descending
  scoredCandidates.sort((a, b) => b.score.total - a.score.total);

  // 1. Similar Properties: matches same type & size & close price, high score
  const similar = scoredCandidates
    .filter(item => 
      preferences.propertyTypes.includes(item.property.type) && 
      item.score.total >= 70
    )
    .slice(0, 4)
    .map(item => ({ property: item.property, score: item.score }));

  // 2. Better Deals: High savings bargain deals (price < sector average)
  const betterDeals = scoredCandidates
    .filter(item => item.savings > 0 && item.score.total >= 60)
    // Sort by absolute savings amount
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 4)
    .map(item => ({ property: item.property, score: item.score, savings: item.savings }));

  // 3. New Listings: Fresh listings (e.g. newly added simulated IDs)
  // We can simulate "new listings" by filtering properties with larger numerical IDs or checking isFeatured, or newer timestamps
  // Let's filter candidates with score >= 65 and sort by listing ID (newest entries first)
  const newListings = [...scoredCandidates]
    .filter(item => item.score.total >= 65)
    // Sort by id descending (assuming larger IDs/new properties have higher numerical indexes)
    .sort((a, b) => b.property.id.localeCompare(a.property.id))
    .slice(0, 4)
    .map(item => ({ property: item.property, score: item.score }));

  return {
    similar,
    betterDeals,
    newListings
  };
}
