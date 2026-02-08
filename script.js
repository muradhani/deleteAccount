const form = document.getElementById("delete-form");
const statusMessage = document.getElementById("status");
const deleteButton = document.getElementById("delete-btn");
const confirmInput = form.querySelector('input[name="confirm"]');
const acknowledgeInput = form.querySelector('input[name="acknowledge"]');

const updateDeleteState = () => {
  const confirmation = confirmInput.value.trim().toUpperCase();
  const acknowledged = acknowledgeInput.checked;

  deleteButton.disabled = !(confirmation === "DELETE" && acknowledged);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const contact = formData.get("contact").toString().trim();
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));

  if (!contact) {
    statusMessage.textContent = "Please provide your email or phone number.";
    statusMessage.style.color = "#c02828";
    return;
  }

  if (confirmation !== "DELETE") {
    statusMessage.textContent = "Please type DELETE exactly to confirm.";
    statusMessage.style.color = "#c02828";
    return;
  }

  if (!acknowledged) {
    statusMessage.textContent = "Please acknowledge that this action is permanent.";
    statusMessage.style.color = "#c02828";
    return;
  }

  statusMessage.textContent = "Request submitted. Your account deletion is now in progress.";
  statusMessage.style.color = "#1f6a31";
  form.reset();
  updateDeleteState();
});

form.addEventListener("input", updateDeleteState);
form.addEventListener("change", updateDeleteState);
updateDeleteState();
