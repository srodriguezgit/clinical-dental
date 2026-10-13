const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const menuLabel = document.querySelector(".menu-toggle-label");

if (menuToggle && mainNav) {
  function setMenuOpen(isOpen) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );

    mainNav.hidden = !isOpen;

    if (menuLabel) {
      menuLabel.textContent = isOpen ? "Cerrar" : "Menú";
    }
  }

  setMenuOpen(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInside =
      mainNav.contains(event.target) ||
      menuToggle.contains(event.target);

    if (!clickedInside) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (event.key === "Escape" && isOpen) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

const treatmentItems = document.querySelectorAll(".treatment");

treatmentItems.forEach((currentItem) => {
  currentItem.addEventListener("toggle", () => {
    if (!currentItem.open) return;

    treatmentItems.forEach((otherItem) => {
      if (otherItem !== currentItem) {
        otherItem.open = false;
      }
    });
  });
});

// Número de la clínica, con código de país y solo dígitos.
// Vacío = modo demostración.
const clinicWhatsApp = "5491176004462";

const appointmentForm = document.querySelector("#appointment-form");

if (appointmentForm) {
  const steps = [...appointmentForm.querySelectorAll(".appointment-step")];
  const backButton = document.querySelector("#appointment-back");
  const nextButton = document.querySelector("#appointment-next");
  const progressLabel = document.querySelector("#appointment-step-label");
  const progressFill = document.querySelector("#appointment-progress-fill");

  const result = document.querySelector("#appointment-result");
  const summary = document.querySelector("#appointment-summary");
  const resultTitle = document.querySelector("#appointment-result-title");
  const status = document.querySelector("#appointment-status");
  const whatsappLink = document.querySelector("#appointment-whatsapp");
  const editButton = document.querySelector("#appointment-edit");

  const treatmentSelect = document.querySelector("#appointment-treatment");
  const nameInput = document.querySelector("#appointment-name");
  const phoneInput = document.querySelector("#appointment-phone");

  const stepNames = ["Tu consulta", "Tu disponibilidad", "Tus datos"];
  let currentStep = 0;

  function showStep(index, moveFocus = true) {
    currentStep = index;

    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== index;
    });

    backButton.hidden = index === 0;
    nextButton.textContent =
      index === steps.length - 1 ? "Revisar solicitud" : "Continuar";

    progressLabel.textContent =
      `Paso ${index + 1} de ${steps.length} · ${stepNames[index]}`;

    progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;

    if (moveFocus) {
      steps[index].querySelector("input, select").focus();
    }
  }

  function validateStep(index) {
    nameInput.setCustomValidity(
      nameInput.value.trim() ? "" : "Ingresá tu nombre."
    );

    const phoneValue = phoneInput.value.trim();
    const phoneDigits = phoneValue.replace(/\D/g, "");

    const validPhone =
      /^[+\d\s().-]+$/.test(phoneValue) &&
      phoneDigits.length >= 8 &&
      phoneDigits.length <= 15;

    phoneInput.setCustomValidity(
      validPhone ? "" : "Ingresá un teléfono válido, incluyendo la característica."
    );

    const fields = [...steps[index].querySelectorAll("input, select")];
    const invalidField = fields.find((field) => !field.checkValidity());

    if (invalidField) {
      invalidField.reportValidity();
      return false;
    }

    return true;
  }

  nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
  phoneInput.addEventListener("input", () => phoneInput.setCustomValidity(""));

  function showSummary() {
    const data = new FormData(appointmentForm);

    const values = {
      treatment: data.get("treatment"),
      day: data.get("day"),
      time: data.get("time"),
      name: data.get("name").trim(),
      phone: data.get("phone").trim()
    };

    const rows = [
      ["Consulta", values.treatment],
      ["Día", values.day],
      ["Horario", values.time],
      ["Nombre", values.name],
      ["Teléfono", values.phone]
    ];

    summary.replaceChildren();

    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");

      term.textContent = label;
      description.textContent = value;

      row.append(term, description);
      summary.append(row);
    });

    const message = [
      `Hola, soy ${values.name}. Quisiera solicitar una consulta.`,
      "",
      `Motivo: ${values.treatment}`,
      `Día de preferencia: ${values.day}`,
      `Franja horaria: ${values.time}`,
      `Mi teléfono: ${values.phone}`,
      "",
      "¿Podrían confirmarme la disponibilidad?"
    ].join("\n");

    const isConfigured = /^\d{8,15}$/.test(clinicWhatsApp);

    whatsappLink.hidden = !isConfigured;

    if (isConfigured) {
      whatsappLink.href =
        `https://wa.me/${clinicWhatsApp}?text=${encodeURIComponent(message)}`;

      status.textContent =
        "Todavía no se envió la solicitud. Abrí WhatsApp, revisá el mensaje y envialo para consultar disponibilidad.";
    } else {
      whatsappLink.removeAttribute("href");

      status.textContent =
        "Modo demostración: no se enviaron datos ni se reservó un turno. El contacto por WhatsApp se habilitará al configurar el número de la clínica.";
    }

    appointmentForm.hidden = true;
    result.hidden = false;
    resultTitle.focus();
  }

  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
      return;
    }

    // Verifica también los pasos anteriores antes de mostrar el resumen.
    for (let index = 0; index < steps.length; index++) {
      const invalidField = [...steps[index].querySelectorAll("input, select")]
        .find((field) => !field.checkValidity());

      if (invalidField) {
        showStep(index);
        invalidField.reportValidity();
        return;
      }
    }

    showSummary();
  });

  backButton.addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  editButton.addEventListener("click", () => {
    result.hidden = true;
    appointmentForm.hidden = false;
    showStep(0);
  });

  // Conecta los enlaces de tratamientos con el formulario.
  document.querySelectorAll(".treatment-link").forEach((link) => {
    link.addEventListener("click", () => {
      const treatmentName = link
        .closest(".treatment")
        .querySelector("h3")
        .textContent.trim();

      treatmentSelect.value = treatmentName;

      result.hidden = true;
      appointmentForm.hidden = false;
      showStep(0, false);
    });
  });

  showStep(0, false);
}

// CONTACTO Y FOOTER

const footerYear = document.querySelector("#footer-year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Usa el mismo número configurado en el formulario.
const hasWhatsApp = /^\d{8,15}$/.test(clinicWhatsApp);

if (hasWhatsApp) {
  const contactMessage = encodeURIComponent(
    "Hola, quisiera hacer una consulta sobre Alma Dental."
  );

  const contactUrl =
    `https://wa.me/${clinicWhatsApp}?text=${contactMessage}`;

  ["#whatsapp-float", "#footer-whatsapp"].forEach((selector) => {
    const link = document.querySelector(selector);

    if (link) {
      link.href = contactUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.hidden = false;
    }
  });
}

// Completá únicamente con perfiles que quieras vincular.
// Si están vacíos, esos enlaces no se muestran.
const clinicSocials = {
  instagram: "https://www.instagram.com/srodriguez.web/",
  facebook: ""
};

let visibleSocials = 0;

Object.entries(clinicSocials).forEach(([network, value]) => {
  const link = document.querySelector(`#footer-${network}`);

  if (!link || !value.trim()) return;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return;

    link.href = url.href;
    link.hidden = false;
    visibleSocials++;
  } catch {
    // Un enlace incompleto no se muestra.
  }
});

const socialNote = document.querySelector("#footer-social-note");

if (socialNote) {
  socialNote.hidden = visibleSocials > 0;
}