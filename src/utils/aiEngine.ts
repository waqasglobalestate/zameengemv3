import { Property } from "@/data/initialProperties";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  suggestions?: string[];
  matchedProperties?: Property[];
}

// Helper to parse numbers like "1.5 crore", "80 lakhs", "90 lac" into actual PKR numbers
function parsePrice(text: string): { maxPrice?: number; minPrice?: number } | null {
  const normalized = text.toLowerCase();
  
  // Look for budget patterns like "under X lakhs", "below X crore", "budget X"
  const underRegex = /(?:under|below|less than|up to|max|maximum)\s+([0-9.]+)\s*(crore|cr|lakh|lakhs|lac|lacs|million|m)/i;
  const priceRegex = /([0-9.]+)\s*(crore|cr|lakh|lakhs|lac|lacs|million|m)/gi;
  
  let maxPrice: number | undefined;
  
  const match = underRegex.exec(normalized);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith("cr") || unit.startsWith("crore")) {
      maxPrice = value * 10000000;
    } else if (unit.startsWith("la") || unit.startsWith("lc")) {
      maxPrice = value * 100000;
    } else if (unit.startsWith("m")) {
      maxPrice = value * 1000000;
    }
  } else {
    // Just find any price mentioned
    let m;
    while ((m = priceRegex.exec(normalized)) !== null) {
      const value = parseFloat(m[1]);
      const unit = m[2].toLowerCase();
      let calculatedVal = 0;
      if (unit.startsWith("cr") || unit.startsWith("crore")) {
        calculatedVal = value * 10000000;
      } else if (unit.startsWith("la") || unit.startsWith("lc")) {
        calculatedVal = value * 100000;
      } else if (unit.startsWith("m")) {
        calculatedVal = value * 1000000;
      }
      
      if (normalized.includes("budget") || normalized.includes("around") || normalized.includes("range")) {
        maxPrice = calculatedVal * 1.1; // 10% buffer
      } else {
        maxPrice = calculatedVal;
      }
    }
  }

  return maxPrice ? { maxPrice } : null;
}

// Helper to parse sizes: "10 marla", "1 kanal", "5 marla"
function parseSize(text: string): string | null {
  const normalized = text.toLowerCase();
  const sizeRegex = /(\d+)\s*(marla|kanal|sqft|sft|acre)/i;
  const match = sizeRegex.exec(normalized);
  if (match) {
    const num = match[1];
    const unit = match[2].toLowerCase();
    // Capitalize unit
    const formattedUnit = unit.charAt(0).toUpperCase() + unit.slice(1);
    return `${num} ${formattedUnit}`;
  }
  return null;
}

// Helper to parse property types
function parseType(text: string): Property["type"] | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("plot")) {
    if (normalized.includes("commercial")) return "Commercial Plot";
    return "Residential Plot";
  }
  if (normalized.includes("villa")) return "Villa";
  if (normalized.includes("house") || normalized.includes("home")) return "House";
  if (normalized.includes("commercial")) return "Commercial Plot";
  return null;
}

// Helper to parse location
function parseLocation(text: string): string | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("bahawalpur") || normalized.includes("dha bahawalpur")) return "DHA Bahawalpur";
  if (normalized.includes("multan") || normalized.includes("dha multan")) return "DHA Multan";
  if (normalized.includes("lahore") || normalized.includes("dha lahore")) return "DHA Lahore";
  if (normalized.includes("islamabad") || normalized.includes("dha islamabad")) return "DHA Islamabad";
  if (normalized.includes("bahria") || normalized.includes("bahria town")) return "Bahria Town Projects";
  return null;
}

// Helper to parse purpose
function parsePurpose(text: string): Property["purpose"] | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("rent") || normalized.includes("h किराए") || normalized.includes("kiraya")) return "Rent";
  if (normalized.includes("project")) return "Project";
  if (normalized.includes("buy") || normalized.includes("purchase") || normalized.includes("sale") || normalized.includes("sell")) return "Buy";
  return null;
}

