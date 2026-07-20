-- Supabase Database Schema for Add Property Pro System
-- Location: supabase/schema.sql

-- 1. Custom Types & Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_purpose') THEN
    CREATE TYPE property_purpose AS ENUM ('sell', 'rent');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
    CREATE TYPE property_type AS ENUM ('plot', 'house', 'commercial_plot', 'apartment', 'shop', 'office', 'farm_house', 'building');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'possession_status') THEN
    CREATE TYPE possession_status AS ENUM ('possession', 'non-possession');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'furnished_status') THEN
    CREATE TYPE furnished_status AS ENUM ('furnished', 'semi-furnished', 'unfurnished');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'area_unit') THEN
    CREATE TYPE area_unit AS ENUM ('marla', 'kanal', 'sq_ft', 'sq_yd');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_profile') THEN
    CREATE TYPE contact_profile AS ENUM ('owner', 'dealer', 'agency');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_channel') THEN
    CREATE TYPE verification_channel AS ENUM ('sms', 'whatsapp');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;


-- 2. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  purpose property_purpose NOT NULL,
  type property_type NOT NULL,
  
  -- Location Information
  country TEXT NOT NULL DEFAULT 'Pakistan',
  city TEXT NOT NULL,
  society TEXT NOT NULL,
  sector TEXT,
  block TEXT,
  street TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Property Details
  area NUMERIC NOT NULL,
  area_unit area_unit NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  possession possession_status NOT NULL,
  furnished furnished_status,
  is_corner BOOLEAN NOT NULL DEFAULT FALSE,
  is_park_facing BOOLEAN NOT NULL DEFAULT FALSE,
  is_main_boulevard BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Price Information
  price NUMERIC NOT NULL,
  installment_available BOOLEAN NOT NULL DEFAULT FALSE,
  down_payment NUMERIC,
  monthly_installment BOOLEAN NOT NULL DEFAULT FALSE,
  down_payment_amount NUMERIC,
  monthly_installment_amount NUMERIC,
  
  -- Contact Information
  contact_type contact_profile NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  agency_name TEXT,
  
  -- Approval & Metadata
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_approved ON public.properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);


-- 3. Property Media Table
CREATE TABLE IF NOT EXISTS public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'featured', 'gallery', 'video', 'tour_360'
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_property_id ON public.property_media(property_id);


-- 4. Property Verifications Table
CREATE TABLE IF NOT EXISTS public.property_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  channel verification_channel NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_property_id ON public.property_verifications(property_id);


-- 5. Admin Approvals Table
CREATE TABLE IF NOT EXISTS public.admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_approvals_property_id ON public.admin_approvals(property_id);


-- 6. Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 7. Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

-- Properties Policies
-- 1. Anyone can view approved properties
DROP POLICY IF EXISTS select_approved_properties ON public.properties;
CREATE POLICY select_approved_properties 
  ON public.properties 
  FOR SELECT 
  USING (is_approved = TRUE);

-- 2. Property owners can view their own unapproved properties
DROP POLICY IF EXISTS select_own_properties ON public.properties;
CREATE POLICY select_own_properties 
  ON public.properties 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = created_by);

-- 3. Admins can view all properties (simulate using admin role/metadata check)
DROP POLICY IF EXISTS select_all_properties_admin ON public.properties;
CREATE POLICY select_all_properties_admin
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin',
      FALSE
    )
  );

-- 4. Authenticated users can insert properties
DROP POLICY IF EXISTS insert_properties ON public.properties;
CREATE POLICY insert_properties
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 5. Property owners or Admins can update properties
DROP POLICY IF EXISTS update_properties ON public.properties;
CREATE POLICY update_properties
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  )
  WITH CHECK (
    auth.uid() = created_by OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );

-- 6. Property owners or Admins can delete properties
DROP POLICY IF EXISTS delete_properties ON public.properties;
CREATE POLICY delete_properties
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );


-- Property Media Policies
DROP POLICY IF EXISTS select_media_for_approved_or_own ON public.property_media;
CREATE POLICY select_media_for_approved_or_own
  ON public.property_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_media.property_id
        AND (properties.is_approved = TRUE OR properties.created_by = auth.uid())
    ) OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );

DROP POLICY IF EXISTS manage_media_for_own_or_admin ON public.property_media;
CREATE POLICY manage_media_for_own_or_admin
  ON public.property_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_media.property_id
        AND properties.created_by = auth.uid()
    ) OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );


