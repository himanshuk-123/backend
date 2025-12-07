CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY, 
    name NVARCHAR(255) NOT NULL,
    phone_number NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    
    -- Soft Delete Fields
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    
    -- Soft Delete Fields
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
CREATE TABLE Carts (
    cart_id INT IDENTITY(1,1) PRIMARY KEY,
    
    user_id INT NULL,                      -- Kaunsa user (unique for Auth user)
    guest_id NVARCHAR(50) NULL UNIQUE,     -- Kaunsa guest (unique for Guest)
    
    -- Status aur Timestamps sirf yahaan honge (1 row)
    is_active BIT NOT NULL DEFAULT 1,      -- Cart active hai ya order mein convert ho gaya
    
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE CartItems (
    item_id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Link to the main Carts table
    cart_id INT NOT NULL,
    
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    
    -- Timestamps
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (cart_id) REFERENCES Carts(cart_id) ON DELETE CASCADE, -- Agar cart delete, toh items bhi delete
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    
    -- Constraint: Ek cart mein ek product sirf ek baar
    UNIQUE (cart_id, product_id)
);


CREATE TABLE Shops (
    shop_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category NVARCHAR(100) NOT NULL,
    
    address NVARCHAR(500) NOT NULL,
    pincode NVARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    
    is_active BIT NOT NULL DEFAULT 0,
    
    -- Soft Delete Fields
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraint (CASCADE REMOVED)
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

CREATE TABLE Inventory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    product_id INT NOT NULL,
    
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price >= 0),
    
    -- Soft Delete Fields
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,

    -- Constraints
    FOREIGN KEY (shop_id) REFERENCES Shops(shop_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    UNIQUE (shop_id, product_id) 
);