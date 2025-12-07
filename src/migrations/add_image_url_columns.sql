-- Migration: Add image_url columns for Users, Shops, and Products
-- Run these queries on your database to add image storage support

-- Add image_url column to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'image_url')
BEGIN
    ALTER TABLE Users ADD image_url NVARCHAR(500) NULL;
END
GO

-- Add image_url column to Shops table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Shops') AND name = 'image_url')
BEGIN
    ALTER TABLE Shops ADD image_url NVARCHAR(500) NULL;
END
GO

-- Add image_url column to Products table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Products') AND name = 'image_url')
BEGIN
    ALTER TABLE Products ADD image_url NVARCHAR(500) NULL;
END
GO

-- Optional: Add multiple images support for products (if needed in future)
-- CREATE TABLE ProductImages (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     product_id INT NOT NULL,
--     image_url NVARCHAR(500) NOT NULL,
--     display_order INT NOT NULL DEFAULT 0,
--     created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
--     FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
-- );

