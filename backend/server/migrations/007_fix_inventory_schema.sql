-- Fix Inventory Schema Issues
-- Date: 2026-03-31

DO $$ 
BEGIN
  -- Add missing foreign key constraints
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_stock_product') THEN
    ALTER TABLE stock ADD CONSTRAINT fk_stock_product 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_stock_warehouse') THEN
    ALTER TABLE stock ADD CONSTRAINT fk_stock_warehouse 
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
  END IF;

  -- Add inventory valuation fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='valuation_method') THEN
    ALTER TABLE products ADD COLUMN valuation_method VARCHAR(20) DEFAULT 'FIFO';
  END IF;

  -- Add batch tracking support
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='product_batches') THEN
    CREATE TABLE product_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      batch_number VARCHAR(100) NOT NULL,
      expiration_date DATE,
      quantity INTEGER DEFAULT 0,
      cost_per_unit DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_product_batches_org ON product_batches(org_id);
    CREATE INDEX idx_product_batches_product ON product_batches(product_id);
  END IF;

END $$;