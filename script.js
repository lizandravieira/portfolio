(() => {
  const filters = Array.from(document.querySelectorAll("[data-project-filter]"));
  const projects = Array.from(document.querySelectorAll("[data-project-category]"));
  const grid = document.querySelector("[data-project-grid]");
  const moreCard = document.querySelector("[data-project-more]");
  const emptyState = document.querySelector("[data-project-empty]");

  if (!filters.length || !projects.length || !grid) return;

  const setFilter = (filter) => {
    let visibleCount = 0;
    const showAll = filter === "all";

    filters.forEach((item) => {
      const isActive = item.dataset.projectFilter === filter;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    projects.forEach((project) => {
      const isVisible = showAll || project.dataset.projectCategory === filter;
      project.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (moreCard) {
      moreCard.classList.toggle("is-hidden", !showAll);
    }

    if (emptyState) {
      emptyState.classList.toggle("is-hidden", visibleCount > 0);
    }

    grid.dataset.visibleCount = String(visibleCount);
  };

  filters.forEach((item) => {
    item.addEventListener("click", () => setFilter(item.dataset.projectFilter));
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      setFilter(item.dataset.projectFilter);
    });
  });

  setFilter("all");
})();

(() => {
  document.querySelectorAll("[data-gallery-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".gallery-track");
    const slides = Array.from(carousel.querySelectorAll(".gallery-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-gallery-dot]"));
    const prev = carousel.querySelector("[data-gallery-prev]");
    const next = carousel.querySelector("[data-gallery-next]");
    let current = 0;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      carousel.querySelectorAll("video").forEach((video) => video.pause());
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    };

    prev.addEventListener("click", () => showSlide(current - 1));
    next.addEventListener("click", () => showSlide(current + 1));
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index));
    });
  });
})();

(() => {
  const designWidth = 1000;
  const mobileBreakpoint = 780;
  const stage = document.querySelector(".fit-stage");
  const page = document.querySelector(".page");
  const nav = document.querySelector("nav");
  let currentScale = 1;
  let scrollAnimation = 0;

  const getNavHeight = () => nav.getBoundingClientRect().height || 49;

  const easeInOutCubic = (value) => {
    return value < .5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  };

  const animateScrollTo = (targetTop) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.min(Math.max(targetTop, 0), maxScroll);
    const start = window.scrollY;
    const distance = top - start;
    const duration = Math.min(1200, Math.max(620, Math.abs(distance) * .55));
    const animationId = ++scrollAnimation;
    const startTime = performance.now();

    const step = (now) => {
      if (animationId !== scrollAnimation) return;

      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const getTargetScrollTop = (target) => {
    if (target.id === "hero") return 0;

    const rect = target.getBoundingClientRect();
    const navHeight = getNavHeight();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const availableHeight = Math.max(1, viewportHeight - navHeight);
    const targetTop = rect.top + window.scrollY;

    if (rect.height <= availableHeight) {
      return targetTop - navHeight - ((availableHeight - rect.height) / 2);
    }

    return targetTop - navHeight - 8;
  };

  const scrollToSection = (target) => {
    animateScrollTo(getTargetScrollTop(target));
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      scrollToSection(target);
      history.pushState(null, "", hash);
    });
  });

  const fitPage = () => {
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const shouldScale = viewportWidth > mobileBreakpoint;
    currentScale = shouldScale ? viewportWidth / designWidth : 1;

    document.documentElement.style.setProperty("--page-scale", currentScale.toFixed(4));
    document.documentElement.style.setProperty("--nav-visual-height", `${getNavHeight()}px`);
    stage.style.height = shouldScale ? `${page.scrollHeight * currentScale}px` : "";
  };

  fitPage();
  window.addEventListener("resize", fitPage);
  window.addEventListener("load", fitPage);
  window.addEventListener("wheel", () => scrollAnimation += 1, { passive: true });
  window.addEventListener("touchstart", () => scrollAnimation += 1, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitPage);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(fitPage).observe(page);
  }
})();