-- Property Verifications Policies
DROP POLICY IF EXISTS manage_verifications_owner_or_admin ON public.property_verifications;
CREATE POLICY manage_verifications_owner_or_admin
  ON public.property_verifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_verifications.property_id
        AND properties.created_by = auth.uid()
    ) OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );


-- Admin Approvals Policies
DROP POLICY IF EXISTS admin_approvals_read_write ON public.admin_approvals;
CREATE POLICY admin_approvals_read_write
  ON public.admin_approvals
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin', FALSE)
  );


-- ==============================================
-- SEED DATA (AUTO-GENERATED)
-- ==============================================


-- Seed Property: 10 Marla Premium Residential Plot - DHA Bahawalpur
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000001',
  '10 Marla Premium Residential Plot - DHA Bahawalpur',
  'An outstanding opportunity to acquire a premium 10 Marla residential plot in the highly sought-after Sector A of DHA Bahawalpur. Situated on a 40ft wide street, this plot offers immediate possession and construction opportunities. Excellent investment potential with rapid development nearby including parks, modern infrastructure, and commercial spaces.',
  'sell',
  'plot',
  'Pakistan',
  'Bahawalpur',
  'DHA Bahawalpur',
  'Sector A',
  NULL,
  NULL,
  NULL,
  NULL,
  10,
  'marla',
  NULL,
  NULL,
  NULL,
  'possession',
  'unfurnished',
  FALSE,
  TRUE,
  FALSE,
  8500000,
  FALSE,
  NULL,
  'dealer',
  'Muhammad Ali',
  '+92300-0066255',
  NULL,
  TRUE,
  450
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;


-- Seed Property: Luxury 1 Kanal Modern Villa - DHA Bahawalpur
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000002',
  'Luxury 1 Kanal Modern Villa - DHA Bahawalpur',
  'An architecturally designed double-story 1 Kanal luxury villa featuring premium finishes, Italian tile flooring, custom woodwork, and import-grade kitchen fittings. Comprises 5 spacious bedrooms with attached wardrobes, custom luxury bathrooms, 2 servant quarters, dual car garage, and a beautifully manicured lawn. Located close to the Main Boulevard.',
  'sell',
  'house',
  'Pakistan',
  'Bahawalpur',
  'DHA Bahawalpur',
  'Sector B',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  'kanal',
  5,
  6,
  NULL,
  'possession',
  'unfurnished',
  TRUE,
  FALSE,
  TRUE,
  38000000,
  FALSE,
  NULL,
  'dealer',
  'Waqas Ahmad Chaudhary',
  '+92300-0066255',
  'Zameen Gem',
  TRUE,
  680
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', 'gallery', 2) ON CONFLICT DO NOTHING;


-- Seed Property: 5 Marla Commercial Plot on Main Boulevard - DHA Bahawalpur
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000003',
  '5 Marla Commercial Plot on Main Boulevard - DHA Bahawalpur',
  'Prime commercial plot located on the Main Boulevard of DHA Bahawalpur Sector C. Perfect for constructing a commercial plaza, retail outlet, or executive office building. High footfall area with excellent visibility and grand parking facilities. Commercial plots in DHA are yielding high rental returns.',
  'sell',
  'commercial_plot',
  'Pakistan',
  'Bahawalpur',
  'DHA Bahawalpur',
  'Sector C',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  'marla',
  NULL,
  NULL,
  NULL,
  'possession',
  'unfurnished',
  FALSE,
  FALSE,
  TRUE,
  18500000,
  TRUE,
  NULL,
  'dealer',
  'Kamran Shah',
  '+92300-0066255',
  NULL,
  TRUE,
  390
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;


-- Seed Property: 1 Kanal Corner Plot on Installment Plan - DHA Multan
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000004',
  '1 Kanal Corner Plot on Installment Plan - DHA Multan',
  'Get a highly lucrative 1 Kanal residential corner plot in Sector H, DHA Multan. This property is available on an attractive 2-year installment plan with only a 25% down payment. Located next to a beautiful green park and community sports club. This is a rare chance to invest in Multan''s premium gated community.',
  'sell',
  'plot',
  'Pakistan',
  'Multan',
  'DHA Multan',
  'Sector H',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  'kanal',
  NULL,
  NULL,
  NULL,
  'non-possession',
  'unfurnished',
  TRUE,
  TRUE,
  FALSE,
  12500000,
  TRUE,
  NULL,
  'dealer',
  'Muhammad Ali',
  '+92300-0066255',
  NULL,
  TRUE,
  280
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;


