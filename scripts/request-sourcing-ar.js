(function () {
  'use strict';

  const form = document.getElementById('req-form');
  if (!form) return;

  const steps = [...form.querySelectorAll('.rfq-step')];
  const count = document.getElementById('rfq-step-count');
  const progress = document.getElementById('rfq-progress-fill');
  const stepName = document.getElementById('rfq-step-name');
  const back = document.getElementById('rfq-back');
  const next = document.getElementById('rfq-continue');
  const preview = document.getElementById('rfq-preview');
  const formError = document.getElementById('rfq-form-error');
  const unit = document.getElementById('unit');
  const otherUnitField = document.getElementById('other-unit-field');
  const otherUnit = document.getElementById('other-unit');
  const fileInput = document.getElementById('rfq-files');
  const fileDrop = document.getElementById('rfq-drop');
  const fileList = document.getElementById('rfq-file-list');
  const fileError = document.getElementById('error-files');
  const review = document.getElementById('rfq-review');
  const previewResult = document.getElementById('rfq-preview-result');
  const copySummaryButton = document.getElementById('copy-summary');
  const copyStatus = document.getElementById('copy-status');
  const successStatus = document.getElementById('rfq-success-status');
  const failureStatus = document.getElementById('rfq-failure-status');
  const retryButton = document.getElementById('rfq-retry');
  const maxFiles = 10;
  const maxBytes = 20 * 1024 * 1024;
  const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'zip']);
  const stepNames = ['ما الذي تحتاجه؟', 'الكمية والتسليم', 'الشركة وبيانات التواصل', 'المراجعة والإرسال'];
  let currentStep = 1;
  let files = [];

  const originalDescriptions = new WeakMap();
  form.querySelectorAll('[aria-describedby]').forEach((control) => originalDescriptions.set(control, control.getAttribute('aria-describedby')));

  function clearPreview() {
    previewResult.hidden = true;
    successStatus.hidden = true;
    failureStatus.hidden = true;
    retryButton.hidden = true;
    preview.hidden = currentStep !== 4;
    copyStatus.textContent = '';
  }

  function setHeaderState() {
    const header = document.querySelector('.v2-header');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  function setStep(step, shouldFocus = true) {
    currentStep = Math.max(1, Math.min(4, step));
    steps.forEach((panel, index) => { panel.hidden = index + 1 !== currentStep; });
    count.textContent = `الخطوة ${currentStep} من ٤`;
    stepName.textContent = stepNames[currentStep - 1];
    progress.style.width = `${currentStep * 25}%`;
    back.hidden = currentStep === 1;
    next.hidden = currentStep === 4;
    preview.hidden = currentStep !== 4;
    formError.hidden = true;
    if (currentStep === 4) renderReview();
    if (shouldFocus) {
      const heading = steps[currentStep - 1].querySelector('.rfq-step__title');
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function errorFor(control) {
    return control.id ? document.getElementById(`error-${control.id}`) : null;
  }

  function setError(control, message) {
    const error = errorFor(control);
    if (error) error.textContent = message || '';
    if (message) {
      control.setAttribute('aria-invalid', 'true');
      const base = (originalDescriptions.get(control) || '').split(/\s+/).filter(Boolean);
      if (error) base.push(error.id);
      if (base.length) control.setAttribute('aria-describedby', [...new Set(base)].join(' '));
    } else {
      control.removeAttribute('aria-invalid');
      const original = originalDescriptions.get(control);
      if (original) control.setAttribute('aria-describedby', original);
      else control.removeAttribute('aria-describedby');
    }
  }

  function validateStep(stepNumber) {
    const panel = steps[stepNumber - 1];
    let firstInvalid = null;
    const requiredControls = [...panel.querySelectorAll('[required]')].filter((control) => !control.closest('[hidden]'));
    requiredControls.forEach((control) => {
      let message = '';
      const value = control.type === 'checkbox' ? control.checked : String(control.value || '').trim();
      if (!value) message = control.type === 'checkbox' ? 'يرجى تأكيد موافقتك قبل المتابعة.' : 'هذا الحقل مطلوب.';
      else if (control.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'أدخل بريداً إلكترونياً صالحاً.';
      else if (control.type === 'number' && control.id === 'quantity' && !(Number(value) > 0)) message = 'أدخل كمية أكبر من صفر.';
      setError(control, message);
      if (message && !firstInvalid) firstInvalid = control;
    });

    if (stepNumber === 2) {
      const amount = document.getElementById('budget-amount');
      const currency = document.getElementById('budget-currency');
      const amountValue = amount.value.trim();
      const currencyValue = currency.value.trim();
      if (amountValue && !(Number(amountValue) > 0)) {
        setError(amount, 'أدخل ميزانية أكبر من صفر، أو اترك الحقل فارغاً.');
        if (!firstInvalid) firstInvalid = amount;
      }
      if (Boolean(amountValue) !== Boolean(currencyValue)) {
        const target = amountValue ? currency : amount;
        setError(target, amountValue ? 'اختر عملة للميزانية.' : 'أدخل مبلغاً بالعملة المحددة، أو اترك الحقلين فارغين.');
        if (!firstInvalid) firstInvalid = target;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return false;
    }
    return true;
  }

  function moveForward() {
    clearPreview();
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  }

  function humanSize(bytes) {
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function renderFiles() {
    fileList.replaceChildren();
    files.forEach((file, index) => {
      const item = document.createElement('li');
      const description = document.createElement('span');
      description.className = 'rfq-file-name';
      description.append(document.createTextNode(file.name));
      const size = document.createElement('span');
      size.className = 'rfq-file-size';
      size.textContent = humanSize(file.size);
      description.append(size);
      const remove = document.createElement('button');
      remove.className = 'rfq-file-remove';
      remove.type = 'button';
      remove.textContent = 'إزالة';
      remove.setAttribute('aria-label', `إزالة ${file.name}`);
      remove.addEventListener('click', () => {
        files.splice(index, 1);
        renderFiles();
        fileError.textContent = '';
        clearPreview();
        const nextRemoveButton = fileList.querySelectorAll('.rfq-file-remove')[Math.min(index, files.length - 1)];
        if (nextRemoveButton) nextRemoveButton.focus();
        else fileInput.focus();
      });
      item.append(description, remove);
      fileList.append(item);
    });
  }

  function addFiles(fileCollection) {
    const rejected = [];
    [...fileCollection].forEach((file) => {
      const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      if (!allowedExtensions.has(ext)) { rejected.push(`${file.name}: نوع الملف غير مدعوم.`); return; }
      if (file.size > maxBytes) { rejected.push(`${file.name}: يتجاوز حجمه ٢٠ ميغابايت.`); return; }
      const duplicate = files.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified);
      if (duplicate) return;
      if (files.length >= maxFiles) { rejected.push(`يمكنك إرفاق ما يصل إلى ${maxFiles} ملفات.`); return; }
      files.push(file);
    });
    fileError.textContent = rejected.join(' ');
    renderFiles();
    clearPreview();
  }

  function fieldValue(name) {
    const control = form.elements.namedItem(name);
    return control ? String(control.value || '').trim() : '';
  }

  function selectedProductDescription() {
    return fieldValue('productDescription');
  }

  function addReviewGroup(title, step, entries) {
    const group = document.createElement('section');
    group.className = 'rfq-review-group';
    const head = document.createElement('div');
    head.className = 'rfq-review-group__head';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const edit = document.createElement('button');
    edit.className = 'rfq-edit';
    edit.type = 'button';
    edit.textContent = 'تعديل';
    edit.setAttribute('aria-label', `تعديل ${title.toLowerCase()}`);
    edit.addEventListener('click', () => setStep(step));
    head.append(heading, edit);
    const list = document.createElement('dl');
    list.className = 'rfq-review-list';
    entries.forEach(([label, value, full = false]) => {
      if (!value) return;
      const item = document.createElement('div');
      item.className = `rfq-review-item${full ? ' rfq-review-item--full' : ''}`;
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      item.append(dt, dd);
      list.append(item);
    });
    if (title === 'المنتج والمواصفات' && files.length) {
      const item = document.createElement('div');
      item.className = 'rfq-review-item rfq-review-item--full';
      const dt = document.createElement('dt');
      dt.textContent = 'المرفقات';
      const ul = document.createElement('ul');
      ul.className = 'rfq-review-files';
      files.forEach((file) => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${humanSize(file.size)})`;
        ul.append(li);
      });
      item.append(dt, ul);
      list.append(item);
    }
    if (!list.children.length) {
      const item = document.createElement('div');
      item.className = 'rfq-review-item';
      const dd = document.createElement('dd');
      dd.textContent = 'لم تُضف تفاصيل اختيارية.';
      item.append(dd);
      list.append(item);
    }
    group.append(head, list);
    review.append(group);
  }

  function renderReview() {
    review.replaceChildren();
    addReviewGroup('المنتج والمواصفات', 1, [
      ['المنتج أو الفئة', fieldValue('productCategory')],
      ['وصف المنتج', selectedProductDescription(), true],
      ['المواصفات الفنية', fieldValue('technicalSpecifications'), true]
    ]);
    addReviewGroup('الكمية والتسليم', 2, [
      ['الكمية', [fieldValue('quantity'), unit.value === 'Other' ? fieldValue('otherUnit') : unit.value].filter(Boolean).join(' ')],
      ['وجهة التسليم', fieldValue('deliveryDestination')],
      ['تاريخ التسليم المستهدف', fieldValue('targetDate')],
      ['وتيرة الطلب', fieldValue('orderFrequency')],
      ['الميزانية التقديرية', [fieldValue('budgetAmount'), fieldValue('budgetCurrency')].filter(Boolean).join(' ')],
      ['شرط إنكوتيرمز المفضل', fieldValue('incoterm')],
      ['ملاحظات التسليم', fieldValue('deliveryNotes'), true]
    ]);
    addReviewGroup('الشركة وبيانات التواصل', 3, [
      ['اسم الشركة', fieldValue('companyName')],
      ['بلد الشركة', fieldValue('companyCountry')],
      ['اسم جهة التواصل', fieldValue('contactName')],
      ['البريد الإلكتروني', fieldValue('email')],
      ['الهاتف أو واتساب', fieldValue('phone')]
    ]);
  }

  function buildSummary() {
    const data = new FormData(form);
    const rows = [
      'tkml Systems — طلب توريد',
      '',
      'المنتج والمواصفات',
      `المنتج أو الفئة: ${data.get('productCategory') || ''}`,
      `وصف المنتج: ${data.get('productDescription') || ''}`,
      `المواصفات الفنية: ${data.get('technicalSpecifications') || 'غير متوفر'}`,
      `المرفقات: ${files.length ? files.map((file) => `${file.name} (${humanSize(file.size)})`).join(', ') : 'لا يوجد'}`,
      '',
      'الكمية والتسليم',
      `الكمية: ${[data.get('quantity'), unit.value === 'Other' ? data.get('otherUnit') : unit.value].filter(Boolean).join(' ')}`,
      `وجهة التسليم: ${data.get('deliveryDestination') || ''}`,
      `تاريخ التسليم المستهدف: ${data.get('targetDate') || 'غير متوفر'}`,
      `وتيرة الطلب: ${data.get('orderFrequency') || 'غير متوفر'}`,
      `الميزانية التقديرية: ${[data.get('budgetAmount'), data.get('budgetCurrency')].filter(Boolean).join(' ') || 'غير متوفر'}`,
      `شرط إنكوتيرمز المفضل: ${data.get('incoterm') || 'غير متوفر'}`,
      `ملاحظات التسليم: ${data.get('deliveryNotes') || 'غير متوفر'}`,
      '',
      'الشركة وبيانات التواصل',
      `اسم الشركة: ${data.get('companyName') || ''}`,
      `بلد الشركة: ${data.get('companyCountry') || ''}`,
      `اسم جهة التواصل: ${data.get('contactName') || ''}`,
      `البريد الإلكتروني: ${data.get('email') || ''}`,
      `الهاتف أو واتساب: ${data.get('phone') || 'غير متوفر'}`,
      '',
      'هذا التأكيد الظاهر على الصفحة لا يرسل طلبك.'
    ];
    return rows.join('\n');
  }

  unit.addEventListener('change', () => {
    const showOther = unit.value === 'Other';
    otherUnitField.hidden = !showOther;
    otherUnit.required = showOther;
    if (!showOther) { otherUnit.value = ''; setError(otherUnit, ''); }
    clearPreview();
  });

  form.addEventListener('input', (event) => {
    const control = event.target;
    if (control.matches('input, textarea, select')) {
      if (control.getAttribute('aria-invalid') === 'true') setError(control, '');
      clearPreview();
    }
  });
  form.addEventListener('change', (event) => {
    const control = event.target;
    if (control.matches('input, textarea, select') && control.getAttribute('aria-invalid') === 'true') setError(control, '');
  });

  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach((name) => fileDrop.addEventListener(name, (event) => {
    event.preventDefault();
    fileDrop.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((name) => fileDrop.addEventListener(name, (event) => {
    event.preventDefault();
    fileDrop.classList.remove('is-dragging');
  }));
  fileDrop.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));

  next.addEventListener('click', moveForward);
  back.addEventListener('click', () => { clearPreview(); setStep(currentStep - 1); });
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && currentStep < 4 && !(event.target instanceof HTMLTextAreaElement) && !event.target.matches('button')) {
      event.preventDefault();
      moveForward();
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentStep !== 4) { moveForward(); return; }
    if (!validateStep(4)) return;
    renderReview();
    const showSampleFailure = new URLSearchParams(window.location.search).get('demo-status') === 'failed';
    successStatus.hidden = showSampleFailure;
    failureStatus.hidden = !showSampleFailure;
    retryButton.hidden = !showSampleFailure;
    preview.hidden = true;
    previewResult.hidden = false;
    previewResult.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  retryButton.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('demo-status');
    window.history.replaceState({}, '', url);
    clearPreview();
    preview.hidden = false;
    preview.focus();
  });

  form.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
    clearPreview();
    setStep(Number(button.dataset.edit));
  }));

  copySummaryButton.addEventListener('click', async () => {
    const text = buildSummary();
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = 'تم نسخ الملخص.';
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      copyStatus.textContent = copied ? 'تم نسخ الملخص.' : 'النسخ غير متاح في هذا المتصفح.';
    }
  });

  document.querySelectorAll('.v2-mobile-nav nav a').forEach((link) => link.addEventListener('click', () => {
    const menu = link.closest('details');
    if (menu) menu.open = false;
  }));
  window.addEventListener('scroll', setHeaderState, { passive: true });
  setHeaderState();
  setStep(1, false);
}());
