"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Property } from "@/data/initialProperties";
import { processImage, ProcessProgress, ProcessedImage } from "@/utils/imageProcessor";
import { calculateListingQuality } from "@/utils/qualityScorer";
import { uploadPropertyMedia } from "@/utils/supabaseService";
import { 
  Building, 
  MapPin, 
  Sparkles, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Loader2, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  Trash2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare let google: any;

const countriesList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", 
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", 
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", 
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", 
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const citiesByCountry: Record<string, string[]> = {
  "Pakistan": [
    "Bahawalpur", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", 
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Sargodha", "Sukkur", "Jhang", 
    "Sheikhupura", "Larkana", "Gujrat", "Mardan", "Kasur", "Rahim Yar Khan", "Sahiwal", 
    "Okara", "Wah Cantt", "Dera Ghazi Khan", "Mirpur Khas", "Nawabshah", "Chiniot"
  ],
  "United Arab Emirates": [
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
  ],
  "Saudi Arabia": [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Taif", "Jubail", "Abha"
  ],
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", 
    "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Miami", "Boston"
  ],
  "United Kingdom": [
    "London", "Birmingham", "Glasgow", "Liverpool", "Bristol", "Manchester", "Sheffield", 
    "Leeds", "Edinburgh", "Leicester", "Coventry", "Belfast"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City"
  ],
  "Turkey": [
    "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya"
  ],
  "Qatar": [
    "Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Umm Salal"
  ],
  "Oman": [
    "Muscat", "Salalah", "Seeb", "Sohar", "Nizwa"
  ],
  "Bahrain": [
    "Manama", "Riffa", "Muharraq", "Hamad Town"
  ]
};

interface AddPropertyWizardProps {
  onSuccess: () => void;
}

