# Feature Addition: Bulk Uploads & Store Photos

## Goal
Enable System Administrators to bulk import users and stores using CSV files, and allow the addition of a store photo when creating a single store.

## Proposed Changes

### 1. Database Updates
- **`backend/database.sql`**: We need to modify the schema to include `photo_url` for stores. 
- During execution, I will run an `ALTER TABLE stores ADD COLUMN photo_url VARCHAR(255);` query so we don't have to delete your existing data.

### 2. Backend Infrastructure (File Uploads)
- **Install `multer`**: We will add the `multer` package to the backend to handle image file uploads.
- **Static File Serving**: Update `backend/src/server.js` to serve a new `uploads/` folder so the frontend can display the images.
- **Store Creation API**: Update `POST /api/stores` in `storeController.js` and `storeRoutes.js` to accept `multipart/form-data` (images) alongside the text data.

### 3. Backend APIs (Bulk Uploads)
- **`POST /api/users/bulk`**: A new endpoint that accepts an array of user objects and inserts them all into the database using a transaction or a loop.
- **`POST /api/stores/bulk`**: A new endpoint that accepts an array of store objects and inserts them.

### 4. Frontend UI
- **CSV Parsing**: We will use standard JavaScript `FileReader` on the frontend. When the Admin uploads a CSV, the frontend will read it, convert it to JSON, and send it to the new `/bulk` endpoints.
- **Manage Users & Stores Pages**: Add a "Upload CSV" button next to the "Add New" button on both pages.
- **Store Modal Update**: Modify the "Add New Store" modal to include an Image Upload field (`<input type="file" />`) and change the Axios request to send `FormData`.
- **Store Table Update**: Add a small thumbnail column to the Stores table to show the uploaded photo.

## Open Questions
- For the CSV format, I will assume a standard header structure (e.g., `name,email,address,password,role` for users). Does that work for you?
