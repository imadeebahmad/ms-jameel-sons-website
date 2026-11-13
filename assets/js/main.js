/**
 * M/S JAMEEL SONS - Corporate Portal JavaScript
 * Healthcare & Medical Supply Solutions | Multan, Pakistan
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Navigation Toggle ---
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside or on a nav link
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('mobile-open')) {
        navMenu.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 2. Live Number Counter Animation ---
  const counters = document.querySelectorAll('.counter-val');
  let animated = false;

  const runCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        counter.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  // Intersection observer for counters
  const statsSection = document.querySelector('.stats-strip');
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        runCounters();
      }
    }, { threshold: 0.25 });
    observer.observe(statsSection);
  } else {
    runCounters();
  }

  // --- 3. Interactive Catalog Filter & Live Search ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const searchInput = document.getElementById('catalogSearch');
  const emptyState = document.getElementById('catalogEmpty');

  let activeCategory = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    let visibleCount = 0;

    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();
      const cardBullets = (card.querySelector('.product-item-bullets')?.textContent || '').toLowerCase();
      
      const fullText = `${cardTitle} ${cardDesc} ${cardBullets}`;
      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = !searchQuery || fullText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // --- 4. Interactive RFQ Modal Dialog ---
  const modalOverlay = document.getElementById('rfqModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalBtns = document.querySelectorAll('.open-rfq-modal');
  const modalProductSelect = document.getElementById('modalCategory');
  const modalNotes = document.getElementById('modalNotes');

  const openModal = (productName = '', category = '') => {
    if (!modalOverlay) return;
    if (category && modalProductSelect) {
      modalProductSelect.value = category;
    }
    if (productName && modalNotes) {
      modalNotes.value = `Institutional Inquiry regarding: ${productName}\nPlease provide detailed specifications and institutional quotation.`;
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (openModalBtns.length > 0) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const product = btn.getAttribute('data-product') || '';
        const category = btn.getAttribute('data-category') || '';
        openModal(product, category);
      });
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // --- 5. WhatsApp & Email Quote Dispatcher ---
  const handleQuoteDispatch = (formId, isWhatsApp = true) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const hospital = form.querySelector('[name="hospital"]')?.value.trim() || 'N/A';
      const contactName = form.querySelector('[name="name"]')?.value.trim() || 'N/A';
      const city = form.querySelector('[name="city"]')?.value.trim() || 'Multan';
      const phone = form.querySelector('[name="phone"]')?.value.trim() || 'N/A';
      const category = form.querySelector('[name="category"]')?.value.trim() || 'Medical Supplies';
      const message = form.querySelector('[name="message"]')?.value.trim() || 'Inquiry regarding products';

      const waText = 
`*INSTITUTIONAL RFQ - M/S JAMEEL SONS*
---------------------------------------
*Institution / Hospital:* ${hospital}
*Contact Person:* ${contactName}
*City / Region:* ${city}
*Phone / WhatsApp:* ${phone}
*Product Category:* ${category}
*Requirements & Notes:*
${message}
---------------------------------------
Sent via www.jameelsons.com portal`;

      if (isWhatsApp) {
        const encoded = encodeURIComponent(waText);
        const waUrl = `https://wa.me/923114278650?text=${encoded}`;
        window.open(waUrl, '_blank');
      } else {
        const mailSubject = encodeURIComponent(`Institutional RFQ: ${hospital} (${category})`);
        const mailBody = encodeURIComponent(waText);
        window.location.href = `mailto:msjameelsons@gmail.com?subject=${mailSubject}&body=${mailBody}`;
      }

      alert('Thank you! Your quote request has been compiled. You will now be connected directly with our institutional supply coordination desk.');
      if (modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
      form.reset();
    });
  };

  // Wire main RFQ form and Modal RFQ form
  handleQuoteDispatch('rfqFormMain', true);
  handleQuoteDispatch('rfqFormModal', true);

  // Wire email fallback buttons
  const emailDispatchBtn = document.getElementById('submitEmailRfq');
  if (emailDispatchBtn) {
    emailDispatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = emailDispatchBtn.closest('form');
      if (form) {
        const hospital = form.querySelector('[name="hospital"]')?.value.trim() || 'Hospital/Clinic';
        const contactName = form.querySelector('[name="name"]')?.value.trim() || 'Staff';
        const city = form.querySelector('[name="city"]')?.value.trim() || 'Multan';
        const phone = form.querySelector('[name="phone"]')?.value.trim() || 'N/A';
        const category = form.querySelector('[name="category"]')?.value.trim() || 'Medical Supplies';
        const message = form.querySelector('[name="message"]')?.value.trim() || 'Inquiry';

        const body = `Institutional RFQ Details:\nHospital: ${hospital}\nContact: ${contactName}\nCity: ${city}\nPhone: ${phone}\nCategory: ${category}\nNotes:\n${message}`;
        window.location.href = `mailto:msjameelsons@gmail.com?subject=${encodeURIComponent('Official Inquiry: ' + hospital)}&body=${encodeURIComponent(body)}`;
      }
    });
  }

  // --- 6. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!wasOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // --- 7. Back-to-Top Button & Sticky Header Styling ---
  const backToTopBtn = document.getElementById('backToTop');
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn?.classList.add('show');
    } else {
      backToTopBtn?.classList.remove('show');
    }

    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
