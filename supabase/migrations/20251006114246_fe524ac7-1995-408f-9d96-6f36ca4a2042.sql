-- Fix search_path security warnings by setting explicit search path on trigger functions

-- Update auto_set_package_sold_status function with search_path
CREATE OR REPLACE FUNCTION auto_set_package_sold_status()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a sponsor is assigned to a package, set status to 'sold-active'
  IF NEW.package_id IS NOT NULL THEN
    UPDATE sponsorship_packages
    SET status = 'sold-active', updated_at = now()
    WHERE id = NEW.package_id
      AND status IN ('live', 'draft'); -- Only auto-transition from live or draft
    
    -- Log the transition
    RAISE NOTICE 'Package % status set to sold-active for sponsor %', NEW.package_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update auto_reset_package_status function with search_path
CREATE OR REPLACE FUNCTION auto_reset_package_status()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a sponsor is deleted or package_id is cleared, reset status to 'live'
  IF OLD.package_id IS NOT NULL THEN
    -- Check if any other sponsors still have this package
    IF NOT EXISTS (
      SELECT 1 FROM sponsors 
      WHERE package_id = OLD.package_id 
        AND id != OLD.id
    ) THEN
      UPDATE sponsorship_packages
      SET status = 'live', updated_at = now()
      WHERE id = OLD.package_id
        AND status = 'sold-active'; -- Only reset if currently sold
      
      -- Log the transition
      RAISE NOTICE 'Package % status reset to live (sponsor % removed)', OLD.package_id, OLD.id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Update auto_update_package_status_on_change function with search_path
CREATE OR REPLACE FUNCTION auto_update_package_status_on_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle when package_id changes
  IF OLD.package_id IS DISTINCT FROM NEW.package_id THEN
    
    -- Reset old package status if no other sponsors have it
    IF OLD.package_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM sponsors 
        WHERE package_id = OLD.package_id 
          AND id != OLD.id
      ) THEN
        UPDATE sponsorship_packages
        SET status = 'live', updated_at = now()
        WHERE id = OLD.package_id
          AND status = 'sold-active';
        
        RAISE NOTICE 'Package % status reset to live', OLD.package_id;
      END IF;
    END IF;
    
    -- Set new package status to sold-active
    IF NEW.package_id IS NOT NULL THEN
      UPDATE sponsorship_packages
      SET status = 'sold-active', updated_at = now()
      WHERE id = NEW.package_id
        AND status IN ('live', 'draft');
      
      RAISE NOTICE 'Package % status set to sold-active', NEW.package_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;