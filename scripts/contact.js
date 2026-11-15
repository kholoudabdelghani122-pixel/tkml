(() => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const subject = `TKML enquiry — ${values.get("topic") || "General enquiry"}`;
    const body = [
      `Name: ${values.get("name")}`,
      `Company: ${values.get("company") || "Not provided"}`,
      `Email: ${values.get("email")}`,
      `Phone / WhatsApp: ${values.get("phone") || "Not provided"}`,
      `Enquiry: ${values.get("topic") || "Not specified"}`,
      "",
      "Message:",
      values.get("message"),
    ].join("\n");

    status.textContent = "Your email draft is ready. Press Send in your email app to deliver your message.";
    status.hidden = false;
    window.location.href = `mailto:info@tkml.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();