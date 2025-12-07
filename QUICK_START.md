# Quick Start Guide

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup

**Step 1:** Run initial table creation:
- Execute all queries from `backend/src/dukaanAppDataTableCreationQueries.sql`

**Step 2:** Add image_url columns:
- Execute queries from `backend/src/migrations/add_image_url_columns.sql`
- Or run these:
```sql
ALTER TABLE Users ADD image_url NVARCHAR(500) NULL;
ALTER TABLE Shops ADD image_url NVARCHAR(500) NULL;
ALTER TABLE Products ADD image_url NVARCHAR(500) NULL;
```

### 3. Environment Configuration

Create `.env` file in `backend` directory:

```env
PORT=3000
NODE_ENV=development

# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=local_market_db
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Azure Blob Storage (Required for image uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=localmarket
```

### 4. Azure Blob Storage Setup (For Images)

1. Create Azure Storage Account in Azure Portal
2. Go to "Access Keys" section
3. Copy "Connection string"
4. Paste in `.env` as `AZURE_STORAGE_CONTAINER_NAME`
5. Container will be created automatically on first upload

### 5. Start Server
```bash
npm run dev
```

Server should start on `http://localhost:3000`

---

## 🧪 Quick Test

### Test 1: Health Check
```
GET http://localhost:3000/
```

### Test 2: Get Guest ID (Important!)
```
GET http://localhost:3000/api/cart
```
**Check Response Headers** → Look for `X-Guest-Id` → Save it!

### Test 3: Browse Categories
```
GET http://localhost:3000/api/categories
```

---

## 📚 Documentation Files

1. **COMPLETE_API_GUIDE.md** - Comprehensive API guide with all examples
2. **API_DOCUMENTATION.md** - Technical API reference
3. **QUICK_START.md** - This file (quick setup guide)

---

## 🔑 Key Points

- **Guest ID:** Automatically generated on first cart request, returned in response header
- **Image Uploads:** Requires Azure Blob Storage configuration
- **Authorization:** Shopkeepers can only manage their own shops/products
- **Cart Merge:** Guest cart automatically merges when user logs in

For detailed API usage, see **COMPLETE_API_GUIDE.md**

