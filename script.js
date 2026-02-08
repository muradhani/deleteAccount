const form = document.getElementById("delete-form");
const statusMessage = document.getElementById("status");
const cancelButton = document.getElementById("cancel-btn");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const confirmation = formData.get("confirm").toString().trim().toUpperCase();

  if (confirmation !== "DELETE") {
    statusMessage.textContent = "Please type DELETE exactly to confirm.";
    statusMessage.style.color = "#c02828";
    return;
  }

  statusMessage.textContent = "Request submitted. Your account deletion is now in progress.";
  statusMessage.style.color = "#1f6a31";
  form.reset();
});

cancelButton.addEventListener("click", () => {
  statusMessage.textContent = "Account deletion canceled.";
  statusMessage.style.color = "#5a5a5a";
  form.reset();
});
