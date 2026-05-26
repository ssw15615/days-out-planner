Firebase setup — steps to finish

1) Install Firebase CLI (if you haven't already):

```bash
npm install -g firebase-tools
```

2) Login to Firebase from your terminal:

```bash
firebase login
```

3) Create a Firebase project in the Firebase console: https://console.firebase.google.com/
   - Enable Firestore (in Native mode) in the project

4) Update `.firebaserc` to set your project id:

Replace `YOUR_FIREBASE_PROJECT_ID` with your actual project id.

5) Update `.env.local` with the values from Project Settings → General → Your apps → Firebase SDK snippet (Config)
   - Fill `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`

6) Initialize hosting and Firestore rules/indexes locally (optional interactive):

```bash
cd days-out-planner
firebase init
# Select `Hosting` and `Firestore` when prompted
# Point hosting public directory to `build` and set single-page app rewrites
# Use existing `firestore.rules` and `firestore.indexes.json` files
```

7) Build and serve locally:

```bash
npm run build
firebase serve --only hosting
# or run the local dev server
npm start
```

8) Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

Notes:
- The repo already includes a basic `firestore.rules` and `firebase.json` configured for a single-page React app.
- You must supply real Firebase credentials via `.env.local` for the app to connect to Firebase.
- If you want local emulation of Firestore/auth, run `firebase init emulators` and `firebase emulators:start`.
