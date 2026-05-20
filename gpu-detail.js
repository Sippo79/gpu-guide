const gpuDetail = document.getElementById("gpuDetail");

let allGpus = [];

const purchaseSearchSites = [
  {
    name: "Amazon",
    label: "Amazonで探す",
    note: "GPU名で検索結果を開く",
    buildUrl: (gpuName) => `https://www.amazon.co.jp/s?k=${encodeURIComponent(gpuName)}`,
  },
  {
    name: "楽天市場",
    label: "楽天市場で探す",
    note: "GPU名で検索結果を開く",
    buildUrl: (gpuName) => `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(gpuName)}/`,
  },
  {
    name: "パソコン工房",
    label: "パソコン工房で探す",
    note: "GPU名で検索結果を開く",
    buildUrl: (gpuName) => `https://www.pc-koubou.jp/user_data/search.php?q=${encodeURIComponent(gpuName)}`,
  },
];

async function loadGpuDetail() {
  const params = new URLSearchParams(window.location.search);
  const gpuId = params.get("id");

  if (!gpuId) {
    showNotFound();
    return;
  }

  try {
    const response = await fetch("gpus.json");

    if (!response.ok) {
      throw new Error("GPUデータの読み込みに失敗しました");
    }

allGpus = await response.json();
const gpu = allGpus.find((item) => item.id === gpuId);

    if (!gpu) {
      showNotFound();
      return;
    }

    renderGpuDetail(gpu);
  } catch (error) {
    gpuDetail.innerHTML = `
      <div class="empty-message">
        GPUデータを読み込めませんでした。
      </div>
    `;
    console.error(error);
  }
}

function getRank(score) {
  if (score >= 95) return "ULTRA";
  if (score >= 85) return "HIGH";
  if (score >= 70) return "MIDDLE HIGH";
  if (score >= 55) return "MIDDLE";
  return "ENTRY";
}

function getTargetText(target) {
  if (target === "FHD") return "フルHDゲーミング向け";
  if (target === "WQHD") return "WQHDゲーミング向け";
  if (target === "4K") return "4K・重量級ゲーム向け";
  return "ゲーミング向け";
}

function getPowerSupply(power) {
  if (power >= 500) return "850W〜1000W以上";
  if (power >= 350) return "750W〜850W以上";
  if (power >= 250) return "650W〜750W以上";
  return "550W〜650W以上";
}

function renderPurchaseSearchLinks(gpuName) {
  return purchaseSearchSites.map((site) => `
    <a
      href="${site.buildUrl(gpuName)}"
      class="purchase-link-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>${site.name}</span>
      <strong>${site.label}</strong>
      <small>${site.note}</small>
    </a>
  `).join("");
}

function renderGpuDetail(gpu) {
  const rank = getRank(gpu.score);

  document.title = `${gpu.name}の性能｜GPU性能比較ガイド`;

  gpuDetail.innerHTML = `
    <div class="gpu-detail-layout">
      <article class="gpu-detail-main">
        <div class="gpu-card-top">
          <span class="gpu-brand">${gpu.brand}</span>
          <span class="gpu-resolution">${gpu.target}向け</span>
        </div>

        <h1>${gpu.name}</h1>

        <p class="gpu-detail-lead">
          ${gpu.summary}
        </p>

        <div class="gpu-score-box detail-score">
          <div class="gpu-score-head">
            <span>性能スコア</span>
            <strong>${gpu.score}/100</strong>
          </div>

          <div class="performance-bar">
            <span style="width: ${gpu.score}%;"></span>
          </div>
        </div>
      </article>

      <aside class="gpu-detail-side">
        <p class="detail-label">GPU RANK</p>
        <h2>${rank}</h2>
        <p>${getTargetText(gpu.target)}</p>
      </aside>
    </div>

    <section class="section">
      <div class="gpu-info-grid">
        <article class="gpu-info-card">
          <p class="info-label">VRAM</p>
          <h3>${gpu.vram}GB</h3>
          <p>高画質設定や重量級ゲームではVRAM容量が重要です。</p>
        </article>

        <article class="gpu-info-card">
          <p class="info-label">価格目安</p>
          <h3>${gpu.price.toLocaleString()}円前後</h3>
          <p>価格は時期によって変動するため、あくまで目安として見てください。</p>
        </article>

        <article class="gpu-info-card">
          <p class="info-label">消費電力目安</p>
          <h3>${gpu.power}W</h3>
          <p>電源容量やケース内の冷却もあわせて確認したいポイントです。</p>
        </article>

        <article class="gpu-info-card">
          <p class="info-label">推奨電源</p>
          <h3>${getPowerSupply(gpu.power)}</h3>
          <p>CPUや他パーツ構成によって必要な電源容量は変わります。</p>
        </article>
      </div>
    </section>

    <section class="section purchase-section">
      <div class="section-heading">
        <p class="section-label">SHOP SEARCH</p>
        <h2>販売サイトで探す</h2>
        <p>${gpu.name} の検索結果ページを開きます。商品直リンクやアフィリエイトリンクではありません。</p>
      </div>

      <div class="purchase-link-grid">
        ${renderPurchaseSearchLinks(gpu.name)}
      </div>
    </section>

    <section class="section">
      <div class="gpu-detail-extra-grid">
        <article class="gpu-extra-card">
          <p class="info-label">おすすめゲーム</p>
          <h3>このGPUで遊びやすいゲーム</h3>
          <ul class="gpu-list">
            ${(gpu.games || []).map((game) => `<li>${game}</li>`).join("")}
          </ul>
        </article>

        <article class="gpu-extra-card">
          <p class="info-label">おすすめCPU</p>
          <h3>組み合わせやすいCPU</h3>
          <ul class="gpu-list">
            ${(gpu.cpus || []).map((cpu) => `<li>${cpu}</li>`).join("")}
          </ul>
        </article>

        <article class="gpu-extra-card gpu-extra-card-wide">
          <p class="info-label">比較されやすいGPU</p>
          <h3>近い性能帯のGPU</h3>
          <div class="compare-link-grid">
            ${(gpu.compare || []).map((id) => {
  const targetGpu = allGpus.find((item) => item.id === id);

  if (!targetGpu) return "";

  return `
    <a href="gpu.html?id=${targetGpu.id}" class="compare-link-card">
      <span>${targetGpu.brand}</span>
      <strong>${targetGpu.name}</strong>
    </a>
  `;
}).join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function showNotFound() {
  gpuDetail.innerHTML = `
    <div class="empty-message">
      GPUが見つかりませんでした。URLを確認してください。
    </div>
  `;
}

loadGpuDetail();