export function generateAIResponse(query: string, properties: Property[]): { text: string; matchedProperties?: Property[]; suggestions: string[] } {
  const normalizedQuery = query.toLowerCase();
  
  // 1. Check for greeting or generic questions
  if (normalizedQuery.match(/\b(hello|hi|hey|assalam|aoa|welcome|good morning|good afternoon)\b/)) {
    return {
      text: "Assalam-o-Alaikum! Welcome to Global Estate & Marketing AI Assistant. I can help you find your dream property, compare listings, calculate ROI, or answer questions about DHA Bahawalpur. What are you looking for today?",
      suggestions: [
        "Show me 10 Marla plots in DHA Bahawalpur",
        "DHA Bahawalpur Investment potential?",
        "1 Kanal Villa under 4 Crore",
        "Calculate construction cost"
      ]
    };
  }

  // Check for CEO/Contact info
  if (normalizedQuery.includes("ceo") || normalizedQuery.includes("waqas") || normalizedQuery.includes("owner") || normalizedQuery.includes("chaudhary")) {
    return {
      text: "The CEO of Global Estate & Marketing is <strong>Waqas Ahmad Chaudhary</strong>. He is a premier real estate consultant with over 15 years of market expertise, specializing in DHA projects. You can contact him directly at <strong>+92300-0066255</strong> or landline <strong>062-2280406</strong>.",
      suggestions: ["Contact Waqas Ahmad via WhatsApp", "View DHA Bahawalpur listings", "Find office location"]
    };
  }

  if (normalizedQuery.includes("contact") || normalizedQuery.includes("phone") || normalizedQuery.includes("number") || normalizedQuery.includes("mobile") || normalizedQuery.includes("whatsapp")) {
    return {
      text: "You can reach Global Estate & Marketing through the following channels:<br/>• <strong>Mobile / WhatsApp:</strong> +92300-0066255<br/>• <strong>Landline:</strong> 062-2280406<br/>• <strong>Email:</strong> Globalrealestates786@gmail.com<br/>• <strong>Office:</strong> DHA Bahawalpur, Punjab, Pakistan.<br/><br/>Would you like me to schedule a consultant call for you?",
      suggestions: ["Schedule a visit", "Contact CEO Waqas Ahmad", "Explore featured properties"]
    };
  }

  // DHA Bahawalpur info questions
  if (normalizedQuery.includes("dha bahawalpur") && (normalizedQuery.includes("amenities") || normalizedQuery.includes("facilities") || normalizedQuery.includes("features") || normalizedQuery.includes("infrastructure") || normalizedQuery.includes("why invest"))) {
    return {
      text: "<strong>DHA Bahawalpur</strong> is the centerpiece of real estate development in southern Punjab. Key highlights and amenities include:<br/>" +
            "• <strong>Infrastructure:</strong> Wide paved roads (up to 120ft Main Boulevards) and 100% underground utilities (electricity, water, gas).<br/>" +
            "• <strong>Education:</strong> Operational DHA School System and university campuses.<br/>" +
            "• <strong>Lifestyle:</strong> Beautiful sector parks, theme parks, modern sports facilities, and grand mosques.<br/>" +
            "• <strong>Security:</strong> 24/7 gated entry, CCTV surveillance, and security patrols.<br/>" +
            "• <strong>Investment ROI:</strong> DHA Bahawalpur plots are seeing 12% to 15% annual capital gains. Commercial zones are experiencing massive value surges.",
      suggestions: ["Show DHA Bahawalpur plots", "Show DHA Bahawalpur Villas", "ROI Calculator"]
    };
  }

  // 2. Parse search parameters
  const parsedLocation = parseLocation(normalizedQuery);
  const parsedPrice = parsePrice(normalizedQuery);
  const parsedSize = parseSize(normalizedQuery);
  const parsedType = parseType(normalizedQuery);
  const parsedPurpose = parsePurpose(normalizedQuery);
  
  // Filter property database
  let matches = properties;
  
  if (parsedLocation) {
    matches = matches.filter(p => p.location.toLowerCase() === parsedLocation.toLowerCase());
  }
  if (parsedPrice?.maxPrice) {
    matches = matches.filter(p => p.price <= (parsedPrice.maxPrice || 0));
  }
  if (parsedSize) {
    // Approximate match (handles "10 marla" vs "10 Marla")
    matches = matches.filter(p => p.size.toLowerCase().replace(/\s+/g, "") === parsedSize.toLowerCase().replace(/\s+/g, ""));
  }
  if (parsedType) {
    matches = matches.filter(p => p.type === parsedType);
  }
  if (parsedPurpose) {
    matches = matches.filter(p => p.purpose === parsedPurpose);
  }

  // 3. Format response based on matches
  const filtersApplied: string[] = [];
  if (parsedLocation) filtersApplied.push(`in <strong>${parsedLocation}</strong>`);
  if (parsedSize) filtersApplied.push(`size <strong>${parsedSize}</strong>`);
  if (parsedType) filtersApplied.push(`type <strong>${parsedType}s</strong>`);
  if (parsedPrice?.maxPrice) {
    const priceText = parsedPrice.maxPrice >= 10000000 
      ? `${(parsedPrice.maxPrice / 10000000).toFixed(1)} Crore` 
      : `${(parsedPrice.maxPrice / 100000).toFixed(0)} Lakhs`;
    filtersApplied.push(`under <strong>PKR ${priceText}</strong>`);
  }
  if (parsedPurpose) filtersApplied.push(`for <strong>${parsedPurpose}</strong>`);

  const filtersString = filtersApplied.length > 0 ? filtersApplied.join(", ") : "properties";

  if (matches.length > 0) {
    const propertyCount = matches.length;
    let text = `Alhamdulillah! I found <strong>${propertyCount} ${propertyCount === 1 ? "listing" : "listings"}</strong> matching your request (${filtersString}):<br/><br/>`;
    
    matches.forEach((p, index) => {
      const priceFormatted = p.price >= 10000000 
        ? `${(p.price / 10000000).toFixed(2)} Crore` 
        : `${(p.price / 100000).toFixed(0)} Lakhs`;
      text += `${index + 1}. <strong>${p.title}</strong><br/>` +
              `• Price: PKR ${priceFormatted}<br/>` +
              `• Size: ${p.size} | Sector: ${p.sector}<br/>` +
              `• ROI Potential: ${p.roiPotential} | Agent: ${p.agent.name}<br/>` +
              `<a href="/properties/${p.id}" class="text-royal hover:underline font-semibold text-sm inline-block mt-1">View Full Details & Virtual Tour →</a><br/><br/>`;
    });

    return {
      text,
      matchedProperties: matches,
      suggestions: ["Compare these properties", "Contact consultant", "Ask about installment plans"]
    };
  }

  // 4. Handle no direct matches - implement smart recommendation
  // Look for alternatives: ignore price cap first, or ignore size to offer suggestions
  let alternativeText = `I couldn't find any direct matches for your query (${filtersString}). `;
  let alternatives: Property[] = [];

  // Suggest same size and location, slightly higher price or different sector
  if (parsedLocation) {
    alternatives = properties.filter(p => p.location.toLowerCase() === parsedLocation.toLowerCase());
    
    if (parsedSize && alternatives.length > 0) {
      const sameSize = alternatives.filter(p => p.size.toLowerCase().replace(/\s+/g, "") === parsedSize.toLowerCase().replace(/\s+/g, ""));
      if (sameSize.length > 0) {
        alternatives = sameSize;
      }
    }
  }

  if (alternatives.length > 0) {
    alternativeText += "However, here are some excellent alternative opportunities that you might interest you:<br/><br/>";
    
    // Pick top 2 alternatives
    alternatives.slice(0, 2).forEach((p, index) => {
      const priceFormatted = p.price >= 10000000 
        ? `${(p.price / 10000000).toFixed(2)} Crore` 
        : `${(p.price / 100000).toFixed(0)} Lakhs`;
      alternativeText += `${index + 1}. <strong>${p.title}</strong><br/>` +
                        `• Price: PKR ${priceFormatted}<br/>` +
                        `• Size: ${p.size} | Sector: ${p.sector}<br/>` +
                        `<a href="/properties/${p.id}" class="text-royal hover:underline font-semibold text-sm inline-block mt-1">View Alternative Details →</a><br/><br/>`;
    });
    
    return {
      text: alternativeText,
      matchedProperties: alternatives.slice(0, 2),
      suggestions: ["Show all DHA Bahawalpur plots", "Contact consultant", "Open ROI calculator"]
    };
  }

  // 5. Default fallback
  return {
    text: "I couldn't find any listings matching those criteria. Global Estate & Marketing specializes in premium residential and commercial sectors in <strong>DHA Bahawalpur, DHA Multan, DHA Lahore, DHA Islamabad, and Bahria Town</strong>.<br/><br/>Please try searching for plots (e.g., '10 marla plot in Sector A') or villas, or ask me to check investment benefits.",
    suggestions: [
      "DHA Bahawalpur Sector A plots",
      "Show luxury villas for sale",
      "Contact Waqas Ahmad Chaudhary",
      "Calculators page"
    ]
  };
}

