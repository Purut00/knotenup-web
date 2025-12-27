# KnotenUp - Outdoor Community Platform

## 🚀 Overview
KnotenUp is a specialized social platform for outdoor enthusiasts (Hikers, Campers) in Malaysia. It connects users with trips, spots, and services.

**Tech Stack:**
- **Frontend:** Vue 3, Vite, Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Storage, Functions)
- **Maps:** Leaflet.js
- **AI:** Google Gemini (Support Bot)

---

## 🛠️ Setup (Local Development)

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd knotenup-web
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase config keys.

3. **Run Dev Server**
   ```bash
   npm run dev
   ```

---

## 🔒 Production Security (Strict)

This project is hardened for production:
1. **Firestore Rules**: Strict owner-only access for sensitive data (`private_data` subcollection). No wildcards.
2. **Storage Rules**: Users are isolated to `/uploads/{uid}/`. File types restricted to Images/GPX. Max size 5MB.
3. **Cloud Functions**:
   - `checkForumPost`: Filters spam & sanitizes HTML (XSS prevention).
   - Rate Limiting: Max 3 posts/minute per user.

---

## 📦 Deployment

**Build & Deploy:**
```bash
# 1. Build Frontend
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy
```

---

## ⚠️ Critical Notes for Developers
- **Environment**: Never commit `.env` files containing real secrets.
- **XSS**: Do not use `v-html` unless absolutely necessary and sanitized.
- **Errors**: A Global Error Handler (`src/plugins/globalErrorHandler.ts`) catches unhandled exceptions.
