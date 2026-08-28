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
  let premiumMotionStarted = false;
  let premiumMotionReady = false;
  let premiumMotionLibraries;

  function stopLegacyPointerEffect(event) {
    event.stopPropagation();
  }

  function optimizePointerMovement() {
    const main = document.getElementById("inicio");
    if (!main || main.dataset.pointerOptimized) return;
    main.dataset.pointerOptimized = "true";
    main.addEventListener("pointermove", stopLegacyPointerEffect);
  }

  function activateCard(group, card) {
    group.querySelectorAll("article, li").forEach(function (item) {
      item.classList.toggle("is-active", item === card);
    });
  }

  function prepareInteractiveGroup(selector) {
    const group = document.querySelector(selector);
    if (!group || group.dataset.interactiveReady) return;
    group.dataset.interactiveReady = "true";
    const cards = Array.from(group.querySelectorAll("article, li"));
    if (!cards.length) return;
    activateCard(group, cards[0]);
    cards.forEach(function (card) {
      card.tabIndex = 0;
      card.addEventListener("pointerenter", function () { activateCard(group, card); });
      card.addEventListener("focusin", function () { activateCard(group, card); });
      card.addEventListener("click", function () { activateCard(group, card); });
    });
  }

  function prepareDynamicExperience() {
    prepareInteractiveGroup(".signal-grid");
    prepareInteractiveGroup(".approach-list");
    prepareInteractiveGroup(".process-steps");
  }

  function loadMotionScript(id, source) {
    return new Promise(function (resolve, reject) {
      const current = document.getElementById(id);
      if (current) {
        if (current.dataset.loaded === "true") resolve();
        else current.addEventListener("load", resolve, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = id;
      script.src = source;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.addEventListener("load", function () {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function setupPremiumMotion() {
    if (premiumMotionReady || !window.gsap || !window.ScrollTrigger) return;
    const hero = document.querySelector(".hero");
    if (!hero) {
      window.setTimeout(setupPremiumMotion, 160);
      return;
    }

    premiumMotionReady = true;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ duration: .82, ease: "power3.out" });
    body.classList.add("premium-motion");

    const heroTargets = [
      hero.querySelector(".eyebrow"),
      hero.querySelector("h1"),
      hero.querySelector(".hero-lead"),
      hero.querySelector(".hero-actions"),
      hero.querySelector(".hero-trust")
    ].filter(Boolean);
    const portrait = hero.querySelector(".portrait-frame");

    const heroTimeline = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: function () {
        gsap.set(heroTargets, { clearProps: "willChange" });
        if (portrait) gsap.set(portrait, { clearProps: "willChange" });
      }
    });
    heroTimeline
      .fromTo(heroTargets, { y: 24, autoAlpha: 0, willChange: "transform,opacity" }, {
        y: 0,
        autoAlpha: 1,
        duration: .86,
        stagger: .075
      });
    if (portrait) {
      heroTimeline.fromTo(portrait, {
        clipPath: "inset(0 0 100% 0)",
        willChange: "clip-path"
      }, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.05,
        ease: "power4.out"
      }, .08);
    }

    [
      [".signal-grid", ".signal-grid article"],
      [".approach-list", ".approach-list article"],
      [".process-steps", ".process-steps li"],
      [".mode-grid", ".mode-grid article"],
      [".instagram-rail", ".instagram-card"],
      [".faq-list", ".faq-list details"]
    ].forEach(function (entry) {
      const trigger = document.querySelector(entry[0]);
      const targets = gsap.utils.toArray(entry[1]);
      if (!trigger || !targets.length) return;
      gsap.fromTo(targets, {
        y: 26,
        autoAlpha: 0,
        willChange: "transform,opacity"
      }, {
        y: 0,
        autoAlpha: 1,
        duration: .78,
        stagger: .07,
        ease: "power4.out",
        clearProps: "willChange",
        scrollTrigger: {
          trigger: trigger,
          start: "top 84%",
          once: true
        }
      });
    });

    const aboutPortrait = document.querySelector(".about-portrait");
    if (aboutPortrait) {
      const aboutImage = aboutPortrait.querySelector("img");
      const imageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: aboutPortrait,
          start: "top 82%",
          once: true
        }
      });
      imageTimeline.fromTo(aboutPortrait, {
        clipPath: "inset(0 0 100% 0)"
      }, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.02,
        ease: "power4.out"
      });
      if (aboutImage) {
        imageTimeline.fromTo(aboutImage, { scale: 1.055 }, {
          scale: 1,
          duration: 1.12,
          ease: "power4.out"
        }, 0);
      }
    }

    if (!window.matchMedia("(pointer: coarse)").matches) {
      gsap.utils.toArray(".button, .floating-contact").forEach(function (button) {
        const xTo = gsap.quickTo(button, "x", { duration: .38, ease: "power3.out" });
        const yTo = gsap.quickTo(button, "y", { duration: .38, ease: "power3.out" });
        button.addEventListener("pointermove", function (event) {
          const rect = button.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * .1);
          yTo((event.clientY - rect.top - rect.height / 2) * .1);
        });
        button.addEventListener("pointerleave", function () {
          xTo(0);
          yTo(0);
        });
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
    window.setTimeout(function () { ScrollTrigger.refresh(); }, 250);
    window.addEventListener("pagehide", function () {
      ScrollTrigger.getAll().forEach(function (trigger) { trigger.kill(); });
    }, { once: true });
  }

  function preloadPremiumMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
    if (premiumMotionLibraries) return premiumMotionLibraries;
    premiumMotionLibraries = loadMotionScript("larissa-gsap", "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js")
      .then(function () {
        return loadMotionScript("larissa-scroll-trigger", "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js");
      });
    return premiumMotionLibraries;
  }

  function startPremiumMotion() {
    if (premiumMotionStarted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    premiumMotionStarted = true;
    preloadPremiumMotion()
      .then(setupPremiumMotion)
      .catch(function () {
        body.classList.remove("premium-motion");
      });
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    intro.classList.add("is-leaving");
    body.classList.remove("larissa-intro-open");
    startPremiumMotion();
    window.setTimeout(function () {
      intro.remove();
    }, 850);
  }

  function updateIntroVideoMode() {
    const source = introVideo.currentSrc || "";
    intro.classList.toggle("has-alpha-video", source.toLowerCase().includes(".webm"));
  }

  body.classList.add("larissa-intro-open");
  introVideo.addEventListener("loadedmetadata", updateIntroVideoMode);
  introVideo.addEventListener("canplay", updateIntroVideoMode);
  introVideo.addEventListener("ended", finishIntro, { once: true });
  introVideo.addEventListener("error", finishIntro, { once: true });
  const playback = introVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () {
      window.setTimeout(finishIntro, 3200);
    });
  }
  window.setTimeout(finishIntro, 4600);
  preloadPremiumMotion().catch(function () {});

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
  optimizePointerMovement();
  prepareDynamicExperience();
  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) prepareContactLinks(node);
      });
    });
    optimizePointerMovement();
    prepareDynamicExperience();
  }).observe(document.getElementById("root"), { childList: true, subtree: true });

  window.setTimeout(startPremiumMotion, 4800);

  if (window.location.hash === "#lead-form") openForm();
})();
