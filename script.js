const gpuGrid = document.getElementById("gpuGrid");
const gpuSearch = document.getElementById("gpuSearch");
const brandFilter = document.getElementById("brandFilter");
const resolutionFilter = document.getElementById("resolutionFilter");
const sortSelect = document.getElementById("sortSelect");

let gpus = [];

async function loadGpus() {
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

gpuSearch.addEventListener("input", renderGpus);
brandFilter.addEventListener("change", renderGpus);
resolutionFilter.addEventListener("change", renderGpus);
sortSelect.addEventListener("change", renderGpus);

loadGpus();