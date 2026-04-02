-- Complete Inventory Management System
-- Add missing tables: products, employee_product_assignments, stock_adjustments

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'piece',
  unit_price NUMERIC(10,2) DEFAULT 0,
  cost_price NUMERIC(10,2) DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  barcode VARCHAR(100),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EMPLOYEE PRODUCT ASSIGNMENTS ====================
CREATE TABLE IF NOT EXISTS employee_product_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  status VARCHAR(50) DEFAULT 'assigned',
  condition_at_assignment VARCHAR(100),
  condition_at_return VARCHAR(100),
  notes TEXT,
  assigned_by UUID,
  returned_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== STOCK ADJUSTMENTS ====================
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_adjusted INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  reference_number VARCHAR(100),
  adjusted_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_products_org ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE INDEX IF NOT EXISTS idx_employee_assignments_org ON employee_product_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_employee ON employee_product_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_product ON employee_product_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_status ON employee_product_assignments(status);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_org ON stock_adjustments(org_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_warehouse ON stock_adjustments(warehouse_id);

-- ==================== TRIGGERS ====================

-- Update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_timestamp ON products;
CREATE TRIGGER trigger_update_product_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_product_timestamp();

-- Auto-create stock entry when product is created
CREATE OR REPLACE FUNCTION create_initial_stock()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stock (org_id, product_id, warehouse_id, quantity, reserved_quantity)
  SELECT NEW.org_id, NEW.id, w.id, 0, 0
  FROM warehouses w
  WHERE w.org_id = NEW.org_id
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_initial_stock ON products;
CREATE TRIGGER trigger_create_initial_stock
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION create_initial_stock();

-- Log stock movements
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.quantity != NEW.quantity THEN
    INSERT INTO stock_movements (
      org_id, product_id, warehouse_id, movement_type, quantity, reason
    ) VALUES (
      NEW.org_id, 
      NEW.product_id, 
      NEW.warehouse_id,
      CASE 
        WHEN NEW.quantity > OLD.quantity THEN 'stock_in'
        ELSE 'stock_out'
      END,
      ABS(NEW.quantity - OLD.quantity),
      'Stock updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_stock_movement ON stock;
CREATE TRIGGER trigger_log_stock_movement
AFTER UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION log_stock_movement();
