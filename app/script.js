// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