export interface GeneratedListing {
  title: string;
  seoTitle: string;
  description: string;
  metaDescription: string;
  keywords: string;
}

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateEnglishListing(
  type: string,
  area: string,
  location: string,
  price: string,
  features: string
): GeneratedListing {
  const cleanType = type || "Property";
  const cleanArea = area || "Standard Size";
  const cleanLocation = location || "DHA Bahawalpur";
  const cleanPrice = price ? `PKR ${price}` : "Market Price";
  
  const featureList = features 
    ? features.split(",").map(f => f.trim()).filter(Boolean) 
    : ["Prime Location", "Easy Access", "Modern Infrastructure", "Secure Boundary"];

  const titleTemplates = [
    `Premium ${cleanArea} ${cleanType} for Sale in ${cleanLocation}`,
    `Modern ${cleanArea} ${cleanType} Available at ${cleanLocation}`,
    `Hot Investment Opportunity: ${cleanArea} ${cleanType} in ${cleanLocation}`,
    `Luxurious ${cleanArea} ${cleanType} - Ideal Location in ${cleanLocation}`
  ];
  const title = getRandomElement(titleTemplates);

  const seoTitleTemplates = [
    `${cleanArea} ${cleanType} for Sale in ${cleanLocation}`,
    `${cleanArea} ${cleanType} in ${cleanLocation} - Buy Now`,
    `Investment: ${cleanArea} ${cleanType} at ${cleanLocation}`,
    `Premium ${cleanArea} ${cleanType} for Sale - ${cleanLocation}`
  ];
  let seoTitle = getRandomElement(seoTitleTemplates);
  if (seoTitle.length > 55) {
    seoTitle = seoTitle.substring(0, 55) + "...";
  }

  const introPhrases = [
    `Global Estate & Marketing is pleased to present this outstanding ${cleanArea} ${cleanType} situated in the highly coveted locality of ${cleanLocation}.`,
    `A prestigious address awaits you! We offer this premium ${cleanArea} ${cleanType} for sale in the premium block of ${cleanLocation}, guided by Waqas Ahmad Chaudhary.`,
    `Discover a prime investment opportunity with this outstanding ${cleanArea} ${cleanType} located in the heart of the thriving development of ${cleanLocation}.`,
    `If you are looking for a property that combines premium positioning, excellent infrastructure, and top-tier valuation potential, this ${cleanArea} ${cleanType} in ${cleanLocation} is the perfect match.`
  ];

  const middlePhrases = cleanType.toLowerCase().includes("plot")
    ? [
        `This land plot is ideally suited for building your dream family home or securing a high-yield investment. The sector is rapidly developing with world-class facilities and full security patrols. The property boasts a level layout, ready for immediate possession and construction.`,
        `Perfect for smart investors, this plot offers superb long-term capital gains. The location is characterized by wide carpeted roads, underground electricity, and close proximity to central parks, mosques, and commercial markets.`,
        `This residential/commercial sector is seeing massive investment interest. The plot enjoys a strategic location, making it extremely convenient for access to major highways, educational institutions, and healthcare centers.`
      ]
    : [
        `This modern property boasts state-of-the-art architecture, highly functional design layouts, and premium quality construction. Featuring spacious living areas, high-end fittings, and beautiful finishes, it is designed for a luxurious lifestyle.`,
        `This house/apartment is perfect for families seeking a secure and luxurious home. It is situated in a quiet, green street and is built using high-grade materials, with modern layouts offering excellent natural ventilation and light.`,
        `A masterfully planned building offering spacious rooms, contemporary washrooms, and a fully equipped modular kitchen. Enjoy the security of a gated community along with uninterrupted utility services.`
      ];

  const featurePhrase = featureList.length > 0
    ? `Key specifications of this property include: ${featureList.join(", ")}. These outstanding features make it stand out from standard listings in the area.`
    : `This property is strategically situated near major community parks, commercial zones, and grand mosques, offering convenience and a high quality of life.`;

  const outroPhrases = [
    `Offered at a competitive price of ${cleanPrice}, this is a deal that should not be missed. For pricing queries, site visits, and secure deal closure, contact Waqas Ahmad Chaudhary at Global Estate & Marketing (+92300-0066255) today.`,
    `Don't miss out on this lucrative real estate deal! The demand price is ${cleanPrice}. Get in touch with our certified real estate advisors at Global Estate & Marketing to secure your investment today.`,
    `With a price demand of ${cleanPrice}, this property represents the best value in ${cleanLocation}. Call us today to schedule a physical or virtual tour and close the transaction.`
  ];

  const description = `${getRandomElement(introPhrases)}\n\n${getRandomElement(middlePhrases)}\n\n${featurePhrase}\n\n${getRandomElement(outroPhrases)}`;

  const metaTemplates = [
    `Buy this premium ${cleanArea} ${cleanType} in ${cleanLocation} for ${cleanPrice}. Features: ${featureList.slice(0, 3).join(", ")}. Contact Waqas Ahmad +92300-0066255.`,
    `Premium ${cleanArea} ${cleanType} for sale in ${cleanLocation}. Price: ${cleanPrice}. Top location, ready for construction. Contact Global Estate today!`,
    `Get the best deal on ${cleanArea} ${cleanType} at ${cleanLocation}. Demand: ${cleanPrice}. Modern amenities, secure sector. Call Waqas Ahmad +92300-0066255.`
  ];
  let metaDescription = getRandomElement(metaTemplates);
  if (metaDescription.length > 158) {
    metaDescription = metaDescription.substring(0, 155) + "...";
  }

  const defaultKeywords = [
    `${cleanType} in ${cleanLocation}`,
    `buy ${cleanArea} ${cleanType}`,
    `${cleanLocation} real estate`,
    `Global Estate & Marketing`,
    `Waqas Ahmad Chaudhary`,
    `property for sale in Pakistan`,
    `real estate investment ${cleanLocation}`
  ];
  const keywords = defaultKeywords.join(", ");

  return {
    title,
    seoTitle,
    description,
    metaDescription,
    keywords
  };
}

