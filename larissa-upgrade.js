(function () {
  "use strict";

  const whatsappNumber = "5511988691142";
  const contactSelector = 'a[href*="wa.me"], a[href="#pre-conversa"], a[data-lead-form-link]';
  const body = document.body;
  const intro = document.getElementById("larissa-video-intro");
  const introVideo = document.getElementById("larissa-intro-video");
  const modal = document.getElementById("lead-form");
  const form = document.getElementById("lead-qualification-form");
  const steps = Array.from(form.querySelectorAll(".lead-form-step"));
  const progress = Array.from(form.querySelectorAll(".lead-form-progress span"));
  let currentStep = 0;
  let introFinished = false;

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    intro.classList.add("is-leaving");
    body.classList.remove("larissa-intro-open");
    window.setTimeout(function () {
      intro.remove();
    }, 850);
  }

  body.classList.add("larissa-intro-open");
  introVideo.addEventListener("ended", finishIntro, { once: true });
  introVideo.addEventListener("error", finishIntro, { once: true });
  const playback = introVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () {
      window.setTimeout(finishIntro, 3200);
    });
  }
  window.setTimeout(finishIntro, 4600);

  function prepareContactLinks(scope) {
    scope.querySelectorAll(contactSelector).forEach(function (link) {
      link.dataset.leadFormLink = "true";
      link.setAttribute("href", "#lead-form");
      link.removeAttribute("target");
      link.removeAttribute("rel");
    });
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach(function (step, stepIndex) {
      step.hidden = stepIndex !== currentStep;
    });
    progress.forEach(function (bar, barIndex) {
      bar.classList.toggle("is-active", barIndex <= currentStep);
    });
    const activeField = steps[currentStep].querySelector("input:not([type=radio]), input[type=radio]:checked");
    if (activeField) window.setTimeout(function () { activeField.focus(); }, 80);
  }

  function clearErrors() {
    form.querySelectorAll(".lead-form-error").forEach(function (error) {
      error.textContent = "";
    });
  }

  function setError(stepIndex, message) {
    steps[stepIndex].querySelector(".lead-form-error").textContent = message;
  }

  function validateStep(index) {
    clearErrors();
    if (index === 0) {
      const name = form.elements.name.value.trim();
      if (name.length < 2) {
        setError(0, "Por favor, informe seu nome.");
        return false;
      }
    }
    if (index === 1) {
      const phone = form.elements.phone.value.replace(/\D/g, "");
      if (phone.length < 10 || phone.length > 11) {
        setError(1, "Informe um telefone com DDD.");
        return false;
      }
    }
    if (index === 2 && !form.elements.aware.value) {
      setError(2, "Selecione uma opção para continuar.");
      return false;
    }
    return true;
  }

  function openForm() {
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("lead-form-open");
    showStep(currentStep);
    window.setTimeout(function () {
      const focusTarget = steps[currentStep].querySelector("input") || modal.querySelector("button");
      if (focusTarget) focusTarget.focus();
    }, 120);
  }

  function closeForm() {
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("lead-form-open");
  }

  document.addEventListener("click", function (event) {
    const contactLink = event.target.closest(contactSelector);
    if (contactLink) {
      event.preventDefault();
      openForm();
      return;
    }

    const nextButton = event.target.closest("[data-lead-next]");
    if (nextButton && validateStep(currentStep)) showStep(currentStep + 1);

    const backButton = event.target.closest("[data-lead-back]");
    if (backButton) {
      clearErrors();
      showStep(currentStep - 1);
    }

    if (event.target.closest("[data-lead-close]")) closeForm();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeForm();
  });

  form.elements.phone.addEventListener("input", function (event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) formatted = "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length > 7) formatted = formatted.slice(0, digits.length === 11 ? 10 : 9) + "-" + digits.slice(digits.length === 11 ? 7 : 6);
    event.target.value = formatted;
  });

  form.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.matches('input[type="text"], input[type="tel"]')) {
      event.preventDefault();
      if (validateStep(currentStep)) showStep(currentStep + 1);
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateStep(2)) return;

    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const awareness = form.elements.aware.value;
    const message = [
      "Olá, Larissa! Vim pelo site e gostaria de continuar.",
      "",
      "Nome: " + name,
      "Telefone: " + phone,
      "Ciente do valor médio de R$400,00 a R$680: " + awareness
    ].join("\n");
    const submitButton = form.querySelector(".lead-form-submit");
    submitButton.disabled = true;
    submitButton.textContent = "Abrindo WhatsApp…";
    window.location.assign("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message));
  });

  prepareContactLinks(document);
  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) prepareContactLinks(node);
      });
    });
  }).observe(document.getElementById("root"), { childList: true, subtree: true });

  if (window.location.hash === "#lead-form") openForm();
})();
