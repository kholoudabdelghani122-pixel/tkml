// TKML shared GSAP motion controller for the live variant page.
const initializeTKMLMotion = function () {
  const pageContext = this;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasMotion = Boolean(gsap && ScrollTrigger);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];
  const listen = (target, type, handler, options) => {
    if (!target) return;
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const scoped = (callback) => {
    if (!gsap) return;
    if (pageContext && typeof pageContext.add === 'function') pageContext.add(callback);
    else callback();
  };
  const tween = (target, vars) => {
    if (hasMotion) scoped(() => gsap.to(target, { ...vars, duration: reducedMotion ? 0 : vars.duration }));
  };
  if (hasMotion && !window.__tkmlScrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    window.__tkmlScrollTriggerRegistered = true;
  }

  const makeTimeline = (options = {}) => gsap.timeline({ defaults: { ease: 'power2.out', ...options.defaults }, ...options });
  const lineReveal = (timeline, target, position, duration = 0.5, rise = 18) => {
    if (!target) return;
    timeline.fromTo(target, { autoAlpha: 0, y: rise, clipPath: 'inset(0 0 100% 0)' }, {
      autoAlpha: 1, y: 0, clipPath: 'inset(-24% 0 -42% 0)', duration,
      clearProps: 'opacity,visibility,transform,clipPath'
    }, position);
  };
  const fadeRise = (timeline, target, position, duration = 0.3, rise = 0) => {
    if (!target) return;
    timeline.fromTo(target, { autoAlpha: 0, y: rise }, {
      autoAlpha: 1, y: 0, duration, clearProps: 'opacity,visibility,transform'
    }, position);
  };
  const makeOnceTimeline = (trigger, start, build) => {
    const timeline = makeTimeline({ scrollTrigger: { trigger, start, once: true } });
    build(timeline);
    return timeline;
  };
  const bindHover = (element, enter, leave, { focus = true } = {}) => {
    if (!element) return;
    listen(element, 'pointerenter', (event) => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) enter(event); });
    listen(element, 'pointerleave', (event) => { if (event.pointerType === 'mouse') leave(event); });
    if (focus) {
      listen(element, 'focusin', enter);
      listen(element, 'focusout', (event) => { if (!element.contains(event.relatedTarget)) leave(event); });
    }
  };
  const bindCTA = (button) => {
    if (!button || !gsap) return;
    const base = getComputedStyle(button);
    const solid = button.classList.contains('button--primary') || button.classList.contains('v2-connect-cta');
    const enter = () => solid
      ? tween(button, { filter: 'brightness(1.1)', duration: 0.18, ease: 'power1.out' })
      : tween(button, { backgroundColor: 'rgba(240,91,27,.06)', color: '#F05B1B', borderColor: '#F05B1B', duration: 0.18, ease: 'power1.out' });
    const leave = () => solid
      ? tween(button, { filter: 'brightness(1)', duration: 0.18, ease: 'power1.out' })
      : tween(button, { backgroundColor: base.backgroundColor, color: base.color, borderColor: base.borderColor, duration: 0.18, ease: 'power1.out' });
    bindHover(button, enter, leave);
  };

  const v2Hero = document.querySelector('.v2-hero');
  if (hasMotion && v2Hero && !reducedMotion) {
    const heroLines = [...v2Hero.querySelectorAll('.v2-title-line')];
    const supporting = [v2Hero.querySelector('.v2-hero__lead'), v2Hero.querySelector('.v2-actions')].filter(Boolean);
    const timeline = makeTimeline();
    heroLines.forEach((line, index) => lineReveal(timeline, line, index * 0.1, 0.55, 24));
    fadeRise(timeline, supporting, 0.65, 0.35, 12);
  }

  const opportunity = document.querySelector('.v2-opportunity');
  if (hasMotion && opportunity && !reducedMotion) {
    const heading = opportunity.querySelector('#opportunity-title');
    const lines = [...opportunity.querySelectorAll('.v2-opportunity__title-line')];
    const copyGroup = opportunity.querySelector('.v2-opportunity__copy');
    gsap.set([...lines, copyGroup].filter(Boolean), { autoAlpha: 0, y: 24 });
    let lastScrollY = window.scrollY;
    let intentUntil = 0;
    let armed = false;
    const pending = new Set();
    const setDownIntent = () => { intentUntil = Date.now() + 700; };
    const onWheel = (event) => { if (event.deltaY > 0) setDownIntent(); else if (event.deltaY < 0) intentUntil = 0; };
    let touchY = null;
    const onTouchStart = (event) => { touchY = event.touches[0]?.clientY ?? null; };
    const onTouchMove = (event) => {
      const nextY = event.touches[0]?.clientY;
      if (touchY !== null && nextY !== undefined) { if (nextY < touchY) setDownIntent(); else if (nextY > touchY) intentUntil = 0; }
      touchY = nextY ?? null;
    };
    const onKeyDown = (event) => {
      if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key) || event.target?.isContentEditable || event.target?.closest?.('a,button,input,textarea,select')) return;
      setDownIntent();
    };
    const triggerZone = (target) => target && target.getBoundingClientRect().top <= innerHeight * 0.8;
    const revealTarget = (target, callback) => {
      if (!target) return;
      if (triggerZone(target)) { callback(); return; }
      let trigger;
      trigger = ScrollTrigger.create({ trigger: target, start: 'top 80%', once: true, onEnter: () => { pending.delete(trigger); callback(); } });
      pending.add(trigger);
    };
    const headlineTimeline = () => {
      const timeline = makeTimeline({ paused: true });
      lineReveal(timeline, lines[0], 0, 0.85, 24);
      lineReveal(timeline, lines[1], 0.3, 0.85, 24);
      return timeline;
    };
    const copyTimeline = (position = 0) => {
      const timeline = makeTimeline({ paused: true });
      fadeRise(timeline, copyGroup, position, 0.8, 12);
      return timeline;
    };
    const armOnFirstDownwardScroll = () => {
      const currentY = window.scrollY;
      const movedDown = currentY > lastScrollY;
      lastScrollY = currentY;
      if (!movedDown || Date.now() > intentUntil) return;
      intentUntil = 0;
      if (armed) { pending.forEach((trigger) => trigger.refresh()); return; }
      armed = true;
      if (matchMedia('(min-width: 768px)').matches) {
        revealTarget(opportunity, () => {
          const timeline = headlineTimeline();
          fadeRise(timeline, copyGroup, 0.45, 0.8, 12);
          timeline.play(0);
        });
      } else {
        revealTarget(heading, () => headlineTimeline().play(0));
        revealTarget(copyGroup, () => copyTimeline().play(0));
      }
    };
    listen(window, 'wheel', onWheel, { passive: true });
    listen(window, 'touchstart', onTouchStart, { passive: true });
    listen(window, 'touchmove', onTouchMove, { passive: true });
    listen(window, 'keydown', onKeyDown);
    listen(window, 'scroll', armOnFirstDownwardScroll, { passive: true });
  }

  const builtFor = document.querySelector('.v2-built-for');
  if (hasMotion && builtFor) {
    const cards = [...builtFor.querySelectorAll('.v2-built-for__card')];
    if (!reducedMotion) {
      const titleLines = [...builtFor.querySelectorAll('.v2-built-for__title-line > span')];
      const copy = builtFor.querySelector('.v2-built-for__head p');
      makeOnceTimeline(builtFor.querySelector('.v2-built-for__head h2'), 'top 85%', (timeline) => {
        titleLines.forEach((line, index) => lineReveal(timeline, line, index * 0.14, 0.55, 20));
        fadeRise(timeline, copy, 0.14, 0.45, 0);
      });
      if (cards.length) gsap.fromTo(cards, { autoAlpha: 0, y: 16 }, {
        autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.09, ease: 'power2.out',
        clearProps: 'opacity,visibility,transform', scrollTrigger: { trigger: builtFor.querySelector('.v2-built-for__grid'), start: 'top 88%', once: true }
      });
    }
    const cardHoverData = [
      { card: '.v2-built-for__card--buyers', glow: '.v2-built-for__card--buyers .v2-built-for__image-slot', rest: 0.28, active: 0.62 },
      { card: '.v2-built-for__card--suppliers', image: '.v2-built-for__card--suppliers .v2-built-for__image', rest: 0, active: 8 },
      { card: '.v2-built-for__card--partner', glow: '.v2-built-for__card--partner .v2-built-for__image-slot', rest: 0.2, active: 0.48 }
    ];
    cardHoverData.forEach((item) => {
      const card = builtFor.querySelector(item.card);
      const target = builtFor.querySelector(item.glow || item.image);
      if (!card || !target) return;
      const enter = () => tween(target, item.glow
        ? { '--card-glow-opacity': reducedMotion ? item.rest + 0.1 : item.active, duration: 0.25, ease: 'power1.out' }
        : { x: reducedMotion ? 0 : item.active, filter: reducedMotion ? 'brightness(1.05)' : 'brightness(1)', duration: 0.25, ease: 'power1.out' });
      const leave = () => tween(target, item.glow
        ? { '--card-glow-opacity': item.rest, duration: 0.25, ease: 'power1.out' }
        : { x: 0, filter: 'brightness(1)', duration: 0.25, ease: 'power1.out' });
      bindHover(card, enter, leave, { focus: false });
    });
  }

  const services = document.querySelector('.v2-service-mosaic');
  if (hasMotion && services) {
    if (!reducedMotion) {
      const titleAccent = services.querySelector('.v2-mosaic__head h2 span');
      if (titleAccent) {
        titleAccent.classList.add('v2-mosaic__scroll-fill');
        gsap.set(titleAccent, { '--service-title-fill': '0%' });
        gsap.to(titleAccent, { '--service-title-fill': '100%', ease: 'none', scrollTrigger: { trigger: titleAccent, start: 'top 82%', end: 'bottom 42%', scrub: true, invalidateOnRefresh: true } });
      }
      const heading = services.querySelector('.v2-mosaic__head');
      gsap.fromTo(heading, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power2.out', clearProps: 'opacity,visibility', scrollTrigger: { trigger: heading, start: 'top 85%', once: true } });
      const rows = [
        ['.v2-mosaic__tile--sourcing', '.v2-mosaic__tile--suppliers'],
        ['.v2-mosaic__tile--intermediation'],
        ['.v2-mosaic__tile--quotations', '.v2-mosaic__tile--development']
      ].map((selectors) => selectors.map((selector) => services.querySelector(selector)).filter(Boolean));
      const serviceMotion = gsap.matchMedia();
      serviceMotion.add('(min-width: 768px)', () => {
        rows.forEach((cards) => { if (cards.length) gsap.fromTo(cards, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out', clearProps: 'opacity,visibility,transform', scrollTrigger: { trigger: cards[0], start: 'top 85%', once: true } }); });
      });
      serviceMotion.add('(max-width: 767px)', () => {
        services.querySelectorAll('.v2-mosaic__tile').forEach((card) => gsap.fromTo(card, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', clearProps: 'opacity,visibility,transform', scrollTrigger: { trigger: card, start: 'top 85%', once: true } }));
      });
    }
    services.querySelectorAll('.v2-mosaic__tile').forEach((card) => {
      const title = card.querySelector('h3');
      const baseTitleColor = title ? getComputedStyle(title).color : '';
      const enter = () => tween(title, reducedMotion ? { color: '#F05B1B', duration: 0 } : { y: -7, duration: 0.76, ease: 'power2.out' });
      const leave = () => tween(title, reducedMotion ? { color: baseTitleColor, duration: 0 } : { y: 0, duration: 0.76, ease: 'power2.out' });
      bindHover(card, enter, leave);
    });
  }

  const process = document.querySelector('.v2-process');
  if (process) {
    const cards = [...process.querySelectorAll('.work-reference__card')];
    const visuals = cards.map((card) => card.querySelector('.work-reference__visual')).filter(Boolean);
    const makeGraphicTimeline = (visual, timeline = makeTimeline({ paused: true }), offset = 0) => {
      const at = (position) => offset + position;
      const scopeRows = [...visual.querySelectorAll('.work-reference__scope-mark')];
      const scopeAccents = scopeRows.map((row) => row.querySelector('.work-reference__scope-accent')).filter(Boolean);
      const requestConfirmation = visual.querySelector('.work-reference__scope-marks + .work-reference__note > span:first-child');
      const supplierTiles = [...visual.querySelectorAll('.work-reference__supplier-mark')];
      const supplierAccents = supplierTiles.map((tile) => tile.querySelector('.work-reference__supplier-accent')).filter(Boolean);
      const supplierFills = [...visual.querySelectorAll('.work-reference__supplier-fill')];
      const quoteSegments = [...visual.querySelectorAll('.work-reference__offer-segment')];
      const ringSegments = [...visual.querySelectorAll('.work-reference__ring > span')];
      const milestoneLabels = [...visual.querySelectorAll('.work-reference__milestone-mark')];
      if (scopeRows.length) {
        timeline.fromTo(scopeRows, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.08, clearProps: 'opacity,visibility,transform', immediateRender: false }, at(0));
        timeline.fromTo(scopeAccents, { scaleY: 0, transformOrigin: 'center center' }, { scaleY: 1, duration: 0.28, stagger: 0.08, clearProps: 'transform', immediateRender: false }, at(0.08));
        if (requestConfirmation) {
          timeline.fromTo(requestConfirmation, { autoAlpha: 0, scale: 0.6, transformOrigin: 'center' }, { autoAlpha: 1, scale: 1, duration: 0.2, clearProps: 'opacity,visibility,transform', immediateRender: false }, at(0.34));
        }
      }
      if (supplierTiles.length) {
        timeline.fromTo(supplierTiles, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.07, clearProps: 'opacity,visibility,transform', immediateRender: false }, at(0));
        timeline.fromTo(supplierAccents, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.25, stagger: 0.07, clearProps: 'transform', immediateRender: false }, at(0.08));
      }
      if (quoteSegments.length) {
        timeline.fromTo(quoteSegments, { scaleY: 0.08, transformOrigin: 'center bottom' }, { scaleY: 1, duration: 0.34, stagger: 0.016, clearProps: 'transform', immediateRender: false }, at(0));
      }
      if (ringSegments.length) {
        timeline.fromTo(ringSegments, { autoAlpha: 0, '--milestone-scale': 0.78 }, { autoAlpha: 1, '--milestone-scale': 1, duration: 0.34, stagger: 0.07, clearProps: 'opacity,visibility', immediateRender: false }, at(0));
        timeline.fromTo(milestoneLabels, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.06, clearProps: 'opacity,visibility,transform', immediateRender: false }, at(0.15));
      }
      return timeline;
    };
    if (hasMotion && !reducedMotion) {
      const processMM = gsap.matchMedia();
      processMM.add('(min-width: 768px)', () => {
        const sequence = makeTimeline({ paused: true });
        visuals.forEach((visual, index) => makeGraphicTimeline(visual, sequence, index * 0.2));
        ScrollTrigger.create({ trigger: process.querySelector('.work-reference__grid'), start: 'top 85%', once: true, onEnter: () => sequence.play(0) });
      });
      processMM.add('(max-width: 767px)', () => {
        cards.forEach((card) => {
          const visual = card.querySelector('.work-reference__visual');
          if (!visual) return;
          const reveal = makeGraphicTimeline(visual);
          ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: () => reveal.play(0) });
        });
      });
    }
    visuals.forEach((visual) => {
      const controls = [...visual.querySelectorAll('.work-reference__mark')];
      const note = visual.querySelector('.work-reference__note-copy');
      const noteArea = visual.querySelector('.work-reference__note');
      const milestoneLayout = visual.querySelector('.work-reference__milestone-layout');
      const ringSegments = [...visual.querySelectorAll('.work-reference__ring > span')];
      let pinned = null;
      let focused = null;
      let hovered = null;
      let lastPointerType = 'mouse';
      const animateInteractiveState = (active) => {
        if (!hasMotion) return;
        controls.forEach((control) => gsap.killTweensOf([control, ...control.querySelectorAll('span')]));
        gsap.killTweensOf(ringSegments);
        const scopeAccent = active?.querySelector('.work-reference__scope-accent');
        if (scopeAccent) tween(scopeAccent, { scaleY: active && !reducedMotion ? 1.3 : 1, y: active && !reducedMotion ? -2 : 0, backgroundColor: active ? '#F05B1B' : 'rgba(187,241,255,.36)', duration: 0.2, ease: 'power2.out' });
        const supplierTiles = [...visual.querySelectorAll('.work-reference__supplier-mark')];
        supplierTiles.forEach((tile) => {
          const fill = tile.querySelector('.work-reference__supplier-fill');
          if (fill) tween(fill, { scaleY: tile === active && !reducedMotion ? 1 : 0, duration: 0.24, ease: 'power2.out', transformOrigin: 'center bottom' });
          const accent = tile.querySelector('.work-reference__supplier-accent');
          if (accent) tween(accent, { scaleX: tile === active && !reducedMotion ? 1.35 : 1, backgroundColor: tile === active ? '#F05B1B' : 'rgba(187,241,255,.36)', duration: 0.22, ease: 'power2.out', transformOrigin: 'left center' });
          if (reducedMotion) tween(tile, { backgroundColor: tile === active ? 'rgba(240,91,27,.1)' : 'rgba(219,219,219,.07)', borderColor: tile === active ? 'rgba(240,91,27,.62)' : 'rgba(219,219,219,.1)', duration: 0 });
        });
        const offerButtons = [...visual.querySelectorAll('.work-reference__offer-segment')];
        if (offerButtons.length) {
          const category = active?.dataset.category;
          offerButtons.forEach((segment) => {
            const chosen = segment === active;
            const related = Boolean(category && segment.dataset.category === category && !chosen);
            tween(segment, { backgroundColor: chosen ? 'rgba(240,91,27,.54)' : related ? 'rgba(240,91,27,.25)' : 'rgba(187,241,255,.2)', color: chosen ? '#FFFFFF' : related ? '#FFB18D' : 'rgba(219,219,219,.82)', scaleY: !reducedMotion && (chosen || related) ? 1.04 : 1, duration: 0.2, ease: 'power2.out', transformOrigin: 'center center' });
          });
        }
        if (milestoneLayout) {
          ringSegments.forEach((segment, index) => tween(segment, { '--milestone-scale': !reducedMotion && active && Number(active.dataset.step) === index ? 1.08 : 1, filter: !reducedMotion && active && Number(active.dataset.step) === index ? 'drop-shadow(0 0 7px rgba(240,91,27,.28))' : 'none', duration: 0.23, ease: 'power2.out' }));
          controls.filter((control) => control.classList.contains('work-reference__milestone-mark')).forEach((label) => tween(label, { backgroundColor: label === active ? '#F05B1B' : 'rgba(219,219,219,.07)', color: label === active ? '#091318' : 'rgba(219,219,219,.82)', duration: 0.2, ease: 'power2.out' }));
        }
        if (noteArea) {
          gsap.killTweensOf(noteArea);
          tween(noteArea, { backgroundColor: active ? 'rgba(240,91,27,.055)' : 'rgba(13,28,34,.7)', duration: 0.18, ease: 'power1.out' });
        }
      };
      const render = () => {
        const active = pinned || focused || hovered;
        controls.forEach((control) => {
          const isActive = control === active;
          control.toggleAttribute('data-active', isActive);
          control.setAttribute('aria-pressed', String(control === pinned));
          if (control.classList.contains('work-reference__offer-segment')) {
            const related = Boolean(active?.dataset.category && control.dataset.category === active.dataset.category && !isActive);
            control.toggleAttribute('data-related-active', related);
          }
        });
        if (milestoneLayout) milestoneLayout.dataset.active = active?.dataset.step ?? '';
        if (note) {
          const next = active?.dataset.detail || noteArea.dataset.default;
          if (note.textContent !== next) note.textContent = next;
        }
        animateInteractiveState(active);
      };
      controls.forEach((control) => {
        listen(control, 'pointerdown', (event) => { lastPointerType = event.pointerType; });
        listen(control, 'pointerenter', (event) => { if (event.pointerType === 'mouse') { hovered = control; render(); } });
        listen(control, 'pointerleave', (event) => { if (event.pointerType === 'mouse' && hovered === control) { hovered = null; render(); } });
        listen(control, 'focus', () => { focused = control; render(); });
        listen(control, 'blur', (event) => { if (!event.relatedTarget || !visual.contains(event.relatedTarget)) { focused = null; render(); } });
        listen(control, 'click', () => {
          if (pinned === control) {
            pinned = null;
            if (lastPointerType === 'touch') { focused = null; hovered = null; }
          } else pinned = control;
          render();
        });
      });
    });
    cards.forEach((card) => {
      const hover = (active) => {
        const vars = active ? { borderColor: 'rgba(240,91,27,.62)', backgroundColor: 'rgba(0,0,0,.78)' } : { borderColor: 'rgba(187,241,255,.16)', backgroundColor: 'rgba(13,28,34,.84)' };
        tween(card, { ...vars, duration: 0.22, ease: 'power1.out' });
      };
      bindHover(card, () => hover(true), () => hover(false));
    });
  }

  const about = document.querySelector('.v2-about');
  if (hasMotion && about && !reducedMotion) {
    const eyebrow = about.querySelector('.v2-about__eyebrow');
    const lines = [...about.querySelectorAll('.v2-about__title-line > span')];
    const paragraphs = [...about.querySelectorAll('.v2-about__copy p')];
    const cta = about.querySelector('.v2-about__cta');
    const timeline = makeOnceTimeline(about, 'top 82%', (tl) => {
      fadeRise(tl, eyebrow, 0, 0.2);
      lineReveal(tl, lines[0], 0, 0.45, 18);
      lineReveal(tl, lines[1], 0.18, 0.5, 18);
      fadeRise(tl, paragraphs[0], 0.18, 0.3);
      fadeRise(tl, paragraphs[1], 0.28, 0.3);
      fadeRise(tl, cta, 0.58, 0.25, 6);
    });
  }

  const faq = document.querySelector('.v2-faq');
  if (faq) {
    const items = [...faq.querySelectorAll('.v2-faq-accordion .v2-service')];
    items.forEach((item) => {
      const summary = item.querySelector('summary');
      const content = item.querySelector('.v2-service__content');
      if (summary) summary.setAttribute('aria-expanded', String(item.open));
      if (content) content.inert = !item.open;
    });
    if (hasMotion && !reducedMotion) {
      const lines = [...faq.querySelectorAll('.v2-faq__title-line > span')];
      const groups = [faq.querySelector('.v2-faq__prompt'), faq.querySelector('.v2-faq-accordion')].filter(Boolean);
      makeOnceTimeline(faq, 'top 88%', (tl) => {
        lineReveal(tl, lines[0], 0, 0.42, 18);
        lineReveal(tl, lines[1], 0.12, 0.42, 18);
        fadeRise(tl, groups, 0.16, 0.35);
      });
    }
    items.forEach((item) => {
      const summary = item.querySelector('summary');
      const content = item.querySelector('.v2-service__content');
      const answer = content?.querySelector('p');
      const toggle = summary?.querySelector('.v2-service__toggle');
      if (!summary || !content) return;
      if (item.open) {
        content.inert = false;
        if (gsap) gsap.set([content, answer].filter(Boolean), { clearProps: 'height,overflow,paddingBottom,opacity,visibility' });
      } else content.inert = true;
      if (toggle) toggle.style.setProperty('--faq-plus-scale', item.open ? '0' : '1');
      const animateState = (opening) => {
        const motionOff = !hasMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const wasClosing = item.classList.contains('is-closing');
        const currentHeight = content.getBoundingClientRect().height;
        if (hasMotion) gsap.killTweensOf([content, answer, toggle]);
        summary.setAttribute('aria-expanded', String(opening));
        if (opening) {
          item.classList.remove('is-closing');
          item.open = true;
          content.inert = false;
        } else {
          item.classList.add('is-closing');
          content.inert = true;
        }
        if (motionOff) {
          item.open = opening;
          item.classList.remove('is-closing');
          content.inert = !opening;
          content.removeAttribute('style');
          if (answer) answer.removeAttribute('style');
          if (toggle) toggle.style.setProperty('--faq-plus-scale', opening ? '0' : '1');
          return;
        }
        const bottomPadding = matchMedia('(max-width: 767px)').matches ? 22 : 26;
        if (opening) {
          gsap.set(content, { height: wasClosing ? currentHeight : 0, overflow: 'hidden', paddingBottom: 0 });
          if (answer) gsap.set(answer, { autoAlpha: wasClosing ? Number(gsap.getProperty(answer, 'opacity')) : 0 });
          gsap.to(content, { height: 'auto', paddingBottom: bottomPadding, duration: 0.28, ease: 'power2.out', onComplete: () => gsap.set(content, { clearProps: 'height,overflow,paddingBottom' }) });
          if (answer) gsap.to(answer, { autoAlpha: 1, duration: 0.16, delay: 0.065, ease: 'power1.out', onComplete: () => gsap.set(answer, { clearProps: 'opacity,visibility' }) });
          if (toggle) gsap.to(toggle, { '--faq-plus-scale': 0, duration: 0.18, ease: 'power2.out' });
        } else {
          gsap.set(content, { height: currentHeight, overflow: 'hidden' });
          if (answer) gsap.to(answer, { autoAlpha: 0, duration: 0.075, ease: 'none' });
          if (toggle) gsap.to(toggle, { '--faq-plus-scale': 1, duration: 0.18, ease: 'power2.out' });
          gsap.to(content, { height: 0, paddingBottom: 0, duration: 0.22, delay: 0.035, ease: 'power2.inOut', onComplete: () => {
            if (item.classList.contains('is-closing')) {
              item.open = false;
              item.classList.remove('is-closing');
              gsap.set(content, { clearProps: 'height,overflow,paddingBottom' });
              if (answer) gsap.set(answer, { clearProps: 'opacity,visibility' });
            }
          } });
        }
      };
      listen(summary, 'click', (event) => { event.preventDefault(); animateState(!(item.open && !item.classList.contains('is-closing'))); });
      const hoverRow = (active) => {
        if (!hasMotion) return;
        if (toggle) tween(toggle, { filter: active ? 'brightness(1.12)' : 'brightness(1)', duration: 0.15, ease: 'power1.out' });
      };
      bindHover(summary, () => hoverRow(true), () => hoverRow(false));
    });
  }

  const requestFlow = document.querySelector('.v2-request-flow');
  if (requestFlow) {
    const steps = [
      ['Send a request.', 'Share what you need, your specifications, priorities, and target timing.'],
      ['Screen potential suppliers.', 'TKML checks the request and identifies suppliers whose capabilities fit the scope.'],
      ['Coordinate quotations.', 'TKML requests offers from potential suppliers and clarifies details such as price basis, lead time, and terms.'],
      ['Review organized quotations.', 'TKML organizes the offers so you can review them and agree on the next step.']
    ];
    const overview = ['From request to quotations', 'You share a request. TKML screens potential suppliers, coordinates quotations, and sends the organized offers back to you.'];
    const controls = requestFlow.querySelector('.v2-request-flow__controls');
    const detail = requestFlow.querySelector('.v2-request-flow__details');
    const detailTitle = requestFlow.querySelector('.v2-request-flow__detail-title');
    const detailCopy = requestFlow.querySelector('.v2-request-flow__detail-copy');
    const buttons = [...controls.querySelectorAll('button[data-select]')];
    const nodes = [...requestFlow.querySelectorAll('.v2-request-flow__node')];
    const buyer = requestFlow.querySelector('[data-node="buyer"]');
    const hub = requestFlow.querySelector('[data-node="hub"]');
    const suppliers = [...requestFlow.querySelectorAll('[data-node="supplier"]')];
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = -1;
    let timeline;

    const routes = [...requestFlow.querySelectorAll('.v2-request-flow__route')].map((path) => {
      const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      packet.setAttribute('class', 'v2-request-flow__packet');
      packet.setAttribute('r', '4');
      path.ownerSVGElement.append(packet);
      return { path, packet, stage: Number(path.dataset.stage), supplier: path.dataset.supplier === undefined ? null : Number(path.dataset.supplier) };
    });
    const visibleRoutes = () => routes.filter(({ path }) => {
      const rect = path.ownerSVGElement.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const paintStep = (index, { completed = false, preview = false } = {}) => {
      const [heading, copy] = steps[index] ?? overview;
      detailTitle.textContent = heading;
      detailCopy.textContent = copy;
      detail.setAttribute('aria-live', preview ? 'off' : 'polite');
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(!preview && Number(button.dataset.select) === active)));
      const activeNodes = index === 0 ? [buyer, hub]
        : index === 1 ? [hub]
          : index === 2 ? [hub, ...(completed ? suppliers : [])]
            : index === 3 ? [hub, ...(completed ? [buyer] : [])] : [];
      nodes.forEach((node) => {
        node.classList.toggle('is-active', !preview && activeNodes.includes(node));
        node.classList.toggle('is-preview', preview && activeNodes.includes(node));
      });
      visibleRoutes().forEach(({ path, stage }) => path.classList.toggle('is-active', stage === index));
    };
    const clearAnimation = () => {
      if (timeline) {
        timeline.pause(0);
        timeline.kill();
        timeline = null;
      }
      routes.forEach(({ packet }) => {
        if (hasMotion) gsap.set(packet, { opacity: 0 });
        else packet.style.opacity = '0';
      });
      nodes.forEach((node) => node.classList.remove('is-active', 'is-preview'));
      routes.forEach(({ path }) => path.classList.remove('is-active'));
      if (hub && hasMotion) gsap.set(hub, { clearProps: 'filter' });
    };
    const pulseRoute = (tl, route, start, duration, onArrive) => {
      const progress = { value: 0 };
      const length = route.path.getTotalLength();
      const update = () => {
        const point = route.path.getPointAtLength(progress.value * length);
        route.packet.setAttribute('cx', point.x);
        route.packet.setAttribute('cy', point.y);
      };
      tl.call(update, [], start).set(route.packet, { opacity: 1 }, start)
        .to(progress, { value: 1, duration, ease: 'none', onUpdate: update }, start)
        .to(route.packet, { opacity: 0, duration: 0.12 }, start + duration);
      if (onArrive) tl.call(onArrive, [], start + duration);
    };
    const activateStep = (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= steps.length) return;
      active = index;
      clearAnimation();
      paintStep(index);
      if (!hasMotion || motionPreference.matches) {
        paintStep(index, { completed: true });
        return;
      }
      timeline = makeTimeline({ paused: true });
      const availableRoutes = visibleRoutes();
      if (index === 0) {
        const route = availableRoutes.find((item) => item.stage === 0);
        if (route) pulseRoute(timeline, route, 0, 0.72);
      } else if (index === 1 && hub) {
        timeline.to(hub, { filter: 'brightness(1.28)', duration: 0.24, yoyo: true, repeat: 3, ease: 'sine.inOut', clearProps: 'filter' }, 0);
      } else if (index === 2) {
        availableRoutes.filter((item) => item.stage === 2).forEach((route) => {
          const supplier = suppliers[route.supplier];
          pulseRoute(timeline, route, (route.supplier ?? 0) * 0.19, 0.66, () => supplier?.classList.add('is-active'));
        });
      } else if (index === 3) {
        const route = availableRoutes.find((item) => item.stage === 3);
        if (route) pulseRoute(timeline, route, 0, 0.82, () => buyer?.classList.add('is-active'));
      }
      timeline.play(0);
    };

    listen(controls, 'click', (event) => {
      const button = event.target.closest('button[data-select]');
      if (button && controls.contains(button)) activateStep(Number(button.dataset.select));
    });
    buttons.forEach((button) => {
      const index = Number(button.dataset.select);
      listen(button, 'pointerenter', (event) => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) paintStep(index, { preview: true }); });
      listen(button, 'pointerleave', (event) => { if (event.pointerType === 'mouse') paintStep(active, { completed: true }); });
    });
    nodes.forEach((node) => {
      listen(node, 'pointerenter', (event) => {
        if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const index = node.dataset.node === 'buyer' ? 0 : node.dataset.node === 'hub' ? 1 : 2;
        paintStep(index, { preview: true });
      });
      listen(node, 'pointerleave', (event) => { if (event.pointerType === 'mouse') paintStep(active, { completed: true }); });
    });
    listen(motionPreference, 'change', () => {
      if (!motionPreference.matches || active < 0) return;
      clearAnimation();
      paintStep(active, { completed: true });
    });
    cleanups.push(() => {
      timeline?.kill();
      routes.forEach(({ packet }) => packet.remove());
    });
    detail.setAttribute('aria-labelledby', 'request-flow-detail-title');
    detailTitle.id = 'request-flow-detail-title';
    paintStep(-1);
  }

  const principle = document.querySelector('.v2-principle');
  if (principle && hasMotion && !reducedMotion) {
    const stroke = principle.querySelector('.v2-principle__stroke-art');
    if (stroke) gsap.fromTo(stroke, { autoAlpha: 0, y: -10, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 0.24, y: 0, clipPath: 'inset(0)', duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: principle, start: 'top 76%', once: true } });
    const lines = [...principle.querySelectorAll('.v2-principle__title-line > span')];
    const copy = principle.querySelector('.v2-principle__copy > p');
    const cta = principle.querySelector('.v2-principle__copy > .button');
    const artwork = principle.querySelector('.v2-principle__image');
    const makePrincipleTimeline = (withArtwork) => {
      const tl = makeTimeline({ paused: true });
      if (withArtwork && artwork) tl.fromTo(artwork, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)', duration: 0.6, clearProps: 'clipPath' }, 0);
      lineReveal(tl, lines[0], 0.08, 0.35, 10);
      lineReveal(tl, lines[1], 0.2, 0.35, 10);
      fadeRise(tl, copy, 0.34, 0.25);
      fadeRise(tl, cta, 0.42, 0.2);
      return tl;
    };
    const principleMM = gsap.matchMedia();
    principleMM.add('(min-width: 768px)', () => {
      const tl = makePrincipleTimeline(true);
      ScrollTrigger.create({ trigger: principle, start: 'top 85%', once: true, onEnter: () => tl.play(0) });
    });
    principleMM.add('(max-width: 767px)', () => {
      const stacked = artwork && artwork.getBoundingClientRect().top >= cta.getBoundingClientRect().bottom;
      const tl = makePrincipleTimeline(!stacked);
      ScrollTrigger.create({ trigger: principle, start: 'top 85%', once: true, onEnter: () => tl.play(0) });
      if (stacked && artwork) {
        const artTl = makeTimeline({ paused: true });
        artTl.fromTo(artwork, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)', duration: 0.6, clearProps: 'clipPath' });
        ScrollTrigger.create({ trigger: artwork, start: 'top 90%', once: true, onEnter: () => artTl.play(0) });
      }
    });
  }

  const footer = document.querySelector('.v2-footer');
  if (footer && hasMotion && !reducedMotion) {
    const mainPanel = footer.querySelector('.v2-footer__panel--main');
    const contactPanel = footer.querySelector('.v2-footer__panel--contact');
    const mainLines = [...(mainPanel?.querySelectorAll('.v2-footer__title-line > span') ?? [])];
    const contactLine = contactPanel?.querySelector('.v2-footer__title-line > span');
    const contactSupport = [contactPanel?.querySelector('.v2-footer__contact-copy'), contactPanel?.querySelector('.v2-footer__contact-links')].filter(Boolean);
    const makeFooterTimeline = ({ panels, first = null, second = null, contact = null, support = [] }) => {
      const tl = makeTimeline({ paused: true });
      fadeRise(tl, panels, 0, 0.3);
      lineReveal(tl, first, 0, 0.4, 18);
      lineReveal(tl, second, 0.12, 0.4, 18);
      lineReveal(tl, contact, 0.12, 0.4, 18);
      fadeRise(tl, support, 0.22, 0.25);
      return tl;
    };
    const footerMM = gsap.matchMedia();
    footerMM.add('(min-width: 768px)', () => {
      const tl = makeFooterTimeline({ panels: [mainPanel, contactPanel].filter(Boolean), first: mainLines[0], second: mainLines[1], contact: contactLine, support: contactSupport });
      ScrollTrigger.create({ trigger: footer, start: 'top 85%', once: true, onEnter: () => tl.play(0) });
    });
    footerMM.add('(max-width: 767px)', () => {
      const leftTl = makeFooterTimeline({ panels: mainPanel ? [mainPanel] : [], first: mainLines[0], second: mainLines[1] });
      const rightTl = makeFooterTimeline({ panels: contactPanel ? [contactPanel] : [], contact: contactLine, support: contactSupport });
      if (mainPanel) ScrollTrigger.create({ trigger: mainPanel, start: 'top 85%', once: true, onEnter: () => leftTl.play(0) });
      if (contactPanel) ScrollTrigger.create({ trigger: contactPanel, start: 'top 85%', once: true, onEnter: () => rightTl.play(0) });
    });
  }

  document.querySelectorAll('.v2-header-cta, .v2-hero .v2-actions .button, .v2-opportunity .button, .v2-about__cta, .v2-principle__copy > .button').forEach(bindCTA);

  const v2Header = document.querySelector('.v2-header');
  if (v2Header) {
    const links = [...v2Header.querySelectorAll('nav a')];
    const updateActive = () => {
      const contact = document.querySelector('#connect');
      const aboutSection = document.querySelector('#company');
      let current = '#top';
      if (contact?.getBoundingClientRect().top <= 120) current = '#connect';
      else if (aboutSection?.getBoundingClientRect().top <= 120) current = '#company';
      links.forEach((link) => { if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    };
    let lastScrolled = window.scrollY > 36;
    v2Header.classList.toggle('is-scrolled', lastScrolled);
    if (hasMotion) gsap.set(v2Header, { yPercent: 0, autoAlpha: 1 });
    const baseLinkColor = (link) => link.getAttribute('aria-current') === 'page' ? 'var(--color-orange)' : 'var(--color-white)';
    links.forEach((link) => bindHover(link, () => tween(link, { color: '#F05B1B', duration: 0.16, ease: 'power1.out' }), () => tween(link, { color: baseLinkColor(link), duration: 0.16, ease: 'power1.out' })));
    const updateHeader = () => {
      const nextScrolled = window.scrollY > 36;
      updateActive();
      if (nextScrolled === lastScrolled) return;
      lastScrolled = nextScrolled;
      if (nextScrolled) {
        v2Header.classList.add('is-scrolled');
        if (hasMotion && !reducedMotion) scoped(() => gsap.fromTo(v2Header, { yPercent: -110, autoAlpha: 0.88 }, { yPercent: 0, autoAlpha: 1, duration: 0.36, ease: 'power2.out', overwrite: true }));
        else if (hasMotion) gsap.set(v2Header, { yPercent: 0, autoAlpha: 1 });
      } else {
        v2Header.classList.remove('is-scrolled');
        if (hasMotion) tween(v2Header, { yPercent: 0, autoAlpha: 1, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
    };
    listen(window, 'scroll', updateHeader, { passive: true });
    updateActive();
  }

  const enquiryLinks = footer ? [...footer.querySelectorAll('.v2-footer__contact-links a')] : [];
  enquiryLinks.forEach((link) => {
    const setLine = (active) => tween(link, { '--enquiry-line-progress': active ? 1 : 0, duration: 0.18, ease: 'power1.out' });
    bindHover(link, () => setLine(true), () => setLine(false));
  });

  window.addEventListener('pagehide', () => { cleanups.forEach((cleanup) => cleanup()); }, { once: true });
};

if (window.gsap) {
  const pageMotionContext = window.gsap.context(initializeTKMLMotion, document.body);
  window.addEventListener('pagehide', () => pageMotionContext.revert(), { once: true });
} else {
  initializeTKMLMotion();
}
