// Global engine to populate universal modules
document.addEventListener("DOMContentLoaded", () => {
  injectDynamicFooters();

  // Trigger the portfolio compiler engine if the original archive grid container is present
  if (document.getElementById("archive-grid-target")) {
    initializeDynamicPortfolio();
  }
});

function injectDynamicFooters() {
  const designFooterList = document.getElementById("dynamic-footer-designs");
  if (!designFooterList) return;

  fetch("data/designs.json")
    .then((res) => res.json())
    .then((data) => {
      designFooterList.innerHTML = data
        .slice(0, 3)
        .map(
          (design) => `
                <li><a href="single-design.html?id=${design.id}">${design.title}</a></li>
            `,
        )
        .join("");
    })
    .catch((err) =>
      console.error("Error generating dynamic footer components:", err),
    );
}

/* ==========================================================================
   PURE DYNAMIC PORTFOLIO ENGINE
   ========================================================================== */
let allDesignsCached = [];

function initializeDynamicPortfolio() {
  const archiveGrid = document.getElementById("archive-grid-target");
  if (!archiveGrid) return;

  // 1. Inject 3-Dot Blinking Loader
  archiveGrid.innerHTML = `
        <div id="portfolio-loader" style="grid-column: 1/-1; text-align: center; color: var(--text-light); padding: 80px 0; font-family: 'Inter', sans-serif; letter-spacing: 2px; font-size: 0.9rem;">
            <span id="blinking-dots"></span>
        </div>
    `;

  let dotCount = 0;
  const dotInterval = setInterval(() => {
    const dotsElem = document.getElementById("blinking-dots");
    if (dotsElem) {
      dotCount = (dotCount + 1) % 4;
      dotsElem.innerText = ".".repeat(dotCount);
    }
  }, 400);

  // 2. Fetch data stream from folder directory
  fetch("data/designs.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      clearInterval(dotInterval);
      allDesignsCached = data;

      // 3. Render out modules dynamically
      injectDynamicFilterBar(data, archiveGrid);
      renderCards(allDesignsCached);
      setupFilterListeners();
    })
    .catch((err) => {
      clearInterval(dotInterval);
      console.error("Portfolio ecosystem compilation failed:", err);
      archiveGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red; padding: 40px;">Failed to link structural design files.</div>`;
    });
}

// Generates dynamic buttons based ONLY on existing JSON data
function injectDynamicFilterBar(designsArray, targetGrid) {
  if (document.querySelector(".portfolio-filter-bar")) return;

  const categoriesSet = new Set();

  designsArray.forEach((design) => {
    if (design.subtitle && design.subtitle.includes(" // ")) {
      const rawCategory = design.subtitle.split(" // ")[0].trim();
      categoriesSet.add(rawCategory);
    }
  });

  let filterButtonsHTML = `<button class="filter-btn active" data-filter="all">All Concepts</button>`;

  categoriesSet.forEach((category) => {
    // Normalizes to match exact class patterns
    const categorySlug = category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
    filterButtonsHTML += `<button class="filter-btn" data-filter="${categorySlug}">${category}</button>`;
  });

  const filterBarHTML = `
        <div class="portfolio-filter-bar">
            ${filterButtonsHTML}
        </div>
    `;

  // Safely inject right before the portfolio archive layout grid container
  targetGrid.insertAdjacentHTML("beforebegin", filterBarHTML);
}

// Renders individual portfolio cards
function renderCards(designsArray) {
  const archiveGrid = document.getElementById("archive-grid-target");
  if (!archiveGrid) return;

  archiveGrid.innerHTML = designsArray
    .map((design) => {
      let rawCategory = "Uncategorized";
      let categorySlug = "uncategorized";

      if (design.subtitle && design.subtitle.includes(" // ")) {
        rawCategory = design.subtitle.split(" // ")[0].trim();
        categorySlug = rawCategory
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");
      }

      return `
            <div class="portfolio-card filter-item ${categorySlug}">
                <div class="card-img">
                    <img src="${design.heroImage}" alt="${design.title}">
                    <span class="card-badge">${rawCategory}</span>
                </div>
                <div class="card-body">
                    <h3>${design.title}</h3>
                    <p>${design.description}</p>
                    <a href="single-design.html?id=${design.id}" class="text-link">
                        View Blueprints & Space Renders <i class="fa-solid fa-arrow-right-long"></i>
                    </a>
                </div>
            </div>
        `;
    })
    .join("");
}