-- Seed Property: Modern 10 Marla House for Rent - DHA Lahore
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000005',
  'Modern 10 Marla House for Rent - DHA Lahore',
  'Fully furnished modern design 10 Marla double-story house available for rent in DHA Phase 6, Lahore. Features 4 designer bedrooms with attached closets, modern kitchen, stylish dining hall, drawing room, servant room, and secure garage space for two cars. Ideal for executive families.',
  'rent',
  'house',
  'Pakistan',
  'Lahore',
  'DHA Lahore',
  'Phase 6',
  NULL,
  NULL,
  NULL,
  NULL,
  10,
  'marla',
  4,
  5,
  NULL,
  'possession',
  'unfurnished',
  FALSE,
  FALSE,
  FALSE,
  120000,
  FALSE,
  NULL,
  'dealer',
  'Kamran Shah',
  '+92300-0066255',
  NULL,
  TRUE,
  195
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;


-- Seed Property: 1 Kanal Luxury House - Bahria Town Lahore
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000006',
  '1 Kanal Luxury House - Bahria Town Lahore',
  'A stunning Spanish design 1 Kanal house for sale in Sector C, Bahria Town Lahore. Situated in a fully secure and high-profile residential zone. The property includes a large drawing/dining room, double kitchens, fully customized bathrooms with jacuzzi, executive study room, and custom imported woodwork.',
  'sell',
  'house',
  'Pakistan',
  'Bahawalpur',
  'Bahria Town Projects',
  'Sector C',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  'kanal',
  6,
  7,
  NULL,
  'possession',
  'unfurnished',
  FALSE,
  TRUE,
  FALSE,
  65000000,
  FALSE,
  NULL,
  'dealer',
  'Waqas Ahmad Chaudhary',
  '+92300-0066255',
  'Zameen Gem',
  TRUE,
  512
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;


-- Seed Property: 1 Kanal Elite Residential Plot - DHA Islamabad
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000007',
  '1 Kanal Elite Residential Plot - DHA Islamabad',
  'An elite 1 Kanal flat residential plot for sale in Phase 2, DHA Islamabad. It is fully developed and ready for construction. Nestled in a peaceful block with modern roads, security, and a beautiful mountain view backdrop. Highly demanded sector with high resale values.',
  'sell',
  'plot',
  'Pakistan',
  'Islamabad',
  'DHA Islamabad',
  'Phase 2',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  'kanal',
  NULL,
  NULL,
  NULL,
  'possession',
  'unfurnished',
  FALSE,
  FALSE,
  FALSE,
  24000000,
  FALSE,
  NULL,
  'dealer',
  'Kamran Shah',
  '+92300-0066255',
  NULL,
  TRUE,
  320
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;


-- Seed Property: 10 Marla Park-Facing Plot on Easy Installments - DHA Bahawalpur
INSERT INTO public.properties (
  id, title, description, purpose, type, country, city, society, sector, block, street,
  latitude, longitude, area, area_unit, bedrooms, bathrooms, floors, possession, furnished,
  is_corner, is_park_facing, is_main_boulevard, price, installment_available,
  down_payment, contact_type, contact_name, contact_phone, agency_name, is_approved, views_count
) VALUES (
  'a0e0a0a0-0000-0000-0000-000000000008',
  '10 Marla Park-Facing Plot on Easy Installments - DHA Bahawalpur',
  'Incredible opportunity to own a 10 Marla residential plot in DHA Bahawalpur Sector D, facing a lush green community park. Available on a 1.5-year easy installment plan. Development work is moving at an extreme pace, with possession expected soon. Highly recommended for long-term investments.',
  'sell',
  'plot',
  'Pakistan',
  'Bahawalpur',
  'DHA Bahawalpur',
  'Sector D',
  NULL,
  NULL,
  NULL,
  NULL,
  10,
  'marla',
  NULL,
  NULL,
  NULL,
  'non-possession',
  'unfurnished',
  FALSE,
  TRUE,
  FALSE,
  9000000,
  TRUE,
  NULL,
  'dealer',
  'Waqas Ahmad Chaudhary',
  '+92300-0066255',
  'Zameen Gem',
  TRUE,
  489
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'featured', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.property_media (property_id, url, media_type, sort_order) VALUES ('a0e0a0a0-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'gallery', 1) ON CONFLICT DO NOTHING;


-- ==============================================
-- STORAGE BUCKETS SETUP
-- ==============================================

-- Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('properties', 'properties', true),
  ('avatars', 'avatars', true),
  ('agencies', 'agencies', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public reading of files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT 
  USING (bucket_id IN ('properties', 'avatars', 'agencies'));

-- Set up storage policies for authenticated uploading of files
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id IN ('properties', 'avatars', 'agencies'));

