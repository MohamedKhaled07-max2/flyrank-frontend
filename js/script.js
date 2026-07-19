const STORAGE_KEY = "flyrankSettings";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*\d).{8,}$/;

const settingsForm = document.getElementById("settingsForm");
const successBanner = document.getElementById("successBanner");
const resetButton = document.getElementById("resetButton");
const bioField = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");
const themeSelect = document.getElementById("theme");

function getFormFields() {
  return {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    bio: document.getElementById("bio"),
    currentPassword: document.getElementById("currentPassword"),
    newPassword: document.getElementById("newPassword"),
    confirmPassword: document.getElementById("confirmPassword"),
    emailNotifications: document.getElementById("emailNotifications"),
    smsNotifications: document.getElementById("smsNotifications"),
    pushNotifications: document.getElementById("pushNotifications"),
    theme: document.getElementById("theme"),
    language: document.getElementById("language"),
  };
}

function clearFieldErrors() {
  document.querySelectorAll(".error-text").forEach((el) => {
    el.textContent = "";
  });
  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("input-error");
  });
}

function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

function validateProfile(fields, errors) {
  if (!fields.fullName.value.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!fields.email.value.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(fields.email.value.trim())) {
    errors.email = "Enter a valid email address.";
  }
}

function validatePassword(fields, errors) {
  const current = fields.currentPassword.value;
  const next = fields.newPassword.value;
  const confirm = fields.confirmPassword.value;
  const isChangingPassword = current || next || confirm;

  if (!isChangingPassword) return;

  if (!current) {
    errors.currentPassword = "Enter your current password.";
  }

  if (!next) {
    errors.newPassword = "Enter a new password.";
  } else if (!PASSWORD_PATTERN.test(next)) {
    errors.newPassword = "Must be at least 8 characters and include a number.";
  }

  if (!confirm) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (next && confirm !== next) {
    errors.confirmPassword = "Passwords do not match.";
  }
}

function validateForm(fields) {
  const errors = {};
  validateProfile(fields, errors);
  validatePassword(fields, errors);
  return errors;
}

function collectSettings(fields) {
  return {
    fullName: fields.fullName.value.trim(),
    email: fields.email.value.trim(),
    bio: fields.bio.value.trim(),
    emailNotifications: fields.emailNotifications.checked,
    smsNotifications: fields.smsNotifications.checked,
    pushNotifications: fields.pushNotifications.checked,
    theme: fields.theme.value,
    language: fields.language.value,
  };
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function applySettingsToForm(settings, fields) {
  if (!settings) return;
  fields.fullName.value = settings.fullName || "";
  fields.email.value = settings.email || "";
  fields.bio.value = settings.bio || "";
  fields.emailNotifications.checked = Boolean(settings.emailNotifications);
  fields.smsNotifications.checked = Boolean(settings.smsNotifications);
  fields.pushNotifications.checked = Boolean(settings.pushNotifications);
  fields.theme.value = settings.theme || "system";
  fields.language.value = settings.language || "en";
  updateBioCount();
  applyTheme(fields.theme.value);
}

function applyTheme(themeValue) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = themeValue === "dark" || (themeValue === "system" && prefersDark);
  document.body.classList.toggle("theme-dark", shouldUseDark);
}

function updateBioCount() {
  bioCount.textContent = String(bioField.value.length);
}

function showSuccessBanner() {
  successBanner.hidden = false;
  window.setTimeout(() => {
    successBanner.hidden = true;
  }, 3000);
}

function handleSubmit(event) {
  event.preventDefault();
  clearFieldErrors();
  successBanner.hidden = true;

  const fields = getFormFields();
  const errors = validateForm(fields);

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([fieldId, message]) => {
      showFieldError(fieldId, message);
    });
    return;
  }

  const settings = collectSettings(fields);
  saveSettings(settings);
  applyTheme(settings.theme);

  fields.currentPassword.value = "";
  fields.newPassword.value = "";
  fields.confirmPassword.value = "";

  showSuccessBanner();
}

function handleReset() {
  clearFieldErrors();
  successBanner.hidden = true;
  const fields = getFormFields();
  const settings = loadSettings();
  if (settings) {
    applySettingsToForm(settings, fields);
  } else {
    settingsForm.reset();
    applyTheme(themeSelect.value);
  }
}

function initSettingsForm() {
  const fields = getFormFields();
  const settings = loadSettings();
  applySettingsToForm(settings, fields);

  settingsForm.addEventListener("submit", handleSubmit);
  resetButton.addEventListener("click", handleReset);
  bioField.addEventListener("input", updateBioCount);
  themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
}

document.addEventListener("DOMContentLoaded", initSettingsForm);
