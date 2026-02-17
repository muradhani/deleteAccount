# Delete Account Page

A simple, responsive delete-account confirmation page built with HTML, CSS, and JavaScript.

## Firebase delete-account integration

This page now calls Firebase Authentication `deleteUser()` from the browser.

### 1) Add your Firebase config

Edit `script.js` and replace:

- `YOUR_API_KEY`
- `YOUR_PROJECT.firebaseapp.com`
- `YOUR_PROJECT_ID`
- `YOUR_APP_ID`

with values from **Firebase Console → Project settings → General → Your apps**.

### 2) Make sure the user is signed in

`deleteUser(auth.currentUser)` only works when a user is logged in. If no user is logged in, the UI shows an error.

### 3) Re-authentication handling

Firebase may return `auth/requires-recent-login`. If that happens:

- enter the current password in the password field,
- submit again,
- the page runs `reauthenticateWithCredential(...)` and retries `deleteUser(...)`.

## Preview locally

Open `index.html` in your browser or run a quick static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Host with GitHub Pages

1. Create a new repository on GitHub.
2. Push this project to the repository.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)` folder.
6. Save. GitHub will publish the page and show the URL.
