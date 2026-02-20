// Import the functions you need from the SDKs you need using their CDN URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
  getAuth,
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

    if (confirmationValue === "DELETE" && isAcknowledged) {
      deleteButton.disabled = false;
    } else {
      deleteButton.disabled = true;
    }
  };

  const getProcessedEmail = (input) => {
    const trimmedInput = input.trim();
    const isPhoneNumber = /^\+?[0-9]{7,15}$/.test(trimmedInput);

    if (isPhoneNumber) {
      return `${trimmedInput}@cometrue.com`;
    }
    return trimmedInput;
  };

  /**
   * Calls the specialized Cloud Function to delete the account and clean up data.
   */
  const callDeleteCloudFunction = async (user) => {
    const idToken = await user.getIdToken(true); // Force refresh to ensure token is valid
    const functionUrl = "https://asia-south1-come-true-e5671.cloudfunctions.net/deleteAccount";

    const response = await fetch(functionUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Cloud Function failed to delete account.");
    }

    return result;
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const rawInput = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      const email = getProcessedEmail(rawInput);
      let user = auth.currentUser;

      deleteButton.disabled = true;
      setStatus("Processing deletion request...", "#5a5a5a");

      try {
        // 1. Ensure user is logged in
        if (!user) {
          setStatus("Logging you in...", "#5a5a5a");
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
        }

        // 2. Re-authenticate to ensure the session is fresh (recommended for sensitive ops)
        setStatus("Verifying credentials...", "#5a5a5a");
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);

        // 3. Call your asia-south1 Cloud Function
        setStatus("Executing cleanup and deletion...", "#5a5a5a");
        await callDeleteCloudFunction(user);

        // Success
        setStatus("Your account and all related data have been deleted.", "#1f6a31");
        form.reset();
        updateDeleteState();

        // Sign out locally
        await auth.signOut();

      } catch (error) {
        console.error("Deletion Process Error:", error);
        setStatus(`Error: ${error.message}`, "#c02828");
        deleteButton.disabled = false;
        updateDeleteState();
      }
    });

    confirmInput.addEventListener("input", updateDeleteState);
    acknowledgeCheckbox.addEventListener("change", updateDeleteState);
  }

  updateDeleteState();
});