function generateUrduListing(
  type: string,
  area: string,
  location: string,
  price: string,
  features: string
): GeneratedListing {
  const urduTypes: Record<string, string> = {
    "Plot": "پلاٹ",
    "Residential Plot": "رہائشی پلاٹ",
    "Commercial Plot": "کمرشل پلاٹ",
    "Villa": "ولا",
    "House": "گھر",
    "Apartment": "اپارٹمنٹ",
    "Shop": "دکان",
    "Office": "دفتر",
    "Farm House": "فارم ہاؤس",
    "Building": "عمارت"
  };
  
  const cleanType = urduTypes[type] || type || "پراپرٹی";
  const cleanArea = area || "موزوں سائز";
  const cleanLocation = location || "ڈی ایچ اے بہاولپور";
  const cleanPrice = price ? `روپے ${price}` : "مارکیٹ ریٹ";
  
  const featureList = features 
    ? features.split(",").map(f => f.trim()).filter(Boolean) 
    : ["بہترین لوکیشن", "آسان رسائی", "جدید انفراسٹرکچر", "محفوظ سوسائٹی"];

  const titleTemplates = [
    `${cleanLocation} میں ${cleanArea} کا شاندار ${cleanType} برائے فروخت`,
    `${cleanLocation} میں بہترین لوکیشن پر ${cleanArea} کا ${cleanType} دستیاب ہے`,
    `سرمایہ کاری کا سنہری موقع: ${cleanLocation} میں ${cleanArea} کا ${cleanType}`,
    `${cleanLocation} میں جدید سہولیات سے آراستہ ${cleanArea} کا ${cleanType} برائے فروخت`
  ];
  const title = getRandomElement(titleTemplates);

  const seoTitleTemplates = [
    `${cleanLocation} میں ${cleanArea} ${cleanType} برائے فروخت | گلوبل اسٹیٹ`,
    `${cleanLocation} میں ${cleanArea} کا ${cleanType} - بہترین انویسٹمنٹ`,
    `سرمایہ کاری: ${cleanLocation} میں ${cleanArea} کا ${cleanType}`
  ];
  const seoTitle = getRandomElement(seoTitleTemplates);

  const introPhrases = [
    `گلوبل اسٹیٹ اینڈ مارکیٹنگ فخر کے ساتھ ${cleanLocation} میں واقع اس شاندار ${cleanArea} ${cleanType} کو برائے فروخت پیش کرتا ہے۔`,
    `سرمایہ کاری اور رہائش کا ایک بہترین موقع! ${cleanLocation} کے بہترین بلاک میں واقع یہ ${cleanArea} ${cleanType} برائے فروخت دستیاب ہے، جس کی ڈیل سی ای او وقاص احمد چوہدری کی زیرِ نگرانی کی جائے گی۔`,
    `${cleanLocation} کے ترقی یافتہ سیکٹر میں رہائش اختیار کرنے کا سنہری موقع۔ یہ ${cleanArea} ${cleanType} تمام جدید سہولیات کے قریب ترین واقع ہے۔`
  ];

  const middlePhrases = type.toLowerCase().includes("plot")
    ? [
        `یہ پلاٹ آپ کے خوابوں کے گھر کی تعمیر کے لیے یا بہترین منافع بخش سرمایہ کاری کے لیے انتہائی موزوں ہے۔ یہ سیکٹر تیز رفتار ترقی، انڈر گراؤنڈ بجلی، گیس، اور بہترین پانی کی فراہمی جیسی خصوصیات کا حامل ہے۔ یہاں 24 گھنٹے سیکیورٹی پیٹرولنگ کی سہولت دستیاب ہے۔`,
        `سمارٹ سرمایہ کاروں کے لیے ایک بہترین ڈیل۔ یہ پلاٹ کارپٹڈ سڑکوں، خوبصورت پارکوں، گرینڈ مسجد اور کمرشل مارکیٹوں کے قریب واقع ہے، جو مستقبل میں شاندار منافع کی ضمانت دیتا ہے۔`,
        `ڈی ایچ اے کے پوش ایریا میں واقع یہ پلاٹ بہترین لوکیشن پر ہے۔ اس کے آس پاس اسکول، اسپتال اور بڑے شاپنگ مالز واقع ہیں جس سے روزمرہ زندگی کی تمام ضروریات تک آسان رسائی ممکن ہے۔`
      ]
    : [
        `یہ خوبصورت پراپرٹی جدید فن تعمیر کا بہترین نمونہ ہے، جس میں اعلیٰ ترین معیار کا میٹریل استعمال کیا گیا ہے۔ کشادہ کمرے، اٹیچ باتھ رومز، اور خوبصورت فٹنگز کے ساتھ یہ گھر ایک پرسکون اور لگژری طرز زندگی فراہم کرتا ہے۔`,
        `جدید ترین طرزِ زندگی کے تقاضوں کے مطابق تعمیر شدہ یہ عمارت/گھر شاندار کچن، خوبصورت ٹائل فلورنگ اور کشادہ ہال پر مشتمل ہے۔ یہ سوسائٹی کے پرامن اور محفوظ ترین گلی میں واقع ہے۔`,
        `مکمل طور پر ہوادار اور روشن گھر، جہاں ہر کمرے کو خوبصورتی سے ڈیزائن کیا گیا ہے۔ تمام بنیادی ضروریات جیسے بجلی، پانی اور سیکیورٹی کی سہولیات یہاں 24 گھنٹے میسر ہیں۔`
      ];

  const featurePhrase = featureList.length > 0
    ? `اس پراپرٹی کی نمایاں خصوصیات درج ذیل ہیں: ${featureList.join("، ")}۔ یہ خصوصیات اسے دیگر عام پراپرٹیز سے ممتاز بناتی ہیں۔`
    : `یہ پراپرٹی پارک، کمرشل ایریا اور مرکزی شاہراہ کے قریب ترین واقع ہے، جو اسے رہائش اور انویسٹمنٹ دونوں کے لیے موزوں بناتی ہے۔`;

  const outroPhrases = [
    `اس پراپرٹی کی مانگ کی قیمت ${cleanPrice} ہے۔ مزید تفصیلات، سائٹ وزٹ اور محفوظ ترین ڈیل کے لیے گلوبل اسٹیٹ اینڈ مارکیٹنگ کے سی ای او وقاص احمد چوہدری سے ابھی 03000066255 پر رابطہ کریں۔`,
    `سرمایہ کاری کے اس سنہری موقع کو ہاتھ سے نہ جانے دیں! مانگ کی قیمت صرف ${cleanPrice} ہے۔ آج ہی ہمارے نمائندے سے رابطہ کریں اور اپنی خریداری کو یقینی بنائیں۔`,
    `قیمت کا تقاضا ${cleanPrice} ہے، جو کہ اس علاقے کی مارکیٹ ویلیو کے مطابق انتہائی مناسب ہے۔ مزید معلومات کے لیے فوری کال یا واٹس ایپ کریں۔`
  ];

  const description = `${getRandomElement(introPhrases)}\n\n${getRandomElement(middlePhrases)}\n\n${featurePhrase}\n\n${getRandomElement(outroPhrases)}`;

  const metaTemplates = [
    `${cleanLocation} میں ${cleanArea} ${cleanType} برائے فروخت۔ قیمت: ${cleanPrice}۔ رابطہ کریں وقاص احمد چوہدری +92300-0066255۔`,
    `${cleanLocation} میں شاندار ${cleanArea} ${cleanType} دستیاب ہے۔ قیمت: ${cleanPrice}۔ سرمایہ کاری کا بہترین موقع۔ گلوبل اسٹیٹ اینڈ مارکیٹنگ۔`,
    `خریدیں ${cleanArea} ${cleanType}، ${cleanLocation} میں۔ مانگ: ${cleanPrice}۔ پارک اور کمرشل کے قریب۔ فون کریں +92300-0066255۔`
  ];
  let metaDescription = getRandomElement(metaTemplates);
  if (metaDescription.length > 158) {
    metaDescription = metaDescription.substring(0, 155) + "...";
  }

  const keywordsList = [
    `${cleanLocation} میں پلاٹ`,
    `خریدیں ${cleanArea} ${cleanType}`,
    `${cleanLocation} ریل اسٹیٹ`,
    `وقاص احمد چوہدری`,
    `گلوبل اسٹیٹ اینڈ مارکیٹنگ`,
    `پاکستان ریل اسٹیٹ`,
    `پلاٹ برائے فروخت`
  ];
  const keywords = keywordsList.join(", ");

  return {
    title,
    seoTitle,
    description,
    metaDescription,
    keywords
  };
}

export function generatePropertyListing(params: {
  type: string;
  area: string;
  location: string;
  price: string;
  features: string;
  language: "en" | "ur";
}): GeneratedListing {
  const { type, area, location, price, features, language } = params;
  if (language === "ur") {
    return generateUrduListing(type, area, location, price, features);
  }
  return generateEnglishListing(type, area, location, price, features);
}