export default function AddPropertyWizard({ onSuccess }: AddPropertyWizardProps) {
  const { addProperty, userSession } = useAppState();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State
  const [purpose, setPurpose] = useState<"Buy" | "Rent">("Buy");
  const [type, setType] = useState<string>("");
  
  // Location
  const [country, setCountry] = useState("Pakistan");
  const [city, setCity] = useState("Bahawalpur");
  const [society, setSociety] = useState("DHA Bahawalpur");
  const [sector, setSector] = useState("");
  const [block, setBlock] = useState("");
  const [street, setStreet] = useState("");
  const [latitude, setLatitude] = useState(29.3512); // Default Bahawalpur lat
  const [longitude, setLongitude] = useState(71.7483); // Default Bahawalpur lng


  // Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("Marla");
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [floors, setFloors] = useState("1");
  const [possessionStatus, setPossessionStatus] = useState<"Possession" | "Non-Possession">("Possession");
  const [furnishedStatus, setFurnishedStatus] = useState<"Furnished" | "Semi-Furnished" | "Unfurnished">("Unfurnished");
  const [isCorner, setIsCorner] = useState(false);
  const [isParkFacing, setIsParkFacing] = useState(false);
  const [isMainBoulevard, setIsMainBoulevard] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Sui Gas",
    "Underground Electricity",
    "Sewerage System"
  ]);

  // Price
  const [price, setPrice] = useState("");
  const [installmentAvailable, setInstallmentAvailable] = useState(false);
  const [downPayment, setDownPayment] = useState("");
  const [monthlyInstallment, setMonthlyInstallment] = useState("");
  const [durationMonths, setDurationMonths] = useState("24");

  // Media (Holds ProcessedImage data after processing)
  const [featuredImage, setFeaturedImage] = useState<ProcessedImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProcessedImage[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [virtualTour, setVirtualTour] = useState("");
  
  // Image Processing State tracker
  const [processingFeatured, setProcessingFeatured] = useState<ProcessProgress>({ status: "idle", message: "" });
  const [processingGallery, setProcessingGallery] = useState<ProcessProgress[]>([]);

  // Contact Info
  const [contactType, setContactType] = useState<"Owner" | "Dealer" | "Agency">("Owner");
  const [contactName, setContactName] = useState(userSession.name || "");
  const [contactPhone, setContactPhone] = useState(userSession.phone || "");
  const [agencyName, setAgencyName] = useState(userSession.companyName || "");

  // Verification State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Submission Complete
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check for AI generated listing to pre-fill
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gem-ai-generated-listing");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const timer = setTimeout(() => {
            if (parsed.title) setTitle(parsed.title);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.type) setType(parsed.type);
            if (parsed.area) setArea(parsed.area);
            if (parsed.areaUnit) setAreaUnit(parsed.areaUnit);
            if (parsed.price) setPrice(parsed.price);
            if (parsed.location) setSociety(parsed.location);
            // If we pre-filled successfully, we can jump to Step 4 (details) directly so the user can see it!
            setStep(4);
          }, 0);
          localStorage.removeItem("gem-ai-generated-listing");
          return () => clearTimeout(timer);
        } catch (e) {
          console.error("Error parsing AI listing", e);
        }
      }
    }
  }, []);



  // Google Maps and Fallback Mock Map state


  // Automatically geocode when country, city, society, sector, block, or street changes
  useEffect(() => {
    if (!city) return;
    
    const addressParts = [];
    if (street) addressParts.push(street);
    if (block) addressParts.push(block);
    if (sector) addressParts.push(sector);
    if (society) addressParts.push(society);
    if (city) addressParts.push(city);
    if (country) addressParts.push(country);
    
    const fullAddress = addressParts.join(", ");
    const delayDebounceFn = setTimeout(() => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey && typeof window !== "undefined" && (window as any).google && (window as any).google.maps) {
        try {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
            if (status === "OK" && results && results[0]) {
              const loc = results[0].geometry.location;
              const newLat = parseFloat(loc.lat().toFixed(5));
              const newLng = parseFloat(loc.lng().toFixed(5));
              setLatitude(newLat);
              setLongitude(newLng);
            }
          });
        } catch (err) {
          console.error("Geocoding failed, using static fallback", err);
        }
      } else {
        // Offline / Fallback GIS Mode coordinate shifting
        const cityCoords: Record<string, {lat: number, lng: number}> = {
          "Bahawalpur": { lat: 29.3512, lng: 71.7483 },
          "Lahore": { lat: 31.5204, lng: 74.3587 },
          "Karachi": { lat: 24.8607, lng: 67.0011 },
          "Islamabad": { lat: 33.6844, lng: 73.0479 },
          "Rawalpindi": { lat: 33.5651, lng: 73.0169 },
          "Faisalabad": { lat: 31.4504, lng: 73.1350 },
          "Multan": { lat: 30.1575, lng: 71.5249 },
          "Peshawar": { lat: 34.0151, lng: 71.5249 },
          "Quetta": { lat: 30.1798, lng: 66.9750 },
          "Dubai": { lat: 25.2048, lng: 55.2708 },
          "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
          "Riyadh": { lat: 24.7136, lng: 46.6753 },
          "Jeddah": { lat: 21.5433, lng: 39.1728 },
          "New York": { lat: 40.7128, lng: -74.0060 },
          "London": { lat: 51.5074, lng: -0.1278 }
        };
        
        if (cityCoords[city]) {
          let lat = cityCoords[city].lat;
          let lng = cityCoords[city].lng;
          
          if (society) {
            lat += 0.005;
            lng -= 0.003;
          }
          if (sector) {
            lat -= 0.002;
            lng += 0.001;
          }
          if (block) {
            lat += 0.0015;
            lng -= 0.0008;
          }
          if (street) {
            lat -= 0.001;
            lng += 0.002;
          }
          
          setLatitude(parseFloat(lat.toFixed(5)));
          setLongitude(parseFloat(lng.toFixed(5)));
        }
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [country, city, society, sector, block, street]);

  // Step names
  const stepNames = [
    "Purpose",
    "Type",
    "Location",
    "Details",
    "Pricing",
    "Media",
    "Contact",
    "Verification"
  ];

  // Validation functions
  const validateStep = (currentStep: number): boolean => {
    setValidationError(null);
    switch (currentStep) {
      case 1:
        if (!purpose) {
          setValidationError("Please select a property submission purpose.");
          return false;
        }
        return true;
      case 2:
        if (!type) {
          setValidationError("Please select a property type.");
          return false;
        }
        return true;
      case 3:
        if (!city.trim()) {
          setValidationError("City name is required.");
          return false;
        }
        if (!society.trim()) {
          setValidationError("Society or area name is required.");
          return false;
        }
        if (!sector.trim()) {
          setValidationError("Sector/Phase detail is required.");
          return false;
        }
        return true;
      case 4:
        if (title.length < 8) {
          setValidationError("Property title is too short. Min 8 characters required.");
          return false;
        }
        if (description.length < 15) {
          setValidationError("Please write a slightly longer description (Min 15 characters).");
          return false;
        }
        if (!area || isNaN(Number(area)) || Number(area) <= 0) {
          setValidationError("Please specify a valid numeric area size.");
          return false;
        }
        return true;
      case 5:
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
          setValidationError("Please specify a valid total price demand.");
          return false;
        }
        if (installmentAvailable) {
          if (!downPayment || isNaN(Number(downPayment)) || Number(downPayment) < 0) {
            setValidationError("Please specify down payment (or enter 0 if none).");
            return false;
          }
          if (!monthlyInstallment || isNaN(Number(monthlyInstallment)) || Number(monthlyInstallment) <= 0) {
            setValidationError("Please enter a valid monthly installment demand.");
            return false;
          }
          if (Number(downPayment) > Number(price)) {
            setValidationError("Down payment cannot be greater than the total demand price.");
            return false;
          }
        }
        return true;
      case 6:
        if (!featuredImage) {
          setValidationError("A featured display image is required for publishing listings.");
          return false;
        }
        return true;
      case 7:
        if (!contactName.trim()) {
          setValidationError("Contact representative name is required.");
          return false;
        }
        if (!contactPhone.trim() || contactPhone.length < 9) {
          setValidationError("Please enter a valid contact phone number.");
          return false;
        }
        if (contactType === "Agency" && !agencyName.trim()) {
          setValidationError("Agency name is required for agency representatives.");
          return false;
        }
        return true;
      case 8:
        if (!declarationAccepted) {
          setValidationError("Declaration approval is required. Please certify the details are accurate to proceed.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Step 6: Process and upload images
  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await processImage(file, (prog) => {
        setProcessingFeatured(prog);
      });
      setFeaturedImage(processed);
    } catch (err) {
      console.error(err);
      setValidationError("Failed to process featured image. Make sure it's a valid format.");
    } finally {
      setProcessingFeatured({ status: "idle", message: "" });
    }
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const fileList = Array.from(files);
    
    // Initialize loaders for each file
    const initialLoaders = fileList.map(() => ({ status: "resizing" as const, message: "Queued..." }));
    setProcessingGallery(initialLoaders);

    const processedImages: ProcessedImage[] = [];

    for (let i = 0; i < fileList.length; i++) {
      try {
        const processed = await processImage(fileList[i], (prog) => {
          setProcessingGallery(prev => {
            const next = [...prev];
            next[i] = prog;
            return next;
          });
        });
        processedImages.push(processed);
      } catch (err) {
        console.error(err);
      }
    }

    setGalleryImages(prev => [...prev, ...processedImages]);
    setProcessingGallery([]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, idx) => idx !== index));
  };



  // Final Publish Handler
  const handlePublish = async () => {
    if (!declarationAccepted) {
      setValidationError("You must certify and declare the accuracy of the listing details before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const uploadedImageUrls: string[] = [];
      const timestamp = Date.now();
      
      if (featuredImage) {
        const url = await uploadPropertyMedia(featuredImage.blob, `property_${timestamp}_featured.jpg`);
        uploadedImageUrls.push(url);
        
        for (let i = 0; i < galleryImages.length; i++) {
          const gUrl = await uploadPropertyMedia(galleryImages[i].blob, `property_${timestamp}_gallery_${i}.jpg`);
          uploadedImageUrls.push(gUrl);
        }
      }

      // Structure property package
      const newProp = {
        title,
        price: Number(price),
        location: society,
        sector: sector,
        type: type as Property["type"],
        size: `${area} ${areaUnit}`,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        floors: floors ? Number(floors) : undefined,
        furnishedStatus: furnishedStatus,
        description,
        videoUrl,
        virtualTour,
        // Map uploaded urls (or mock placeholders if none)
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"],
        agent: {
          name: contactName,
          phone: contactPhone,
          whatsapp: contactPhone.replace(/[^0-9]/g, ""),
          image: contactType === "Agency" ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80" : userSession.image,
          experience: contactType === "Owner" ? "Private Submitter" : "Certified Partner"
        },
        amenities: [
          ...(isCorner ? ["Corner Plot"] : []),
          ...(isParkFacing ? ["Park Facing"] : []),
          ...(isMainBoulevard ? ["Main Boulevard Facing"] : []),
          ...selectedAmenities
        ],
        purpose: purpose === "Buy" ? "Buy" as const : "Rent" as const,
        isFeatured: false,
        isCorner,
        isParkFacing,
        isMainBoulevard,
        possessionStatus,
        installmentAvailable,
        installmentDetails: installmentAvailable ? {
          downPayment: Number(downPayment),
          monthlyInstallment: Number(monthlyInstallment),
          durationMonths: Number(durationMonths)
        } : undefined,
        locationDetails: {
          country,
          city,
          society,
          sector,
          block,
          street,
          latitude,
          longitude
        },
        contactDetails: {
          type: contactType,
          name: contactName,
          phone: contactPhone,
          agencyName: contactType === "Agency" ? agencyName : undefined
        },
        verificationDetails: {
          channel: "SMS" as const,
          phone: contactPhone,
          isVerified: false
        },
        isApproved: true, // Auto-approved on upload
        isPremium: userSession.plan === "Pro",
        roiPotential: purpose === "Buy" ? "9.8%" : "6.2%",
        nearby: {
          schools: "International School Sector (4 mins)",
          hospitals: "Gis Medical Complex (7 mins)",
          mosques: "Sector Grand Masjid (3 mins)",
          markets: "Civic Commercial Plaza (2 mins)"
        }
      };

      addProperty(newProp);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Delay success trigger callback
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error("Error publishing property:", err);
      setValidationError("An error occurred while publishing the property. Please try again.");
      setIsSubmitting(false);
    }
  };



  const quality = calculateListingQuality({
    title,
    description,
    images: featuredImage ? [featuredImage.previewUrl, ...galleryImages.map(gi => gi.previewUrl)] : [],
    videoUrl,
    virtualTour,
    society,
    sector,
    block,
    street,
    latitude,
    longitude,
    amenities: [
      ...(isCorner ? ["Corner Plot"] : []),
      ...(isParkFacing ? ["Park Facing"] : []),
      ...(isMainBoulevard ? ["Main Boulevard Facing"] : []),
      ...selectedAmenities
    ]
  });

  // Score color classes
  let scoreColorClass = "text-red-500";
  let scoreBgClass = "bg-red-500/10 border-red-500/20";
  let progressGradient = "from-red-500 to-orange-500";
  let scoreLabel = "Needs Work";

  if (quality.score >= 80) {
    scoreColorClass = "text-emerald-500";
    scoreBgClass = "bg-emerald-500/10 border-emerald-500/20";
    progressGradient = "from-emerald-500 to-teal-400";
    scoreLabel = "Excellent Copy";
  } else if (quality.score >= 50) {
    scoreColorClass = "text-amber-500";
    scoreBgClass = "bg-amber-500/10 border-amber-500/20";
    progressGradient = "from-orange-500 to-amber-500";
    scoreLabel = "Good Quality";
  }

  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-border-base bg-background/40 backdrop-blur-md overflow-hidden glass shadow-2xl">
      {/* Header section & Step progression indicator */}
      <div className="bg-muted-bg border-b border-border-base p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span>Add Property Pro Submission Wizard</span>
            </h2>
            <p className="text-[11px] text-muted-text mt-0.5">Submit premium listings to the Global Estate directory.</p>
          </div>
          <span className="text-xs font-bold text-gold px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-full">
            Step {step} of 8
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-border-base/50 h-1.5 rounded-full mt-6 overflow-hidden flex">
          {stepNames.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full flex-grow border-r border-background/20 transition-all duration-300 ${
                idx + 1 <= step ? "bg-gold" : "bg-transparent"
              }`}
            />
          ))}
        </div>
        
        {/* Step labels */}
        <div className="hidden sm:grid grid-cols-8 gap-1 text-[9px] font-bold text-muted-text uppercase tracking-wider text-center mt-2.5">
          {stepNames.map((name, idx) => (
            <span 
              key={name}
              className={idx + 1 === step ? "text-gold font-black" : idx + 1 < step ? "text-foreground" : "text-muted-text/60"}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Form content pane */}
      <div className="p-6 md:p-8 min-h-[400px]">
        {validationError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl mb-6 flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Property Submitted for Review!</h3>
              <p className="text-xs text-muted-text max-w-md mx-auto leading-relaxed">
                Your premium listing request was captured. In compliance with marketplace regulations, an **Admin review and approval** is required before this property is made public on listings search feeds.
              </p>
              <div className="pt-2 text-slate-500 text-[10px] font-bold tracking-wider uppercase flex items-center justify-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                <span>Returning to Listing Panel...</span>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: PROPERTY PURPOSE */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">What is the intent of this property?</h3>
                    <p className="text-xs text-muted-text mt-1">Specify whether you wish to sell this listing or offer it for lease.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto pt-4">
                    <button
                      onClick={() => {
                        setPurpose("Buy");
                        setStep(2);
                      }}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center space-y-4 shadow-sm hover:shadow-md ${
                        purpose === "Buy" 
                          ? "bg-gold/10 border-gold shadow-gold/5" 
                          : "bg-muted-bg/50 border-border-base hover:bg-muted-bg"
                      }`}
                    >
                      <div className={`p-4 rounded-xl ${purpose === "Buy" ? "bg-gold text-slate-950" : "bg-background border border-border-base text-muted-text"}`}>
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Sell Property</h4>
                        <p className="text-[10px] text-muted-text mt-1">For cash transactions, transfers, or installments.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPurpose("Rent");
                        setStep(2);
                      }}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center space-y-4 shadow-sm hover:shadow-md ${
                        purpose === "Rent" 
                          ? "bg-gold/10 border-gold shadow-gold/5" 
                          : "bg-muted-bg/50 border-border-base hover:bg-muted-bg"
                      }`}
                    >
                      <div className={`p-4 rounded-xl ${purpose === "Rent" ? "bg-gold text-slate-950" : "bg-background border border-border-base text-muted-text"}`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Rent Property</h4>
                        <p className="text-[10px] text-muted-text mt-1">For monthly or annual rental income contracts.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PROPERTY TYPE */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Select Property Category Type</h3>
                    <p className="text-xs text-muted-text mt-1">Choose the specific type category that matches your allotment.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {[
                      { id: "Plot", label: "Plot / Land", desc: "Residential land" },
                      { id: "House", label: "House", desc: "Independent villas" },
                      { id: "Commercial Plot", label: "Commercial Plot", desc: "Business plot" },
                      { id: "Apartment", label: "Apartment", desc: "Flats & suites" },
                      { id: "Shop", label: "Shop / Retail", desc: "Commercial outlet" },
                      { id: "Office", label: "Office Space", desc: "Corporate suite" },
                      { id: "Farm House", label: "Farm House", desc: "Recreational farm" },
                      { id: "Building", label: "Whole Building", desc: "Plaza or complex" }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setType(t.id);
                          setStep(3);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-28 ${
                          type === t.id 
                            ? "bg-gold/10 border-gold" 
                            : "bg-muted-bg/50 border-border-base hover:bg-muted-bg"
                        }`}
                      >
                        <span className={`p-1.5 rounded-lg w-fit ${type === t.id ? "bg-gold text-slate-950" : "bg-background border border-border-base text-muted-text"}`}>
                          <Building className="w-3.5 h-3.5" />
                        </span>
                        <div className="mt-2">
                          <h4 className="font-bold text-xs text-foreground">{t.label}</h4>
                          <p className="text-[9px] text-muted-text/80 mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION INFORMATION */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Where is this property located?</h3>
                    <p className="text-xs text-muted-text mt-1">Ensure correct society and sector details for public directory indexing.</p>
                  </div>

                  <div className="max-w-md mx-auto p-6 border border-border-base bg-muted-bg/30 rounded-2xl space-y-4 glass">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Country</label>
                        <select 
                          value={country} 
                          onChange={e => {
                            setCountry(e.target.value);
                            setCity("");
                          }}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold text-foreground font-bold"
                        >
                          <option value="">Select Country</option>
                          {countriesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">City</label>
                        {citiesByCountry[country] && city !== "custom" && !citiesByCountry[country].includes(city) && city !== "" ? (
                          <div className="relative">
                            <input 
                              type="text" 
                              required 
                              placeholder="Type city..." 
                              value={city} 
                              onChange={e => setCity(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold text-foreground"
                            />
                            <button 
                              type="button"
                              onClick={() => setCity("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gold hover:underline font-bold"
                            >
                              Reset
                            </button>
                          </div>
                        ) : citiesByCountry[country] && city !== "custom" ? (
                          <select
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold text-foreground font-bold"
                          >
                            <option value="">Select City</option>
                            {citiesByCountry[country].map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                            <option value="custom">Other / Type manually...</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Bahawalpur" 
                              value={city === "custom" ? "" : city} 
                              onChange={e => setCity(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold text-foreground"
                            />
                            {citiesByCountry[country] && (
                              <button 
                                type="button"
                                onClick={() => setCity("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gold hover:underline font-bold"
                              >
                                Select List
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Society / Project</label>
                      <input 
                        type="text" required placeholder="e.g. DHA Bahawalpur" value={society} onChange={e => setSociety(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Sector</label>
                        <input 
                          type="text" required placeholder="e.g. Sector A" value={sector} onChange={e => setSector(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Block</label>
                        <input 
                          type="text" placeholder="e.g. Block 2" value={block} onChange={e => setBlock(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Street</label>
                        <input 
                          type="text" placeholder="e.g. St 4" value={street} onChange={e => setStreet(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center space-x-1.5 px-6 py-2.5 bg-royal text-white rounded-xl text-xs font-bold hover:bg-royal-hover transition-colors shadow-lg shadow-royal/10 cursor-pointer font-bold"
                      >
                        <span>Continue Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PROPERTY DETAILS */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Property Specifications & Details</h3>
                    <p className="text-xs text-muted-text mt-1">Provide clear specifications to help prospective buyers search correctly.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8">
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Property Title</label>
                        <input 
                          type="text" required placeholder="e.g. 10 Marla Premium Corner Plot Sector B" 
                          value={title} onChange={e => setTitle(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Possession Status</label>
                        <select 
                          value={possessionStatus} onChange={e => setPossessionStatus(e.target.value as Property["possessionStatus"])}
                          className="w-full text-xs rounded-lg border border-border-base px-2 py-2 bg-muted-bg outline-none font-bold focus:ring-1 focus:ring-gold"
                        >
                          <option value="Possession">Possession Ready</option>
                          <option value="Non-Possession">Non-Possession</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Property Description</label>
                      <textarea 
                        required placeholder="Describe amenities, location advantages, documentation state..." 
                        rows={3} value={description} onChange={e => setDescription(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Area Size</label>
                        <input 
                          type="number" required placeholder="e.g. 10" 
                          value={area} onChange={e => setArea(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Area Unit</label>
                        <select 
                          value={areaUnit} onChange={e => setAreaUnit(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-2 py-2 bg-muted-bg outline-none font-bold focus:ring-1 focus:ring-gold"
                        >
                          <option value="Marla">Marla</option>
                          <option value="Kanal">Kanal</option>
                          <option value="Sq. Ft.">Sq. Ft.</option>
                          <option value="Sq. Yd.">Sq. Yd.</option>
                        </select>
                      </div>

                      {/* Render Beds/Baths only if type is NOT Plot/Commercial Plot */}
                      {type !== "Plot" && type !== "Commercial Plot" ? (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Bedrooms</label>
                            <input 
                              type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Bathrooms</label>
                            <input 
                              type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Floors</label>
                            <input 
                              type="number" value={floors} onChange={e => setFloors(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="col-span-3 p-3 bg-muted-bg/30 border border-border-base/50 rounded-xl text-[10px] font-semibold text-muted-text flex items-center justify-center">
                          Beds/Baths not applicable for Land Plots.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center pt-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Furnished Status</label>
                        <select 
                          value={furnishedStatus} onChange={e => setFurnishedStatus(e.target.value as "Furnished" | "Semi-Furnished" | "Unfurnished")}
                          className="w-full text-xs rounded-lg border border-border-base px-2 py-2 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-medium"
                        >
                          <option value="Unfurnished">Unfurnished</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Furnished">Fully Furnished</option>
                        </select>
                      </div>

                      <div className="col-span-3 flex flex-wrap gap-4 pt-4">
                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={isCorner} onChange={e => setIsCorner(e.target.checked)} className="rounded accent-gold text-white" />
                          <span>Corner Plot</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={isParkFacing} onChange={e => setIsParkFacing(e.target.checked)} className="rounded accent-gold text-white" />
                          <span>Park Facing</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={isMainBoulevard} onChange={e => setIsMainBoulevard(e.target.checked)} className="rounded accent-gold text-white" />
                          <span>Main Boulevard</span>
                        </label>
                      </div>

                      {/* Amenities Selection Checkbox Grid */}
                      <div className="col-span-3 pt-4 border-t border-border-base/50 space-y-3">
                        <label className="block text-[10px] font-bold uppercase text-muted-text">Select Utility Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            "Sui Gas",
                            "Underground Electricity",
                            "Sewerage System",
                            "Water Supply",
                            "Internet Access",
                            "Boundary Wall",
                            "24/7 Security Patrol",
                            "Grand Mosque Nearby",
                            "Public Park Nearby"
                          ].map(amenity => (
                            <label key={amenity} className="flex items-center space-x-2 text-xs cursor-pointer hover:text-gold transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedAmenities(prev => [...prev, amenity]);
                                  } else {
                                    setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                                  }
                                }}
                                className="rounded accent-gold text-white"
                              />
                              <span>{amenity}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PRICE INFORMATION */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Pricing & Installment Framework</h3>
                    <p className="text-xs text-muted-text mt-1">Specify payment configuration details and support installment options.</p>
                  </div>

                  <div className="max-w-md mx-auto space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Total Demand Price (PKR)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-gold pointer-events-none">PKR</span>
                        <input 
                          type="number" required placeholder="e.g. 8500000" 
                          value={price} onChange={e => setPrice(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base pl-12 pr-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[10px] text-muted-text mt-1 italic font-semibold">
                        {price && `Format: ${Number(price) >= 10000000 ? `${(Number(price) / 10000000).toFixed(2)} Crore` : `${(Number(price) / 100000).toFixed(0)} Lakh`}`}
                      </p>
                    </div>

                    <div className="p-4 bg-muted-bg/50 border border-border-base rounded-xl space-y-4">
                      <label className="flex items-center space-x-2.5 text-xs font-extrabold cursor-pointer">
                        <input 
                          type="checkbox" checked={installmentAvailable} 
                          onChange={e => setInstallmentAvailable(e.target.checked)} 
                          className="rounded accent-gold text-white w-4 h-4" 
                        />
                        <span>Installment Plan is Available</span>
                      </label>

                      {installmentAvailable && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="grid grid-cols-2 gap-4 pt-2 border-t border-border-base/50"
                        >
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-muted-text mb-1">Down Payment (PKR)</label>
                            <input 
                              type="number" placeholder="e.g. 2000000" 
                              value={downPayment} onChange={e => setDownPayment(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-muted-text mb-1">Monthly Installment (PKR)</label>
                            <input 
                              type="number" placeholder="e.g. 150000" 
                              value={monthlyInstallment} onChange={e => setMonthlyInstallment(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-gold font-bold"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] font-bold uppercase text-muted-text mb-1">Plan Duration (Months)</label>
                            <select 
                              value={durationMonths} onChange={e => setDurationMonths(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-2 py-2 bg-background outline-none focus:ring-1 focus:ring-gold font-semibold"
                            >
                              <option value="12">12 Months (1 Year)</option>
                              <option value="24">24 Months (2 Years)</option>
                              <option value="36">36 Months (3 Years)</option>
                              <option value="48">48 Months (4 Years)</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Continue Step button right under Installment plan */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center space-x-1.5 px-6 py-2.5 bg-royal text-white rounded-xl text-xs font-bold hover:bg-royal-hover transition-colors shadow-lg shadow-royal/10 w-full sm:w-auto justify-center"
                      >
                        <span>Continue Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: MEDIA UPLOAD */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Media Upload & Processing</h3>
                    <p className="text-xs text-muted-text mt-1">Upload pictures and videos. Uploaded images will be auto-compressed, resized, and watermarked.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Featured Image Zone */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase text-muted-text">Featured Primary Display Image (Required)</label>
                      
                      <div className="border-2 border-dashed border-border-base hover:border-gold rounded-xl p-4 bg-muted-bg/30 text-center flex flex-col items-center justify-center min-h-[160px] relative transition-colors">
                        {featuredImage ? (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={featuredImage.previewUrl} alt="Featured Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <label className="cursor-pointer text-xs font-bold text-white bg-gold px-3 py-1.5 rounded-lg flex items-center space-x-1">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Change Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageChange} />
                              </label>
                            </div>
                            <span className="absolute bottom-2 right-2 text-[8px] bg-slate-950/80 border border-gold/30 text-gold px-2 py-0.5 rounded uppercase font-bold">Watermarked Display</span>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center space-y-2 py-4">
                            {processingFeatured.status !== "idle" ? (
                              <div className="flex flex-col items-center space-y-2">
                                <Loader2 className="w-7 h-7 text-gold animate-spin" />
                                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{processingFeatured.message}</span>
                              </div>
                            ) : (
                              <>
                                <Camera className="w-8 h-8 text-slate-400" />
                                <span className="text-xs font-bold text-foreground">Click to upload featured display image</span>
                                <span className="text-[9px] text-muted-text">Accepts JPG, PNG formats. Will auto-watermark.</span>
                              </>
                            )}
                            <input type="file" accept="image/*" className="hidden" disabled={processingFeatured.status !== "idle"} onChange={handleFeaturedImageChange} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Gallery Images Zone */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase text-muted-text">Gallery Portfolio Images</label>
                      
                      <div className="border-2 border-dashed border-border-base hover:border-gold rounded-xl p-4 bg-muted-bg/30 text-center flex flex-col items-center justify-center min-h-[160px] relative transition-colors">
                        <label className="cursor-pointer flex flex-col items-center space-y-2 py-2">
                          {processingGallery.length > 0 ? (
                            <div className="flex flex-col items-center space-y-2">
                              <Loader2 className="w-7 h-7 text-gold animate-spin" />
                              <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Processing ({processingGallery.filter(x => x.status === "done").length}/{processingGallery.length}) images...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-400" />
                              <span className="text-xs font-bold text-foreground">Add gallery photos</span>
                              <span className="text-[9px] text-muted-text">You can select multiple images to queue.</span>
                            </>
                          )}
                          <input type="file" accept="image/*" multiple className="hidden" disabled={processingGallery.length > 0} onChange={handleGalleryImagesChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Previews Grid */}
                  {galleryImages.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold uppercase text-muted-text">Processed Gallery ({galleryImages.length})</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {galleryImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group border border-border-base">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.previewUrl} alt="Gallery Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-0.5 right-0.5 text-[5px] bg-slate-950/80 text-gold px-1 rounded uppercase">Watermarked</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video & 360 tour fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Youtube/Vimeo Video URL</label>
                      <input 
                        type="url" placeholder="e.g. https://youtube.com/watch?v=..." 
                        value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">360° Virtual Tour URL Link</label>
                      <input 
                        type="url" placeholder="e.g. https://kuula.co/post/..." 
                        value={virtualTour} onChange={e => setVirtualTour(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: CONTACT INFORMATION */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Contact & Representative Information</h3>
                    <p className="text-xs text-muted-text mt-1">Provide credentials of the representative handling this property listing query.</p>
                  </div>

                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Who is listing this property?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Owner", "Dealer", "Agency"] as const).map(cOpt => (
                          <button
                            key={cOpt}
                            type="button"
                            onClick={() => setContactType(cOpt)}
                            className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                              contactType === cOpt 
                                ? "bg-gold/15 border-gold text-gold" 
                                : "bg-muted-bg/50 border-border-base text-muted-text hover:bg-muted-bg"
                            }`}
                          >
                            {cOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Representative Name</label>
                        <input 
                          type="text" required placeholder="Full Name" 
                          value={contactName} onChange={e => setContactName(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Contact Phone Number</label>
                        <input 
                          type="tel" required placeholder="e.g. 0300-1234567" 
                          value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </div>
                    </div>

                    {contactType === "Agency" && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Real Estate Agency / Company Name</label>
                        <input 
                          type="text" required placeholder="Company Name" 
                          value={agencyName} onChange={e => setAgencyName(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 8: VERIFICATION */}
              {step === 8 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground">Administrative Verification</h3>
                    <p className="text-xs text-muted-text mt-1">Review your contact profile and accept declaration to submit for Super Admin approval.</p>
                  </div>

                  <div className="max-w-md mx-auto p-6 border border-border-base bg-muted-bg/30 rounded-2xl space-y-5 glass">
                    <div className="text-center py-2 space-y-3">
                      <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center font-bold border border-amber-500/20">
                        <Lock className="w-5 h-5 text-gold" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">Super Admin Review Required</h4>
                      <p className="text-[10px] text-muted-text leading-relaxed">
                        To maintain directory integrity, all new allotment listings must be vetted by a Super Administrator. Once submitted, your allotment is audited against geographic data and ownership records before going live.
                      </p>
                    </div>

                    <div className="border-t border-border-base/50 pt-4 space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-gold">Review Queue Details</h5>
                      
                      <div className="space-y-2 text-[10px] text-muted-text font-bold text-left">
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Representative: <strong className="text-foreground">{contactName} ({contactType})</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Contact Phone: <strong className="text-foreground">{contactPhone}</strong></span>
                        </div>
                        {contactType === "Agency" && agencyName && (
                          <div className="flex items-center space-x-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Agency: <strong className="text-foreground">{agencyName}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Listing Quality Score: <strong className="text-foreground">{quality.score}/100</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-amber-500" />
                          <span>Publishing Status: <strong className="text-amber-500">Pending Admin Approval</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-base/50 pt-4">
                      <label className="flex items-start space-x-3 cursor-pointer group select-none text-left">
                        <input 
                          type="checkbox" 
                          checked={declarationAccepted} 
                          onChange={e => setDeclarationAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-border-base text-gold focus:ring-gold bg-muted-bg outline-none"
                        />
                        <span className="text-[10px] text-muted-text group-hover:text-foreground transition-colors font-semibold leading-normal font-medium">
                          I declare that the details provided are correct and understand that this listing will be queued for Super Admin review and must be approved before being published.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Listing Quality Scorer (col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-border-base/40 lg:pl-8">
            <div className="sticky top-6 space-y-6 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-border-base p-5 bg-muted-bg/25 glass space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Listing Quality Meter</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${scoreBgClass} ${scoreColorClass}`}>
                    {scoreLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <h4 className="text-3xl font-black text-foreground">
                      {quality.score}<span className="text-xs font-normal text-muted-text">/100</span>
                    </h4>
                    <span className="text-[10px] font-bold text-muted-text">Real-time Rating</span>
                  </div>
                  
                  <div className="w-full bg-border-base/50 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-500`}
                      style={{ width: `${quality.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-b border-border-base/40 py-3 text-[9px] font-bold text-muted-text">
                  <div className="text-center">
                    <span className="block text-muted-text/70 uppercase text-[8px]">Title/Desc</span>
                    <span className="text-foreground">{quality.breakdown.title + quality.breakdown.description}/35</span>
                  </div>
                  <div className="text-center border-l border-r border-border-base/40">
                    <span className="block text-muted-text/70 uppercase text-[8px]">Media</span>
                    <span className="text-foreground">{quality.breakdown.images + quality.breakdown.video}/40</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-muted-text/70 uppercase text-[8px]">Geo/Utility</span>
                    <span className="text-foreground">{quality.breakdown.location + quality.breakdown.amenities}/25</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-gold">Optimization Checklist</span>
                  
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {quality.suggestions.length === 0 ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-bold text-center">
                        ✓ Your listing is 100% complete and fully optimized!
                      </div>
                    ) : (
                      quality.suggestions.map(sug => {
                        let iconColor = "text-amber-500";
                        let iconBg = "bg-amber-500/10";
                        if (sug.type === "warning") {
                          iconColor = "text-red-500";
                          iconBg = "bg-red-500/10";
                        } else if (sug.type === "success") {
                          iconColor = "text-emerald-500";
                          iconBg = "bg-emerald-500/10";
                        }
                        
                        return (
                          <div key={sug.id} className="flex items-start space-x-2 text-[10px] font-medium leading-tight text-foreground/90">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold ${iconBg} ${iconColor}`}>
                              {sug.type === "success" ? "✓" : "!"}
                            </div>
                            <span>{sug.text}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      {!isSubmitted && (
        <div className="bg-muted-bg border-t border-border-base p-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2 border border-border-base rounded-lg text-xs font-bold text-muted-text hover:text-foreground hover:bg-border-base transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 8 ? (
            step > 3 && step !== 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-royal text-white rounded-lg text-xs font-bold hover:bg-royal-hover transition-colors"
              >
                <span>Continue Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gold text-slate-950 rounded-lg text-xs font-black hover:bg-gold-hover transition-colors disabled:bg-slate-700 disabled:text-slate-400 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Listing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Publish Allotment Listing</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
