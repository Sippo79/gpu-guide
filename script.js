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
    return "#";
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
      name: "BTO PC",
      label: "このGPU搭載BTOパソコンを探す",
      note: "完成品PCの候補を確認",
    },
    {
      type: "monitor",
      name: "Monitor",
      label: "GPU性能に合うゲーミングモニターを見る",
      note: "解像度やリフレッシュレートも一緒に検討",
    },
  ].map((item) => ({
    ...item,
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
  return getAffiliateItems(gpuName).map((site) => `
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
  `).join("");
}

window.gpuGuideAffiliate = {
  affiliateLinks,
  gpuAffiliateLinks: affiliateLinkData,
  rakutenGpuLinks,
  affiliateRel,
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

let gpus = [];

async function loadGpus() {
  if (!gpuGrid) return;

  try {
    const response = await fetch("gpus.json");

    if (!response.ok) {
      throw new Error("GPUデータの読み込みに失敗しました");
    }

    gpus = await response.json();
    renderGpus();
  } catch (error) {
    gpuGrid.innerHTML = `
      <div class="empty-message">
        GPUデータを読み込めませんでした。ファイル名や配置場所を確認してください。
      </div>
    `;
    console.error(error);
  }
}

function renderGpus() {
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
          <strong>${gpu.price.toLocaleString()}円前後</strong>
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

if (gpuGrid && gpuSearch && brandFilter && resolutionFilter && sortSelect) {
  gpuSearch.addEventListener("input", renderGpus);
  brandFilter.addEventListener("change", renderGpus);
  resolutionFilter.addEventListener("change", renderGpus);
  sortSelect.addEventListener("change", renderGpus);

  loadGpus();
}
