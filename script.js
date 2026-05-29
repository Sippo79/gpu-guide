const affiliateLinks = {
  amazon: "https://example.com/amazon-gpu?q=",
  rakuten: "https://search.rakuten.co.jp/search/mall/",
  yahoo: "https://shopping.yahoo.co.jp/search?p=",
  bto: "https://example.com/bto-gpu?q=",
  monitor: "https://example.com/monitor",
};

const affiliateLinkData = window.gpuAffiliateLinks || {};
const rakutenGpuLinks = Object.fromEntries(
  Object.entries(affiliateLinkData)
    .filter(([, links]) => links.rakuten)
    .map(([gpuName, links]) => [gpuName, links.rakuten])
);

const affiliateRel = "nofollow sponsored noopener noreferrer";
const pendingAffiliateTypes = new Set(["bto", "monitor"]);
const affiliateTypeAliases = {
  amazonGpu: "amazon",
  rakutenGpu: "rakuten",
  btoGpu: "bto",
};

function normalizeGpuName(gpuName = "") {
  return gpuName
    .trim()
    .replace(/^GeForce\s+/i, "")
    .replace(/^AMD\s+Radeon\s+/i, "")
    .replace(/^Radeon\s+/i, "")
    .replace(/\s+/g, " ");
}

function getGpuNameLookupValue(gpuName = "") {
  return normalizeGpuName(gpuName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getGpuAffiliateLink(gpuName, type) {
  const affiliateType = affiliateTypeAliases[type] || type;
  const normalizedGpuName = normalizeGpuName(gpuName);
  const gpuNameLookupValue = getGpuNameLookupValue(gpuName);
  const matchedGpuName = Object.keys(affiliateLinkData).find((linkGpuName) => {
    const normalizedLinkGpuName = normalizeGpuName(linkGpuName);
    const linkGpuNameLookupValue = getGpuNameLookupValue(linkGpuName);

    return (
      linkGpuName === gpuName ||
      linkGpuName === normalizedGpuName ||
      normalizedLinkGpuName.toLowerCase() === normalizedGpuName.toLowerCase() ||
      linkGpuNameLookupValue === gpuNameLookupValue
    );
  });

  if (!matchedGpuName) {
    return "";
  }

  return affiliateLinkData[matchedGpuName][affiliateType] || "";
}

function getRakutenGpuAffiliateUrl(gpuName) {
  return getGpuAffiliateLink(gpuName, "rakuten");
}

function buildAffiliateUrl(type, gpuName = "") {
  const affiliateType = affiliateTypeAliases[type] || type;

  if (pendingAffiliateTypes.has(affiliateType)) {
    return "";
  }

  const gpuAffiliateUrl = getGpuAffiliateLink(gpuName, affiliateType);

  if (gpuAffiliateUrl) {
    return gpuAffiliateUrl;
  }

  if (affiliateType === "monitor") {
    return affiliateLinks.monitor;
  }

  if (affiliateType === "rakuten") {
    const rakutenQuery = encodeURIComponent(`${gpuName} グラフィックボード`);
    return `${affiliateLinks.rakuten}${rakutenQuery}/`;
  }

  const baseUrl = affiliateLinks[affiliateType];

  if (!baseUrl) {
    return "";
  }

  const gpuQuery = encodeURIComponent(gpuName);
  return `${baseUrl}${gpuQuery}`;
}

function getAffiliateItems(gpuName) {
  return [
    {
      type: "amazon",
      name: "Amazon",
      label: "このGPUをAmazonで探す",
      note: "GPU名に合う商品を検索",
    },
    {
      type: "rakuten",
      name: "Rakuten",
      label: "このGPUを楽天で探す",
      note: "楽天市場の検索結果を開く",
    },
    {
      type: "yahoo",
      name: "Yahoo",
      label: "このGPUをYahoo!ショッピングで探す",
      note: "Yahoo!ショッピングの検索結果を開く",
    },
    {
      type: "bto",
      name: "BTOサイト（準備中）",
      label: "リンク先を準備中です",
      note: "準備ができ次第、ボタンを有効化します",
    },
    {
      type: "monitor",
      name: "ゲーミングモニター（準備中）",
      label: "リンク先を準備中です",
      note: "準備ができ次第、ボタンを有効化します",
    },
  ].map((item) => ({
    ...item,
    disabled: pendingAffiliateTypes.has(item.type),
    url: buildAffiliateUrl(item.type, gpuName),
  }));
}

function renderAffiliateDisclosure() {
  return `
    <p class="affiliate-disclosure">
      当サイトではアフィリエイト広告を利用しています。リンク先で商品を購入すると、運営者に収益が発生する場合があります。
      Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
    </p>
  `;
}

function renderPurchaseSearchLinks(gpuName) {
  return getAffiliateItems(gpuName).map((site) => {
    if (site.disabled || !site.url) {
      return `
        <div
          class="purchase-link-card purchase-link-card-disabled"
          role="link"
          aria-disabled="true"
        >
          <span>${site.name}</span>
          <strong>${site.label}</strong>
          <small>${site.note}</small>
        </div>
      `;
    }

    return `
      <a
        href="${site.url}"
        class="purchase-link-card"
        target="_blank"
        rel="${affiliateRel}"
      >
        <span>${site.name}</span>
        <strong>${site.label}</strong>
        <small>${site.note}</small>
      </a>
    `;
  }).join("");
}

window.gpuGuideAffiliate = {
  affiliateLinks,
  gpuAffiliateLinks: affiliateLinkData,
  rakutenGpuLinks,
  affiliateRel,
  pendingAffiliateTypes,
  affiliateTypeAliases,
  normalizeGpuName,
  getGpuNameLookupValue,
  getGpuAffiliateLink,
  buildAffiliateUrl,
  getAffiliateItems,
  renderAffiliateDisclosure,
  renderPurchaseSearchLinks,
};

const gpuGrid = document.getElementById("gpuGrid");
const gpuSearch = document.getElementById("gpuSearch");
const brandFilter = document.getElementById("brandFilter");
const resolutionFilter = document.getElementById("resolutionFilter");
const sortSelect = document.getElementById("sortSelect");
const gpuRankingList = document.getElementById("gpuRankingList");
const rankingTabs = document.querySelectorAll(".ranking-tab");

let gpus = [];
let activeRankingType = "overall";

const rankingConfigs = {
  overall: {
    filter: () => true,
    sort: (a, b) => getGpuScore(b) - getGpuScore(a),
  },
  fhd: {
    filter: (gpu) => gpu.target === "FHD",
    sort: (a, b) => getGpuScore(b) - getGpuScore(a),
  },
  wqhd: {
    filter: (gpu) => gpu.target === "WQHD",
    sort: (a, b) => getGpuScore(b) - getGpuScore(a),
  },
  "4k": {
    filter: (gpu) => gpu.target === "4K",
    sort: (a, b) => getGpuScore(b) - getGpuScore(a),
  },
  value: {
    filter: (gpu) => Number(getGpuPrice(gpu)) > 0,
    sort: (a, b) => getGpuValueScore(b) - getGpuValueScore(a),
  },
};

async function loadGpus() {
  if (!gpuGrid && !gpuRankingList) return;

  try {
    const response = await fetch("gpus.json");

    if (!response.ok) {
      throw new Error("GPUデータの読み込みに失敗しました");
    }

    gpus = await response.json();
    renderGpus();
    renderGpuRanking();
  } catch (error) {
    const errorMessage = `
      <div class="empty-message">
        GPUデータを読み込めませんでした。ファイル名や配置場所を確認してください。
      </div>
    `;

    if (gpuGrid) gpuGrid.innerHTML = errorMessage;
    if (gpuRankingList) gpuRankingList.innerHTML = errorMessage;
    console.error(error);
  }
}

function renderGpus() {
  if (!gpuGrid || !gpuSearch || !brandFilter || !resolutionFilter || !sortSelect) return;

  const searchValue = gpuSearch.value.trim().toLowerCase();
  const brandValue = brandFilter.value;
  const resolutionValue = resolutionFilter.value;
  const sortValue = sortSelect.value;

  let filteredGpus = [...gpus];

  if (searchValue !== "") {
    filteredGpus = filteredGpus.filter((gpu) =>
      gpu.name.toLowerCase().includes(searchValue) ||
      gpu.id.toLowerCase().includes(searchValue)
    );
  }

  if (brandValue !== "all") {
    filteredGpus = filteredGpus.filter((gpu) => gpu.brand === brandValue);
  }

  if (resolutionValue !== "all") {
    filteredGpus = filteredGpus.filter((gpu) => gpu.target === resolutionValue);
  }

  filteredGpus.sort((a, b) => {
    if (sortValue === "performance") return b.score - a.score;
    if (sortValue === "price") return a.price - b.price;
    if (sortValue === "vram") return b.vram - a.vram;
    return 0;
  });

  if (filteredGpus.length === 0) {
    gpuGrid.innerHTML = `
      <div class="empty-message">
        条件に合うGPUが見つかりませんでした。
      </div>
    `;
    return;
  }

  gpuGrid.innerHTML = filteredGpus.map(createGpuCard).join("");
}

function createGpuCard(gpu) {
  return `
    <a href="gpu.html?id=${gpu.id}" class="gpu-card">
      <div class="gpu-card-top">
        <span class="gpu-brand">${gpu.brand}</span>
        <span class="gpu-resolution">${gpu.target}向け</span>
      </div>

      <h3>${gpu.name}</h3>

      <p class="gpu-summary">${gpu.summary}</p>

      <div class="gpu-specs">
        <div class="gpu-spec">
          <span>VRAM</span>
          <strong>${gpu.vram}GB</strong>
        </div>

        <div class="gpu-spec">
          <span>価格目安</span>
          <strong>${formatGpuPrice(gpu)}</strong>
        </div>

        <div class="gpu-spec">
          <span>消費電力目安</span>
          <strong>${gpu.power}W</strong>
        </div>
      </div>

      <div class="gpu-score-box">
        <div class="gpu-score-head">
          <span>性能スコア</span>
          <strong>${gpu.score}/100</strong>
        </div>

        <div class="performance-bar">
          <span style="width: ${gpu.score}%;"></span>
        </div>
      </div>
    </a>
  `;
}

function getGpuScore(gpu) {
  return Number(gpu.score ?? gpu.benchmarkScore ?? 0);
}

function getGpuPrice(gpu) {
  const price = Number(gpu.price ?? gpu.estimatedPrice);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function formatGpuPrice(gpu) {
  const price = getGpuPrice(gpu);

  if (!price) {
    return "価格未設定";
  }

  if (price >= 10000) {
    return `約${Math.floor(price / 10000)}万円`;
  }

  return `約${Math.floor(price / 1000) * 1000}円`;
}

function getGpuValueScore(gpu) {
  const price = getGpuPrice(gpu);
  return price ? getGpuScore(gpu) / (price / 10000) : 0;
}

function getGpuUseCase(gpu) {
  const score = getGpuScore(gpu);

  if (score >= 92) return "4K高画質・重量級ゲーム・クリエイティブ用途";
  if (score >= 84) return "WQHD高画質・4K入門・重めのゲーム";
  if (score >= 70) return "WQHDゲーミング・高画質設定";
  if (score >= 56) return "FHD高画質・WQHD入門";
  return "FHDゲーミング・軽めのゲーム";
}

function getRankingGpus(type = activeRankingType) {
  const config = rankingConfigs[type] || rankingConfigs.overall;

  return [...gpus]
    .filter((gpu) => Number.isFinite(getGpuScore(gpu)) && config.filter(gpu))
    .sort(config.sort);
}

function renderGpuRanking() {
  if (!gpuRankingList) return;

  const rankingGpus = getRankingGpus();

  if (rankingGpus.length === 0) {
    gpuRankingList.innerHTML = `
      <div class="empty-message">
        表示できるGPUランキングがありません。
      </div>
    `;
    return;
  }

  gpuRankingList.innerHTML = rankingGpus.map(createRankingRow).join("");
}

function createRankingRow(gpu, index) {
  const rank = index + 1;
  const topRankClass = rank <= 3 ? ` ranking-row-top ranking-row-top-${rank}` : "";

  return `
    <a href="gpu.html?id=${gpu.id}" class="ranking-row${topRankClass}">
      <span class="ranking-rank" data-label="順位">
        <strong>${rank}</strong>
      </span>

      <span class="ranking-gpu" data-label="GPU名">
        <strong>${gpu.name}</strong>
        <small>${gpu.brand}</small>
      </span>

      <span class="ranking-score" data-label="性能スコア">
        <strong>${getGpuScore(gpu)}</strong>
        <span class="ranking-score-bar">
          <span style="width: ${getGpuScore(gpu)}%;"></span>
        </span>
      </span>

      <span class="ranking-price" data-label="目安価格">${formatGpuPrice(gpu)}</span>
      <span class="ranking-use" data-label="用途の目安">${getGpuUseCase(gpu)}</span>
    </a>
  `;
}

if (gpuGrid && gpuSearch && brandFilter && resolutionFilter && sortSelect) {
  gpuSearch.addEventListener("input", renderGpus);
  brandFilter.addEventListener("change", renderGpus);
  resolutionFilter.addEventListener("change", renderGpus);
  sortSelect.addEventListener("change", renderGpus);
}

if (rankingTabs.length > 0) {
  rankingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeRankingType = tab.dataset.rankingType || "overall";

      rankingTabs.forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });

      renderGpuRanking();
    });
  });
}

loadGpus();
