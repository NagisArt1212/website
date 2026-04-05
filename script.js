const schedule = [
  { date: "2026-03-30", label: "3/30 Mon", title: "21:00 - 深夜雑談「今週のスタート会議」", live: true },
  { date: "2026-03-31", label: "3/31 Tue", title: "おやすみ", live: false },
  { date: "2026-04-01", label: "4/1 Wed", title: "20:30 - 歌枠「透明感プレイリスト」", live: true },
  { date: "2026-04-02", label: "4/2 Thu", title: "おやすみ", live: false },
  { date: "2026-04-03", label: "4/3 Fri", title: "22:00 - ゲーム配信「夜更かしアドベンチャー」", live: true },
  { date: "2026-04-04", label: "4/4 Sat", title: "21:30 - 参加型雑談「なぎの葉集会」", live: true },
  { date: "2026-04-05", label: "4/5 Sun", title: "おやすみ", live: false }
];

const nextStreamElement = document.querySelector("#next-stream");
const weekRangeElement = document.querySelector("#week-range");
const contactForm = document.querySelector(".contact-form");
const previewTitle = document.querySelector("#fanart-preview-title");
const previewArtist = document.querySelector("#fanart-preview-artist");
const categoryChips = Array.from(document.querySelectorAll(".category-chip"));

const fanartData = window.siteFanartData || { featured: [], archive: [] };
const diaryData = window.siteDiaryData || { posts: [] };

if (weekRangeElement) {
  const first = schedule[0]?.date?.replaceAll("-", "/");
  const last = schedule[schedule.length - 1]?.date?.replaceAll("-", "/");
  weekRangeElement.textContent = `${first} - ${last}`;
}

if (nextStreamElement) {
  const today = new Date("2026-03-29T00:00:00+09:00");
  const upcoming = schedule.find((item) => item.live && new Date(`${item.date}T00:00:00+09:00`) >= today);
  nextStreamElement.textContent = upcoming ? `${upcoming.label} / ${upcoming.title}` : "次回予定は調整中";
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert("お問い合わせありがとうございます。内容を確認して、順次ご連絡します。");
    contactForm.reset();
  });
}

const renderTopDiary = (posts) => {
  const target = document.querySelector("#top-diary-list");
  if (!target) return;

  target.innerHTML = posts
    .slice(0, 3)
    .map(
      (post) => `
        <article class="diary-card card">
          <p class="panel-label">${post.category}</p>
          <p class="diary-date">${post.date}</p>
          <h3>${post.title}</h3>
          <p>${post.body}</p>
        </article>
      `
    )
    .join("");
};

const renderDiaryArchive = (posts) => {
  const target = document.querySelector("#archive-diary-list");
  if (!target) return;

  target.innerHTML = posts
    .map(
      (post) => `
        <article class="archive-diary-card card" data-category="${post.category}">
          <p class="panel-label">${post.category}</p>
          <p class="diary-date">${post.date}</p>
          <h2>${post.title}</h2>
          <p>${post.body}</p>
        </article>
      `
    )
    .join("");
};

const renderFanartPreview = (featured) => {
  const slider = document.querySelector("#fanart-preview-slider");
  if (!slider) return;

  slider.innerHTML = featured
    .map(
      (item, index) => `
        <div class="fanart-slide ${index === 0 ? "is-active" : ""}" data-title="${item.title}" data-artist="${item.credit}">
          <img class="fanart-slide-art preview-slide-image" src="${item.image}" alt="${item.alt}" />
        </div>
      `
    )
    .join("");

  if (featured[0] && previewTitle && previewArtist) {
    previewTitle.textContent = featured[0].title;
    previewArtist.textContent = featured[0].credit;
  }
};

const renderFanartGallery = (featured) => {
  const stage = document.querySelector("#fanart-gallery-stage");
  const dots = document.querySelector("#fanart-gallery-dots");
  if (!stage || !dots) return;

  stage.innerHTML = featured
    .map(
      (item, index) => `
        <article class="gallery-slide ${index === 0 ? "is-active" : ""}">
          <img class="gallery-slide-art gallery-slide-image" src="${item.image}" alt="${item.alt}" />
          <div class="gallery-slide-copy">
            <p class="panel-label">Latest Artwork ${String(index + 1).padStart(2, "0")}</p>
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <span>${item.credit}</span>
          </div>
        </article>
      `
    )
    .join("");

  dots.innerHTML = featured
    .map(
      (_, index) => `
        <button class="gallery-dot ${index === 0 ? "is-active" : ""}" type="button" data-slide-to="${index}" aria-label="${index + 1}枚目"></button>
      `
    )
    .join("");
};

const renderFanartArchive = (items) => {
  const target = document.querySelector("#fanart-archive-list");
  if (!target) return;

  target.innerHTML = items
    .map(
      (item) => `
        <article class="artwork-card card">
          <img class="artwork-thumb artwork-image" src="${item.image}" alt="${item.alt}" />
          <div class="artwork-body">
            <p class="panel-label">${item.label}</p>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <p class="artwork-meta">${item.meta}</p>
          </div>
        </article>
      `
    )
    .join("");
};

const activateSlide = (slides, index, dots = []) => {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === index);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });

  if (previewTitle && previewArtist && slides[index]?.dataset.title) {
    previewTitle.textContent = slides[index].dataset.title;
    previewArtist.textContent = slides[index].dataset.artist || "";
  }
};

const startSlider = (selector, intervalMs, withDots = false) => {
  const container = document.querySelector(`[data-slider="${selector}"]`);
  if (!container) return;

  const slides = Array.from(container.children);
  if (slides.length <= 1) return;

  const dots = withDots ? Array.from(document.querySelectorAll(".gallery-dot")) : [];
  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;

  activateSlide(slides, currentIndex, dots);

  if (dots.length) {
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        currentIndex = dotIndex;
        activateSlide(slides, currentIndex, dots);
      });
    });
  }

  window.setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    activateSlide(slides, currentIndex, dots);
  }, intervalMs);
};

const bindDiaryFilter = () => {
  const archiveDiaryCards = Array.from(document.querySelectorAll(".archive-diary-card"));
  if (!categoryChips.length || !archiveDiaryCards.length) return;

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const selectedCategory = chip.dataset.category || "all";

      categoryChips.forEach((button) => {
        button.classList.toggle("is-active", button === chip);
      });

      archiveDiaryCards.forEach((card) => {
        const matches = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
};

renderFanartPreview(fanartData.featured);
renderFanartGallery(fanartData.featured);
renderFanartArchive(fanartData.archive);
renderTopDiary(diaryData.posts);
renderDiaryArchive(diaryData.posts);

startSlider("fanart-preview", 3200);
startSlider("fanart-gallery", 4200, true);
bindDiaryFilter();
