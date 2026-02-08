const form = document.getElementById("delete-form");
const statusMessage = document.getElementById("status");
const deleteButton = document.getElementById("delete-btn");

const updateDeleteState = () => {
  const formData = new FormData(form);
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();
  const acknowledged = Boolean(formData.get("acknowledge"));

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

  const confirmation = formData.get("confirm").toString().trim().toUpperCase();

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
  statusMessage.textContent = "Request submitted. Your account deletion is now in progress.";
  statusMessage.style.color = "#1f6a31";
  form.reset();
});

cancelButton.addEventListener("click", () => {
  statusMessage.textContent = "Account deletion canceled.";
  statusMessage.style.color = "#5a5a5a";
  form.reset();
  updateDeleteState();
});

form.addEventListener("input", updateDeleteState);
form.addEventListener("change", updateDeleteState);
updateDeleteState();
});
