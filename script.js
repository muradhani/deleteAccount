import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  EmailAuthProvider,
  deleteUser,
  getAuth,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// TODO: Replace with your Firebase project settings from Firebase Console.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("delete-form");
const statusMessage = document.getElementById("status");
const deleteButton = document.getElementById("delete-btn");

const setStatus = (message, color) => {
  statusMessage.textContent = message;
  statusMessage.style.color = color;
};

const updateDeleteState = () => {
  const formData = new FormData(form);
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));

  deleteButton.disabled = !(confirmation === "DELETE" && acknowledged);
};

const tryReauthenticateAndDelete = async (user, password) => {
  if (!password) {
    setStatus(
      "For security, Firebase requires recent login. Enter your current password and try again.",
      "#c02828"
    );
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));
  const password = formData.get("password").toString().trim();

  if (confirmation !== "DELETE") {
    setStatus("Please type DELETE exactly to confirm.", "#c02828");
    return;
  }

  if (!acknowledged) {
    setStatus("Please acknowledge that this action is permanent.", "#c02828");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    setStatus("No logged-in user found. Sign in first, then try again.", "#c02828");
    return;
  }

  deleteButton.disabled = true;
  setStatus("Deleting your account...", "#5a5a5a");

  try {
    await deleteUser(user);
    setStatus("Your Firebase Auth account was deleted successfully.", "#1f6a31");
    form.reset();
    updateDeleteState();
  } catch (error) {
    if (error?.code === "auth/requires-recent-login") {
      try {
        await tryReauthenticateAndDelete(user, password);
        setStatus(
          "Re-authenticated and deleted successfully.",
          "#1f6a31"
        );
        form.reset();
        updateDeleteState();
      } catch (reauthError) {
        setStatus(
          `Delete failed after re-authentication: ${reauthError.message}`,
          "#c02828"
        );
      }
    } else {
      setStatus(`Delete failed: ${error.message}`, "#c02828");
    }
  } finally {
    updateDeleteState();
  }
});

form.addEventListener("input", updateDeleteState);
form.addEventListener("change", updateDeleteState);
updateDeleteState();
