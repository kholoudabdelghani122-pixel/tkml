(()=> {
  const form = document.querySelector("#role-application-form");
  const status = document.querySelector("#role-application-status");
  if (!form || !status) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const role = form.dataset.role || "tkml role";
    const isArabic = document.documentElement.lang === "ar";
    const resume = values.get("resume");
    const resumeName = resume instanceof File && resume.name
      ? resume.name
      : (isArabic ? "لم يتم اختيار ملف" : "No file selected");
    const labels = isArabic
      ? {
          name: "الاسم",
          email: "البريد الإلكتروني",
          phone: "الهاتف / واتساب",
          profile: "الرابط المهني",
          resume: "السيرة الذاتية",
          attach: "يرجى إرفاق ملف السيرة الذاتية المختار في رسالة البريد قبل الإرسال."
        }
      : {
          name: "Name",
          email: "Email",
          phone: "Phone / WhatsApp",
          profile: "Professional profile",
          resume: "Resume / CV",
          attach: "Please attach the selected resume/CV file to this email before sending."
        };

    const body = [
      `${labels.name}: ${values.get("name")}`,
      `${labels.email}: ${values.get("email")}`,
      `${labels.phone}: ${values.get("phone") || "—"}`,
      `${labels.profile}: ${values.get("profile") || "—"}`,
      `${labels.resume}: ${resumeName}`,
      "",
      labels.attach
    ].join("\n");
    const subject = `${isArabic ? "طلب تقديم" : "Application"} — ${role}`;

    status.hidden = false;
    status.focus();
    window.location.href = `mailto:info@tkml.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();