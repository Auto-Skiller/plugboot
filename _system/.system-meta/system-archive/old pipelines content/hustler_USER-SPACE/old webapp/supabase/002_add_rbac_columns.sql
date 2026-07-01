-- Add role and owner_id columns to merchants table

-- Create role enum type
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent', 'viewer');

-- Add columns
ALTER TABLE merchants 
ADD COLUMN role user_role DEFAULT 'admin',
ADD COLUMN owner_id UUID REFERENCES merchants(id);

-- Update RLS policies to handle team access
-- Admins can view/edit everything for their account
-- Team members can view/edit based on owner_id

-- Drop existing policies to recreate them with team logic
DROP POLICY IF EXISTS "Users can view own profile" ON merchants;
DROP POLICY IF EXISTS "Users can update own profile" ON merchants;
DROP POLICY IF EXISTS "Users can manage own products" ON products;
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;

-- New Merchants Policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON merchants FOR SELECT
  USING (auth.uid() = id);

-- 2. Team members can view their owner's profile (basic info for context, maybe restrictive later)
-- For now, let's keep it simple: Team Members usually don't need to see the Owner's full profile, 
-- but they need to see data LINKED to the owner.

-- Let's update other tables to be accessible by team members.
-- Most tables use `merchant_id`.
-- If I am a team member, my `merchant_id` in `orders` etc. will refer to the OWNER.
-- Wait, `merchants` table is Users.
-- When a team member logs in, they are a User in `auth.users` and a row in `merchants`.
-- But the DATA (products, orders) belongs to the OWNER.
-- So `orders.merchant_id` should indicate the OWNER.
-- When a team member creates a product, `product.merchant_id` should be their OWNER's ID.

-- This implies we need a way to resolved "Effective Merchant ID".
-- If `owner_id` is NULL, I am the owner. Effective ID = my ID.
-- If `owner_id` is NOT NULL, I am a team member. Effective ID = `owner_id`.

-- Function to get the effective merchant ID for the current user
CREATE OR REPLACE FUNCTION get_my_merchant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT COALESCE(owner_id, id)
    FROM merchants
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated Policies for Products
CREATE POLICY "Team can view products"
  ON products FOR SELECT
  USING (merchant_id = get_my_merchant_id());

CREATE POLICY "Team can manage products"
  ON products FOR ALL
  USING (merchant_id = get_my_merchant_id());

-- Updated Policies for Orders
CREATE POLICY "Team can view orders"
  ON orders FOR SELECT
  USING (merchant_id = get_my_merchant_id());

CREATE POLICY "Team can manage orders"
  ON orders FOR ALL
  USING (merchant_id = get_my_merchant_id());
