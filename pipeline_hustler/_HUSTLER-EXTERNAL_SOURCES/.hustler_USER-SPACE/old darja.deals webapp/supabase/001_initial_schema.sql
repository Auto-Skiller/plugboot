-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Location & Logistics
CREATE TABLE wilayas (
    id INTEGER PRIMARY KEY, -- 1-58
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    zone_code TEXT,
    delivery_base_rate DECIMAL(10, 2) DEFAULT 0
);

CREATE TABLE communes (
    id SERIAL PRIMARY KEY,
    wilaya_id INTEGER REFERENCES wilayas(id),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    is_stopdesk_available BOOLEAN DEFAULT FALSE
);

CREATE TABLE delivery_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'Yalidine', 'Maystro', 'NordEst'
    api_config JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Commerce & Orders (The "Trust" Layer)
CREATE TYPE subscription_tier AS ENUM ('free', 'tajer', 'imbrator');
CREATE TYPE legal_status AS ENUM ('individual', 'auto_entrepreneur', 'sarl');

CREATE TABLE merchants (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    store_name TEXT,
    phone_number TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    legal_status legal_status DEFAULT 'individual',
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE confirmation_status AS ENUM ('pending', 'sms_sent', 'call_center_processing', 'confirmed', 'cancelled', 'no_answer');
CREATE TYPE delivery_status AS ENUM ('ready_to_ship', 'in_transit', 'delivered', 'returned', 'payment_received');
CREATE TYPE payment_method AS ENUM ('cod', 'baridimob_transfer');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    image_url TEXT,
    
    -- Localized Logic
    wilaya_id INTEGER REFERENCES wilayas(id),
    commune_id INTEGER REFERENCES communes(id),
    
    -- AI & Pricing
    ai_context TEXT,
    smart_pricing_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    wilaya_id INTEGER REFERENCES wilayas(id),
    commune_id INTEGER REFERENCES communes(id),
    
    -- Statuses
    confirmation_status confirmation_status DEFAULT 'pending',
    delivery_status delivery_status DEFAULT 'ready_to_ship',
    order_confidence INTEGER DEFAULT 0, -- 0-10
    
    payment_method payment_method DEFAULT 'cod',
    tracking_number TEXT,
    items JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE event_type AS ENUM ('voice_call_attempt', 'whatsapp_gps_received', 'status_change');

CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    event_type event_type NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Finance (Wallet System)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    balance DECIMAL(10, 2) DEFAULT 0,
    ad_spend_credits DECIMAL(10, 2) DEFAULT 0,
    settings_flags JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE credit_action_type AS ENUM ('generate_product', 'generate_ad', 'top_up', 'ad_spend');

CREATE TABLE credits_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(10, 2) NOT NULL,
    action_type credit_action_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE topup_status AS ENUM ('pending_review', 'approved', 'rejected');

CREATE TABLE topup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    amount_dzd DECIMAL(10, 2) NOT NULL,
    proof_image_url TEXT,
    status topup_status DEFAULT 'pending_review',
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Social & Agency
CREATE TABLE agency_ad_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL, -- 'facebook', 'tiktok'
    account_id TEXT NOT NULL,
    assigned_merchant_id UUID REFERENCES merchants(id),
    service_fee_percentage DECIMAL(5, 2) DEFAULT 10.0,
    status TEXT DEFAULT 'active'
);

CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    media_type TEXT, -- 'video', 'slideshow', 'image'
    dialect TEXT, -- 'darija_algiers', etc.
    sentiment_score DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
