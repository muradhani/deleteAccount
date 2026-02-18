// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwJGOGCD8_fj-S6E1Ka8vgjhJp5Ef5SSA",
  authDomain: "come-true-e5671.firebaseapp.com",
  projectId: "come-true-e5671",
  storageBucket: "come-true-e5671.appspot.com",
  messagingSenderId: "498523407043",
  appId: "1:498523407043:web:1e7e2994ca20fcd1675876",
  measurementId: "G-S63EGVGCGN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
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
  const confirmation = formData.get("confirm")?.toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();

  // Button is enabled only if DELETE is typed, permanent action is acknowledged, and credentials are provided
  deleteButton.disabled = !(confirmation === "DELETE" && acknowledged && email && password);
};

const tryReauthenticateAndDelete = async (user, email, password) => {
  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    return true;
  } catch (error) {
    throw error;
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));
  const email = formData.get("email").toString().trim();
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
    setStatus("Your account was deleted successfully.", "#1f6a31");
    form.reset();
    updateDeleteState();
  } catch (error) {
    if (error?.code === "auth/requires-recent-login") {
      try {
        await tryReauthenticateAndDelete(user, email, password);
        setStatus("Re-authenticated and deleted successfully.", "#1f6a31");
        form.reset();
        updateDeleteState();
      } catch (reauthError) {
        setStatus(`Verification failed: ${reauthError.message}`, "#c02828");
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
