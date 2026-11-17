(() => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = `استفسار tkml — ${values.get("topic") || "استفسار عام"}`;
    const body = [
      `الاسم: ${values.get("name")}`,
      `الشركة: ${values.get("company") || "غير مذكور"}`,
      `البريد الإلكتروني: ${values.get("email")}`,
      `الهاتف / واتساب: ${values.get("phone") || "غير مذكور"}`,
      `موضوع الاستفسار: ${values.get("topic") || "غير محدد"}`,
      "",
      "الرسالة:",
      values.get("message"),
    ].join("\\n");
    status.textContent = "تم إعداد مسودة البريد الإلكتروني. اضغط على إرسال في تطبيق البريد لإرسال رسالتك.";
    status.hidden = false;
    window.location.href = `mailto:info@tkml.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
