import { supabase } from "./supabaseClient";
import { Property } from "@/data/initialProperties";

type DbRecord = Record<string, unknown>;

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asBoolean = (value: unknown): boolean => value === true;

// Helper to map DB row to frontend Property model
function mapDbRowToProperty(row: DbRecord, mediaRows: DbRecord[]): Property {
  const rowId = asString(row.id);
  const contactPhone = asString(row.contact_phone);
  const viewsCount = asNumber(row.views_count);
  const images = mediaRows
    .filter((m) => asString(m.property_id) === rowId)
    .sort((a, b) => asNumber(a.sort_order) - asNumber(b.sort_order))
    .map((m) => asString(m.url));
    
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80");
  }

  // Parse area
  const areaValue = asNumber(row.area, 10);
  const areaUnitLabel = row.area_unit === "kanal" ? "Kanal" : "Marla";

  // Parse premium and hot status
  const rawName = asString(row.contact_name);
  const isHot = rawName.includes(" | HOT");
  const isPremium = rawName.includes(" | PRO");
  let cleanName = rawName;
  if (isPremium) cleanName = cleanName.replace(" | PRO", "");
  if (isHot) cleanName = cleanName.replace(" | HOT", "");
  cleanName = cleanName.trim();

  return {
    id: rowId,
    title: asString(row.title),
    price: asNumber(row.price),
    location: asString(row.society),
    sector: asString(row.sector),
    type: mapDbTypeToPropertyType(asString(row.type)),
    size: `${areaValue} ${areaUnitLabel}`,
    bedrooms: row.bedrooms ? asNumber(row.bedrooms) : undefined,
    bathrooms: row.bathrooms ? asNumber(row.bathrooms) : undefined,
    floors: row.floors ? asNumber(row.floors) : undefined,
    furnishedStatus: mapDbFurnishedToStatus(asString(row.furnished)),
    description: asString(row.description),
    images: images,
    agent: {
      name: cleanName,
      phone: contactPhone,
      whatsapp: contactPhone.replace(/[^0-9]/g, ""),
      image: cleanName.toLowerCase().includes("waqas")
        ? "/images/waqas_ceo.png"
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=c5a85c&color=fff`,
      experience: row.contact_type === "owner" ? "Private Submitter" : isPremium ? "Premium Partner" : "Certified Partner"
    },
    amenities: [
      ...(asBoolean(row.is_corner) ? ["Corner Plot"] : []),
      ...(asBoolean(row.is_park_facing) ? ["Park Facing"] : []),
      ...(asBoolean(row.is_main_boulevard) ? ["Main Boulevard Facing"] : [])
    ],
    purpose: mapDbPurposeToPurpose(asString(row.purpose)),
    isFeatured: viewsCount > 400 || isPremium,
    isPremium: isPremium,
    isHot: isHot,
    isSuspended: asBoolean(row.is_suspended),
    isCorner: asBoolean(row.is_corner),
    isParkFacing: asBoolean(row.is_park_facing),
    isMainBoulevard: asBoolean(row.is_main_boulevard),
    possessionStatus: row.possession === "possession" ? "Possession" : "Non-Possession",
    installmentAvailable: asBoolean(row.installment_available),
    installmentDetails: asBoolean(row.installment_available) ? {
      downPayment: asNumber(row.down_payment),
      monthlyInstallment: asNumber(row.monthly_installment_amount),
      durationMonths: 24
    } : undefined,
    contactDetails: {
      type: mapDbContactType(asString(row.contact_type)),
      name: cleanName,
      phone: contactPhone,
      agencyName: row.agency_name ? asString(row.agency_name) : undefined
    },
    createdAt: row.created_at ? new Date(asString(row.created_at)).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isApproved: asBoolean(row.is_approved),
    roiPotential: row.purpose === "sell" ? "9.5%" : "4.8%",
    nearby: {
      schools: "DHA School System (3 mins)",
      hospitals: "Medical Complex (5 mins)",
      mosques: "Sector Mosque (2 mins)",
      markets: "Commercial Market (3 mins)"
    },
    viewsCount
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

    const row: DbRecord = {
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
  try {
    const { error } = await supabase.storage
      .from("properties")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.warn("Supabase storage upload notice:", error.message);
      return "";
    }

    const { data: publicUrlData } = supabase.storage
      .from("properties")
      .getPublicUrl(path);

    return publicUrlData?.publicUrl || "";
  } catch (err) {
    console.warn("Storage upload exception handled:", err);
    return "";
  }
}

/**
 * Permanently deletes a property and its media from Supabase Cloud DB.
 */
export async function deleteSupabaseProperty(propertyId: string): Promise<void> {
  try {
    if (!propertyId) return;

    // Delete associated media records first
    await supabase.from("property_media").delete().eq("property_id", propertyId);

    // Delete property record
    const { error } = await supabase.from("properties").delete().eq("id", propertyId);
    if (error) {
      console.warn("Supabase property delete notice:", error.message);
    }
  } catch (err) {
    console.warn("Supabase property delete exception:", err);
  }
}

/**
 * Updates suspended status of a property in Supabase Cloud DB.
 */
export async function updateSupabasePropertySuspended(propertyId: string, isSuspended: boolean): Promise<void> {
  try {
    if (!propertyId) return;

    const { error } = await supabase
      .from("properties")
      .update({ is_suspended: isSuspended })
      .eq("id", propertyId);

    if (error) {
      console.warn("Supabase property suspend notice:", error.message);
    }
  } catch (err) {
    console.warn("Supabase property suspend exception:", err);
  }
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

/**
 * Increments the views count for a property in Supabase Cloud DB.
 */
export async function incrementPropertyViews(propertyId: string): Promise<void> {
  try {
    if (!propertyId || propertyId.startsWith("prop-")) return;

    const { data: currentProp } = await supabase
      .from("properties")
      .select("views_count")
      .eq("id", propertyId)
      .single();

    if (currentProp) {
      const newCount = (currentProp.views_count || 0) + 1;
      await supabase
        .from("properties")
        .update({ views_count: newCount })
        .eq("id", propertyId);
    }
  } catch (err) {
    console.warn("Supabase property views_count increment error:", err);
  }
}

