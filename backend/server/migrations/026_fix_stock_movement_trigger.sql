-- Fix log_stock_movement trigger to match actual stock_movements table structure

DROP TRIGGER IF EXISTS trigger_log_stock_movement ON stock;
DROP FUNCTION IF EXISTS log_stock_movement();

-- Create updated function that matches stock_movements table
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.quantity != NEW.quantity THEN
    INSERT INTO stock_movements (
      org_id, product_id, type, quantity, notes
    ) VALUES (
      NEW.org_id, 
      NEW.product_id, 
      CASE 
        WHEN NEW.quantity > OLD.quantity THEN 'stock_in'
        ELSE 'stock_out'
      END,
      ABS(NEW.quantity - OLD.quantity),
      'Stock updated automatically'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_log_stock_movement
AFTER UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION log_stock_movement();
