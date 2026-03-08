const applyForm = document.getElementById("applyForm");
const applyStatus = document.getElementById("applyStatus");
const saveDraftBtn = document.getElementById("saveDraftBtn");

if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", () => {
    applyStatus.textContent = "Draft saving is not connected yet.";
  });
}

if (applyForm) {
  applyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const abn = document.getElementById("abn").value.trim();
    const businessName = document.getElementById("businessName").value.trim();
    const businessEmail = document.getElementById("businessEmail").value.trim();
    const industry = document.getElementById("industry").value.trim();
    const details = document.getElementById("details").value.trim();
    const timelineInput = document.querySelector('input[name="timeline"]:checked');
    const timeline = timelineInput ? timelineInput.value : "";

    if (!/^\d{11}$/.test(abn)) {
      applyStatus.textContent = "Please enter a valid 11-digit ABN.";
      document.getElementById("abn").focus();
      return;
    }

    applyStatus.textContent = "Sending application...";

    try {
      const response = await fetch("http://localhost:3000/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          mobile,
          abn,
          businessName,
          businessEmail,
          industry,
          details,
          timeline
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send application.");
      }

      applyStatus.textContent = "Application submitted successfully.";
      applyForm.reset();
    } catch (error) {
      applyStatus.textContent = error.message || "Something went wrong.";
    }
  });
}