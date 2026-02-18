// Import the functions you need from the SDKs you need using their CDN URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// Wait for the entire DOM to be ready before running the script
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("delete-form");
  const statusMessage = document.getElementById("status");
  const deleteButton = document.getElementById("delete-btn");

  const confirmInput = document.getElementById("confirm-input");
  const acknowledgeCheckbox = document.getElementById("acknowledge-checkbox");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");

  const setStatus = (message, color) => {
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.style.color = color;
    }
  };

  const updateDeleteState = () => {
    if (!confirmInput || !acknowledgeCheckbox || !deleteButton) return;

    const confirmationValue = confirmInput.value.trim().toUpperCase();
    const isAcknowledged = acknowledgeCheckbox.checked;

    // Enable the button only if "DELETE" is exactly typed and checkbox is checked
    if (confirmationValue === "DELETE" && isAcknowledged) {
      deleteButton.disabled = false;
    } else {
      deleteButton.disabled = true;
    }
  };

  const tryReauthenticateAndDelete = async (user, email, password) => {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      let user = auth.currentUser;

      deleteButton.disabled = true;
      setStatus("Processing your request...", "#5a5a5a");

      try {
        // Step 1: Login if needed
        if (!user) {
          setStatus("Logging you in...", "#5a5a5a");
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            user = userCredential.user;
          } catch (loginError) {
            throw new Error(`Login failed: ${loginError.message}`);
          }
        }

        // Step 2: Delete
        setStatus("Deleting your account...", "#5a5a5a");
        try {
          await deleteUser(user);
          setStatus("Your account was deleted successfully.", "#1f6a31");
          form.reset();
          updateDeleteState();
        } catch (deleteError) {
          // Step 3: Handle re-authentication if it's been a while since the last login
          if (deleteError.code === "auth/requires-recent-login") {
            setStatus("Re-verifying credentials...", "#5a5a5a");
            await tryReauthenticateAndDelete(user, email, password);
            setStatus("Re-verified and deleted successfully.", "#1f6a31");
            form.reset();
            updateDeleteState();
          } else {
            throw deleteError;
          }
        }
      } catch (error) {
        console.error("Account Deletion Error:", error);
        setStatus(`Error: ${error.message}`, "#c02828");
        updateDeleteState();
      }
    });

    // Add listeners to the relevant inputs
    confirmInput.addEventListener("input", updateDeleteState);
    acknowledgeCheckbox.addEventListener("change", updateDeleteState);
  }

  // Set the initial state when the page loads
  updateDeleteState();
});
