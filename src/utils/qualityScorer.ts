// Listing Quality Scorer Utility for Real Estate Listings

export interface QualityScoreDetails {
  score: number; // 0-100
  breakdown: {
    title: number;       // max 15
    description: number; // max 20
    images: number;      // max 25
    video: number;       // max 15
    location: number;    // max 15
    amenities: number;   // max 10
  };
  suggestions: {
    id: string;
    text: string;
    type: "warning" | "info" | "success";
  }[];
}

export function calculateListingQuality(data: {
  title?: string;
  description?: string;
  images?: string[];
  featuredImage?: string | null;
  galleryImages?: string[];
  videoUrl?: string;
  virtualTour?: string;
  society?: string;
  location?: string;
  sector?: string;
  block?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
}): QualityScoreDetails {
  const breakdown = {
    title: 0,
    description: 0,
    images: 0,
    video: 0,
    location: 0,
    amenities: 0
  };

  const suggestions: QualityScoreDetails["suggestions"] = [];

  // 1. Title Scorer (Max 15)
  const titleText = data.title || "";
  if (titleText.trim().length === 0) {
    breakdown.title = 0;
    suggestions.push({
      id: "title-empty",
      text: "Provide a descriptive title for your property.",
      type: "warning"
    });
  } else if (titleText.length < 15) {
    breakdown.title = 5;
    suggestions.push({
      id: "title-short",
      text: "Title is too short. Expand it to at least 15 characters (e.g., mention size, corner status, or sector).",
      type: "info"
    });
  } else if (titleText.length < 35) {
    breakdown.title = 10;
    suggestions.push({
      id: "title-medium",
      text: "Tip: Add key selling features to your title (e.g., '10 Marla Corner Plot Sector A') to stand out.",
      type: "info"
    });
  } else {
    breakdown.title = 15;
  }

  // 2. Description Scorer (Max 20)
  const descText = data.description || "";
  if (descText.trim().length === 0) {
    breakdown.description = 0;
    suggestions.push({
      id: "desc-empty",
      text: "Add a property description with details about the structure, fittings, or neighborhood.",
      type: "warning"
    });
  } else if (descText.length < 80) {
    breakdown.description = 8;
    suggestions.push({
      id: "desc-short",
      text: "Description is brief. Write at least 80 characters to describe payment schedules, nearby spots, or build quality.",
      type: "info"
    });
  } else if (descText.length < 200) {
    breakdown.description = 15;
    suggestions.push({
      id: "desc-medium",
      text: "Tip: Expand the description past 200 characters to optimize your listing for Google SEO ranking.",
      type: "info"
    });
  } else {
    breakdown.description = 20;
  }

  // 3. Images Scorer (Max 25)
  // Combine potential data structures
  const imageCount = (data.images ? data.images.length : 0) || 
                     ((data.featuredImage ? 1 : 0) + (data.galleryImages ? data.galleryImages.length : 0));

  if (imageCount === 0) {
    breakdown.images = 0;
    suggestions.push({
      id: "images-empty",
      text: "Upload a featured display image for your listing (draws 5x more clicks).",
      type: "warning"
    });
  } else {
    // 10 pts for having at least 1 image
    breakdown.images = 10;
    
    // 3 pts for each gallery image up to 15 pts (5 gallery images max)
    const galleryCount = imageCount - 1;
    const galleryPoints = Math.min(galleryCount * 3, 15);
    breakdown.images += galleryPoints;

    if (imageCount < 4) {
      suggestions.push({
        id: "images-few",
        text: `Only ${imageCount} photo${imageCount > 1 ? "s" : ""} added. Add at least 3-4 more gallery photos of different angles or sector maps.`,
        type: "info"
      });
    }
  }

  // 4. Video & Virtual Tour Scorer (Max 15)
  const hasVideo = !!data.videoUrl && data.videoUrl.trim().length > 0;
  const hasTour = !!data.virtualTour && data.virtualTour.trim().length > 0;

  if (hasVideo) breakdown.video += 10;
  if (hasTour) breakdown.video += 5;

  if (!hasVideo) {
    suggestions.push({
      id: "video-missing",
      text: "Add a YouTube/Vimeo video walk-through link to verify building authenticity.",
      type: "info"
    });
  }
  if (!hasTour) {
    suggestions.push({
      id: "tour-missing",
      text: "Provide a 360° virtual tour link so buyers can tour the site remotely.",
      type: "info"
    });
  }

  // 5. Location details (Max 15)
  const hasSociety = !!data.society || !!data.location;
  const hasDetails = !!data.sector || !!data.block || !!data.street;
  
  if (hasSociety) breakdown.location += 7;
  if (hasDetails) breakdown.location += 8;

  if (!hasDetails) {
    suggestions.push({
      id: "location-details",
      text: "Specify block, sector, and street numbers for correct listing indexing.",
      type: "warning"
    });
  }

  // 6. Amenities Scorer (Max 10)
  const amenitiesCount = data.amenities ? data.amenities.length : 0;
  if (amenitiesCount === 0) {
    breakdown.amenities = 0;
    suggestions.push({
      id: "amenities-empty",
      text: "Select key utility amenities (e.g. Underground Electricity, Sui Gas, Water).",
      type: "warning"
    });
  } else {
    // 2 points per amenity up to 10 points (5 amenities max)
    breakdown.amenities = Math.min(amenitiesCount * 2, 10);
    if (amenitiesCount < 4) {
      suggestions.push({
        id: "amenities-few",
        text: `Only ${amenitiesCount} amenities selected. Choose at least 4-5 amenities to help search filters.`,
        type: "info"
      });
    }
  }

  // Calculate sum of parts
  const score = breakdown.title + breakdown.description + breakdown.images + breakdown.video + breakdown.location + breakdown.amenities;

  // Add default success suggestions if score is very high
  if (score >= 90) {
    suggestions.unshift({
      id: "high-score",
      text: "Excellent! Your listing quality score is outstanding. It is ready for maximum visibility.",
      type: "success"
    });
  }

  return {
    score,
    breakdown,
    suggestions
  };
}
