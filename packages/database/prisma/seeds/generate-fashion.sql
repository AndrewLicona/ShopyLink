-- Script to generate 450 products for 3 stores
-- Run this script using Supabase SQL Editor or similar

-- Fashion Store (Andrew): 100 products
-- Category IDs need to be fetched first, but this shows the structure

DO $$
DECLARE
    fashion_store_id TEXT := '691125d9-8977-4791-b334-0de9e088782e';
    electronics_store_id TEXT := 'b99e3b3f-cab5-44ea-9e16-ba103440bd4f';
    food_store_id TEXT := 'c9480512-c029-4670-a216-dce5e4fd71d7';
    
    cat_camisetas TEXT;
    cat_pantalones TEXT;
    cat_zapatos TEXT;
    cat_accesorios TEXT;
    
    i INTEGER;
    product_id TEXT;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_camisetas FROM "Category" WHERE "storeId" = fashion_store_id AND slug = 'camisetas';
    SELECT id INTO cat_pantalones FROM "Category" WHERE "storeId" = fashion_store_id AND slug = 'pantalones';
    SELECT id INTO cat_zapatos FROM "Category" WHERE "storeId" = fashion_store_id AND slug = 'zapatos';
    SELECT id INTO cat_accesorios FROM "Category" WHERE "storeId" = fashion_store_id AND slug = 'accesorios';
    
    -- Insert 25 products per category for Fashion Store (100 total)
    FOR i IN 1..25 LOOP
        -- Camisetas
        product_id := gen_random_uuid();
        INSERT INTO "Product" ("id", "name", "description", "price", "discountPrice", "sku", "categoryId", "storeId", "images", "isActive", "trackInventory", "createdAt", "updatedAt")
        VALUES (
            product_id,
            'Camiseta Modelo ' || i,
            'Camiseta de alta calidad con diseño moderno y cómodo',
            20000 + (i * 1000),
            CASE WHEN i % 3 = 0 THEN (20000 + (i * 1000)) * 0.85 ELSE NULL END,
            'CAM-MOD-' || LPAD(i::text, 3, '0'),
            cat_camisetas,
            fashion_store_id,
            ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
            true,
            true,
            NOW(),
            NOW()
        );
        INSERT INTO "Inventory" ("id", "stock", "productId") VALUES (gen_random_uuid(), 20 + (i * 2), product_id);
        
        -- Pantalones
        product_id := gen_random_uuid();
        INSERT INTO "Product" ("id", "name", "description", "price", "discountPrice", "sku", "categoryId", "storeId", "images", "isActive", "trackInventory", "createdAt", "updatedAt")
        VALUES (
            product_id,
            'Pantalón Estilo ' || i,
            'Pantalón versátil para cualquier ocasión',
            50000 + (i * 2000),
            CASE WHEN i % 4 = 0 THEN (50000 + (i * 2000)) * 0.80 ELSE NULL END,
            'PAN-EST-' || LPAD(i::text, 3, '0'),
            cat_pantalones,
            fashion_store_id,
            ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
            true,
            true,
            NOW(),
            NOW()
        );
        INSERT INTO "Inventory" ("id", "stock", "productId") VALUES (gen_random_uuid(), 15 + (i * 2), product_id);
        
        -- Zapatos
        product_id := gen_random_uuid();
        INSERT INTO "Product" ("id", "name", "description", "price", "discountPrice", "sku", "categoryId", "storeId", "images", "isActive", "trackInventory", "createdAt", "updatedAt")
        VALUES (
            product_id,
            'Zapato Diseño ' || i,
            'Calzado de excelente calidad y diseño',
            80000 + (i * 3000),
            CASE WHEN i % 5 = 0 THEN (80000 + (i * 3000)) * 0.75 ELSE NULL END,
            'ZAP-DIS-' || LPAD(i::text, 3, '0'),
            cat_zapatos,
            fashion_store_id,
            ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
            true,
            true,
            NOW(),
            NOW()
        );
        INSERT INTO "Inventory" ("id", "stock", "productId") VALUES (gen_random_uuid(), 10 + i, product_id);
        
        -- Accesorios
        product_id := gen_random_uuid();
        INSERT INTO "Product" ("id", "name", "description", "price", "discountPrice", "sku", "categoryId", "storeId", "images", "isActive", "trackInventory", "createdAt", "updatedAt")
        VALUES (
            product_id,
            'Accesorio Premium ' || i,
            'Complemento perfecto para tu outfit',
            30000 + (i * 1500),
            CASE WHEN i % 3 = 0 THEN (30000 + (i * 1500)) * 0.85 ELSE NULL END,
            'ACC-PREM-' || LPAD(i::text, 3, '0'),
            cat_accesorios,
            fashion_store_id,
            ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500'],
            true,
            true,
            NOW(),
            NOW()
        );
        INSERT INTO "Inventory" ("id", "stock", "productId") VALUES (gen_random_uuid(), 30 + (i * 3), product_id);
    END LOOP;
    
    RAISE NOTICE 'Fashion store seeded with 100 products';
END $$;
