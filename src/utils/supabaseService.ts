import { supabase } from "./supabaseClient";
import { Property } from "@/data/initialProperties";

// Helper to map DB row to frontend Property model
function mapDbRowToProperty(row: any, mediaRows: any[]): Property {
  const images = mediaRows
    .filter((m) => m.property_id === row.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((m) => m.url);
    
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80");
  }

  // Parse area
  const areaValue = Number(row.area || 10);
  const areaUnitLabel = row.area_unit === "kanal" ? "Kanal" : "Marla";

  // Parse premium and hot status
  const rawName = row.contact_name || "";
  const isHot = rawName.includes(" | HOT");
  const isPremium = rawName.includes(" | PRO");
  let cleanName = rawName;
  if (isPremium) cleanName = cleanName.replace(" | PRO", "");
  if (isHot) cleanName = cleanName.replace(" | HOT", "");
  cleanName = cleanName.trim();

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    location: row.society,
    sector: row.sector || "",
    type: mapDbTypeToPropertyType(row.type),
    size: `${areaValue} ${areaUnitLabel}`,
    bedrooms: row.bedrooms || undefined,
    bathrooms: row.bathrooms || undefined,
    floors: row.floors || undefined,
    furnishedStatus: mapDbFurnishedToStatus(row.furnished),
    description: row.description,
    images: images,
    agent: {
      name: cleanName,
      phone: row.contact_phone,
      whatsapp: row.contact_phone.replace(/[^0-9]/g, ""),
      image: cleanName.toLowerCase().includes("waqas")
        ? "/images/waqas_ceo.png"
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=c5a85c&color=fff`,
      experience: row.contact_type === "owner" ? "Private Submitter" : isPremium ? "Premium Partner" : "Certified Partner"
    },
    amenities: [
      ...(row.is_corner ? ["Corner Plot"] : []),
      ...(row.is_park_facing ? ["Park Facing"] : []),
      ...(row.is_main_boulevard ? ["Main Boulevard Facing"] : [])
    ],
    purpose: mapDbPurposeToPurpose(row.purpose),
    isFeatured: Number(row.views_count) > 400 || isPremium,
    isPremium: isPremium,
    isHot: isHot,
    isCorner: row.is_corner,
    isParkFacing: row.is_park_facing,
    isMainBoulevard: row.is_main_boulevard,
    possessionStatus: row.possession === "possession" ? "Possession" : "Non-Possession",
    installmentAvailable: row.installment_available,
    installmentDetails: row.installment_available ? {
      downPayment: Number(row.down_payment || 0),
      monthlyInstallment: Number(row.monthly_installment_amount || 0),
      durationMonths: 24
    } : undefined,
    contactDetails: {
      type: mapDbContactType(row.contact_type),
      name: cleanName,
      phone: row.contact_phone,
      agencyName: row.agency_name || undefined
    },
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isApproved: row.is_approved,
    roiPotential: row.purpose === "sell" ? "9.5%" : "4.8%",
    nearby: {
      schools: "DHA School System (3 mins)",
      hospitals: "Medical Complex (5 mins)",
      mosques: "Sector Mosque (2 mins)",
      markets: "Commercial Market (3 mins)"
    },
    viewsCount: row.views_count || 0
  };
}

// Helpers for mappings
function mapDbTypeToPropertyType(type: string): Property["type"] {
  if (type === "plot") return "Residential Plot";
  if (type === "commercial_plot") return "Commercial Plot";
  if (type === "house") return "House";
  if (type === "apartment") return "Apartment";
  if (type === "shop") return "Shop";
  if (type === "office") return "Office";
  if (type === "farm_house") return "Farm House";
  if (type === "building") return "Building";
  return "Plot";
}

function mapDbFurnishedToStatus(f: string): Property["furnishedStatus"] {
  if (f === "furnished") return "Furnished";
  if (f === "semi-furnished") return "Semi-Furnished";
  return "Unfurnished";
}

function mapDbPurposeToPurpose(p: string): Property["purpose"] {
  if (p === "sell") return "Buy";
  if (p === "rent") return "Rent";
  return "Buy";
}

function mapDbContactType(t: string): "Owner" | "Dealer" | "Agency" {
  if (t === "owner") return "Owner";
  if (t === "agency") return "Agency";
  return "Dealer";
}

export async function getProperties(): Promise<Property[]> {
  try {
    const { data: props, error: propsErr } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (propsErr) throw propsErr;
    if (!props || props.length === 0) return [];

    const { data: media, error: mediaErr } = await supabase
      .from("property_media")
      .select("*");

    if (mediaErr) throw mediaErr;

    return props.map((p) => mapDbRowToProperty(p, media || []));
  } catch (err) {
    console.warn("Error loading properties from Supabase:", err);
    throw err;
  }
}

export async function insertSupabaseProperty(p: Omit<Property, "id" | "viewsCount">): Promise<void> {
  try {
    // Parse size value and unit
    const sizeParts = p.size.split(" ");
    const areaValue = Number(sizeParts[0]) || 10;
    const areaUnitValue = sizeParts[1]?.toLowerCase() === "kanal" ? "kanal" : "marla";

    const contactType = p.contactDetails ? p.contactDetails.type.toLowerCase() : "dealer";
    let contactName = p.contactDetails ? p.contactDetails.name : p.agent.name;
    if (p.isPremium) {
      contactName = contactName + " | PRO";
    }
    if (p.isHot) {
      contactName = contactName + " | HOT";
    }
    const contactPhone = p.contactDetails ? p.contactDetails.phone : p.agent.phone;
    const agencyName = p.contactDetails ? p.contactDetails.agencyName : undefined;

    const { data: authData } = await supabase.auth.getUser();

    const row: any = {
      title: p.title,
      description: p.description,
      purpose: p.purpose === "Buy" ? "sell" : "rent",
      type: p.type.includes("Plot") ? "plot" : p.type.includes("Villa") || p.type.includes("House") ? "house" : "plot",
      city: p.location.includes("Multan") ? "Multan" : p.location.includes("Lahore") ? "Lahore" : "Bahawalpur",
      society: p.location,
      sector: p.sector || null,
      area: areaValue,
      area_unit: areaUnitValue,
      bedrooms: p.bedrooms || null,
      bathrooms: p.bathrooms || null,
      floors: p.floors || null,
      possession: p.possessionStatus.toLowerCase() === "possession" ? "possession" : "non-possession",
      furnished: p.furnishedStatus?.toLowerCase() || "unfurnished",
      is_corner: p.isCorner,
      is_park_facing: p.isParkFacing,
      is_main_boulevard: p.isMainBoulevard,
      price: p.price,
      installment_available: p.installmentAvailable,
      down_payment: p.installmentDetails?.downPayment || null,
      contact_type: contactType,
      contact_name: contactName,
      contact_phone: contactPhone,
      agency_name: agencyName || null,
      is_approved: true // Auto-approved on upload
    };

    if (authData?.user) {
      row.created_by = authData.user.id;
    }

    const { data: newProp, error: insertErr } = await supabase
      .from("properties")
      .insert([row])
      .select()
      .single();

    if (insertErr) {
      console.error("Insert error details:", insertErr);
      throw insertErr;
    }

    // Insert media links
    if (newProp && p.images && p.images.length > 0) {
      const mediaRows = p.images.map((url, idx) => ({
        property_id: newProp.id,
        url: url,
        media_type: idx === 0 ? "featured" : "gallery",
        sort_order: idx
      }));

      const { error: mediaErr } = await supabase
        .from("property_media")
        .insert(mediaRows);

      if (mediaErr) throw mediaErr;
    }
  } catch (err) {
    console.error("Error inserting property into Supabase:", err);
    throw err;
  }
}

/**
 * Uploads a file (Blob) to the "properties" Supabase bucket and returns the public URL.
 */
export async function uploadPropertyMedia(file: Blob, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("properties")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading image to Supabase Storage:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("properties")
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

export interface UserRegistrationRecord {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company_name?: string;
  cnic?: string;
  ntn?: string;
  status?: "Pending" | "Active" | "Rejected" | "Suspended";
  created_at?: string;
}

/**
 * Inserts or updates a user registration request in Supabase Cloud DB.
 */
export async function insertUserRegistration(userData: UserRegistrationRecord): Promise<void> {
  try {
    const { error } = await supabase.from("user_registrations").upsert(
      [
        {
          name: userData.name,
          email: userData.email.toLowerCase(),
          phone: userData.phone || null,
          role: userData.role,
          company_name: userData.company_name || null,
          cnic: userData.cnic || null,
          ntn: userData.ntn || null,
          status: userData.status || "Pending",
        },
      ],
      { onConflict: "email" }
    );
    if (error) {
      console.warn("Supabase user_registrations insert error:", error);
    }
  } catch (err) {
    console.warn("Supabase user_registrations insert exception:", err);
  }
}

/**
 * Fetches all user registrations from Supabase Cloud DB.
 */
export async function getUserRegistrations(): Promise<UserRegistrationRecord[]> {
  try {
    const { data, error } = await supabase
      .from("user_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase user_registrations fetch error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase user_registrations fetch exception:", err);
    return [];
  }
}

/**
 * Updates a user registration status in Supabase Cloud DB.
 */
export async function updateUserRegistrationStatus(email: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_registrations")
      .update({ status: status })
      .eq("email", email.toLowerCase());

    if (error) {
      console.warn("Supabase user_registrations status update error:", error);
    }
  } catch (err) {
    console.warn("Supabase user_registrations status update exception:", err);
  }
}

