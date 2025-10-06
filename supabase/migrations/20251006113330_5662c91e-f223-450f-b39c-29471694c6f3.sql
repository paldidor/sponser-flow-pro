-- Create function to automatically set package status to 'sold-active' when sponsor assigned
CREATE OR REPLACE FUNCTION auto_set_package_sold_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset package status when sponsor removed
CREATE OR REPLACE FUNCTION auto_reset_package_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle package_id updates on sponsors
CREATE OR REPLACE FUNCTION auto_update_package_status_on_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sponsor INSERT
CREATE TRIGGER trigger_set_package_sold_on_sponsor_insert
  AFTER INSERT ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_package_sold_status();

-- Create trigger for sponsor DELETE
CREATE TRIGGER trigger_reset_package_status_on_sponsor_delete
  AFTER DELETE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION auto_reset_package_status();

-- Create trigger for sponsor UPDATE (package_id change)
CREATE TRIGGER trigger_update_package_status_on_sponsor_update
  AFTER UPDATE OF package_id ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_package_status_on_change();

-- Add comment for documentation
COMMENT ON FUNCTION auto_set_package_sold_status() IS 'Automatically sets package status to sold-active when a sponsor is assigned';
COMMENT ON FUNCTION auto_reset_package_status() IS 'Automatically resets package status to live when sponsor is removed';
COMMENT ON FUNCTION auto_update_package_status_on_change() IS 'Handles package status transitions when sponsor package_id is updated';