// Binds clean filter interactions matching your styling parameters
function setupFilterListeners() {
  const buttons = document.querySelectorAll(
    ".portfolio-filter-bar .filter-btn",
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      buttons.forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");

      const selectedFilter = e.currentTarget.getAttribute("data-filter");
      const items = document.querySelectorAll(".filter-item");

      items.forEach((item) => {
        if (
          selectedFilter === "all" ||
          item.classList.contains(selectedFilter)
        ) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 10);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Only execute if the target homepage portfolio node is found on the active layout
  if (document.getElementById("home-featured-grid")) {
    loadFeaturedHomeDesigns();
  }
});

function loadFeaturedHomeDesigns() {
  const gridContainer = document.getElementById("home-featured-grid");

  fetch("data/designs.json")
    .then((res) => res.json())
    .then((designsData) => {
      // Take the first 3 items from the database matrix
      const featuredItems = designsData.slice(0, 3);

      // Reassemble the exact native HTML markup structures dynamically
      gridContainer.innerHTML = featuredItems
        .map(
          (design) => `
                <div class="portfolio-card">
                    <div class="card-img">
                        <img src="${design.heroImage}" alt="${design.title}">
                    </div>
                    <div class="card-body">
                        <h3>${design.title}</h3>
                        <p>${design.description}</p>
                        <a href="single-design.html?id=${design.id}" class="text-link">
                            View Blueprints & Space Renders <i class="fa-solid fa-arrow-right-long"></i>
                        </a>
                    </div>
                </div>
            `,
        )
        .join("");
    })
    .catch((err) => {
      console.error("Failed to load featured designs matrix feed:", err);
      gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Masterpiece directory is temporarily offline.</div>`;
    });
}
document.addEventListener("DOMContentLoaded", () => {
  // Fire the calculation loop if the reviews track container is found on page load
  if (document.getElementById("home-reviews-track")) {
    buildDynamicReviewsEngine();
  }
});

function buildDynamicReviewsEngine() {
  const track = document.getElementById("home-reviews-track");
  const dotsContainer = document.getElementById("home-reviews-dots");

  fetch("data/reviews.json")
    .then((res) => res.json())
    .then((reviewsData) => {
      const reviewsPerPage = 4;
      const totalPages = 5;
      let trackHTML = "";

      // 1. Group your 20 items into 5 horizontal layout blocks (4 items per block)
      for (let i = 0; i < totalPages; i++) {
        const startIdx = i * reviewsPerPage;
        const pageItems = reviewsData.slice(
          startIdx,
          startIdx + reviewsPerPage,
        );

        trackHTML += `
                    <div class="review-page-slice">
                        ${pageItems
                          .map(
                            (item) => `
                            <div class="review-card">
                                <div class="quote-icon"><i class="fa-solid fa-quote-right"></i></div>
                                <p>"${item.review}"</p>
                                <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                                    <img src="${item.avatar}" alt="${item.name}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent-color, #d4af37);">
                                    <div>
                                        <h4 style="margin: 0; color: #ffffff; font-family: 'Cinzel', serif; font-size: 1rem;">${item.name}</h4>
                                        <span style="font-size: 0.8rem; color: var(--accent-color, #d4af37); font-family: 'Inter', sans-serif;">${item.project}</span>
                                    </div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `;
      }
      track.innerHTML = trackHTML;

      // 2. Generate exactly 5 pagination dots mapping the 5 pages
      let dotsHTML = "";
      for (let i = 0; i < totalPages; i++) {
        dotsHTML += `<span class="dot ${i === 0 ? "active" : ""}" data-page="${i}"></span>`;
      }
      dotsContainer.innerHTML = dotsHTML;

      // 3. Launch Interactivity Mechanics (Arrows, Dots, and Automatic Sliding)
      setupSliderInteractivity(track, dotsContainer, totalPages);
    })
    .catch((err) =>
      console.error("Could not run test testimonial matrix load:", err),
    );
}

function setupSliderInteractivity(track, dotsContainer, totalPages) {
  const dots = dotsContainer.querySelectorAll(".dot");
  const prevBtn = document.getElementById("slider-prev-btn");
  const nextBtn = document.getElementById("slider-next-btn");

  let currentPage = 0;
  let autoSlideTimer = null;

  // Viewport sliding translation matrix processor
  function gotoPage(pageIndex) {
    currentPage = pageIndex;

    // Scale shifts evenly across the 5 page sets (100% divided by 5 = 20% translation jumps)
    const shiftPercentage = pageIndex * 20;
    track.style.transform = `translateX(-${shiftPercentage}%)`;

    // Cycle through layout indicators active classes
    dots.forEach((dot, idx) => {
      if (idx === currentPage) dot.classList.add("active");
      else dot.classList.remove("active");
    });

    // Visually fade or dim buttons out at edge boundaries
    if (prevBtn && nextBtn) {
      prevBtn.style.opacity = currentPage === 0 ? "0.3" : "1";
      nextBtn.style.opacity = currentPage === totalPages - 1 ? "0.3" : "1";
    }
  }

  // Logic module managing forward tracking cycles
  function nextSlide() {
    if (currentPage < totalPages - 1) {
      gotoPage(currentPage + 1);
    } else {
      gotoPage(0); // Wrap around to the first page automatically
    }
  }

  // Initialize Auto-Slide Function (Transitions every 6 seconds)
  function startAutoSlide() {
    stopAutoSlide(); // Safety clear
    autoSlideTimer = setInterval(nextSlide, 6000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  // Bind dot indicator selections
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      stopAutoSlide();
      const targetPage = parseInt(e.currentTarget.getAttribute("data-page"));
      gotoPage(targetPage);
      startAutoSlide(); // Resume cycle timer after interaction
    });
  });

  // Bind navigation arrow clicks
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoSlide();
      if (currentPage > 0) gotoPage(currentPage - 1);
      else gotoPage(totalPages - 1); // Wrap backward to last page
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }

  // Boot up first view execution states and engage background loops
  gotoPage(0);
  startAutoSlide();
}
