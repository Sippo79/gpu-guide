const gpuAffiliateLinks = {
  "RTX 3060": createEmptyAffiliateLinks(),
  "RTX 3060 Ti": createEmptyAffiliateLinks(),
  "RTX 3070": createEmptyAffiliateLinks(),
  "RTX 3070 Ti": createEmptyAffiliateLinks(),
  "RTX 3080": createAffiliateLinks({
    rakuten: "https://a.r10.to/hPTDw0",
    amazon: "https://amzn.to/3REumeT",
  }),
  "RTX 4060": createAffiliateLinks({
    rakuten: "https://a.r10.to/hkGGfE",
    amazon: "https://amzn.to/3PGja0D",
  }),
  "RTX 4060 Ti": createAffiliateLinks({
    rakuten: "https://a.r10.to/hFAAqX",
    amazon: "https://amzn.to/4f61LsH",
  }),
  "RTX 4070": createAffiliateLinks({
    rakuten: "https://a.r10.to/h5lQoZ",
    amazon: "https://amzn.to/4dvaIe4",
  }),
  "RTX 4070 SUPER": createAffiliateLinks({
    rakuten: "https://a.r10.to/h5lHSz",
  }),
  "RTX 4070 Ti SUPER": createAffiliateLinks({
    rakuten: "https://a.r10.to/h53CJ4",
    amazon: "https://amzn.to/4f5qCgd",
  }),
  "RTX 4080 SUPER": createAffiliateLinks({
    rakuten: "https://a.r10.to/hkys0x",
    amazon: "https://amzn.to/49fjwSO",
  }),
  "RTX 5060": createAffiliateLinks({
    rakuten: "https://a.r10.to/hkpsZz",
    amazon: "https://amzn.to/49ODTWY",
  }),
  "RTX 5060 Ti": createAffiliateLinks({
    rakuten: "https://a.r10.to/hFAAgo",
    amazon: "https://amzn.to/3RrYUR9",
  }),
  "RTX 5070": createAffiliateLinks({
    rakuten: "https://a.r10.to/hkSdhv",
    amazon: "https://amzn.to/xxxxx",
  }),
  "RTX 5070 Ti": createAffiliateLinks({
    rakuten: "https://a.r10.to/hPcwmv",
    amazon: "https://amzn.to/42RGjAw",
  }),
  "RTX 5080": createAffiliateLinks({
    rakuten: "https://a.r10.to/hko5fa",
    amazon: "https://amzn.to/4dIIhIs",
  }),
  "RTX 5090": createAffiliateLinks({
    rakuten: "https://a.r10.to/h8WZ1x",
    amazon: "https://amzn.to/4dtIlwP",
  }),
  "RX 6600": createEmptyAffiliateLinks(),
  "RX 6700 XT": createEmptyAffiliateLinks(),
  "RX 6800 XT": createEmptyAffiliateLinks(),
  "RX 7600": createEmptyAffiliateLinks(),
  "RX 7700 XT": createAffiliateLinks({
    rakuten: "https://a.r10.to/hgs8If",
    amazon: "https://amzn.to/4dZhzfM",
  }),
  "RX 7800 XT": createAffiliateLinks({
    rakuten: "https://a.r10.to/hgEfCo",
    amazon: "https://amzn.to/4tQZZiM",
  }),
  "RX 7900 GRE": createAffiliateLinks({
    rakuten: "https://a.r10.to/h5wlC5",
    amazon: "https://amzn.to/4dskY6H",
  }),
  "RX 7900 XT": createAffiliateLinks({
    rakuten: "https://a.r10.to/hPFmPH",
    amazon: "https://amzn.to/4eZvZxw",
  }),
  "RX 7900 XTX": createAffiliateLinks({
    rakuten: "https://a.r10.to/hgs8tW",
    amazon: "https://amzn.to/4fECru3",
  }),
  "RX 9070": createAffiliateLinks({
    rakuten: "https://a.r10.to/hk2Oby",
    amazon: "https://amzn.to/49lJq7n",
  }),
  "RX 9070 XT": createAffiliateLinks({
    rakuten: "https://a.r10.to/h5394b",
    amazon: "https://amzn.to/4wOgOxo",
  }),
};

window.gpuAffiliateLinks = gpuAffiliateLinks;

function createAffiliateLinks(links = {}) {
  return {
    rakuten: "",
    amazon: "",
    yahoo: "",
    bto: "",
    monitor: "",
    ...links,
  };
}

function createEmptyAffiliateLinks() {
  return createAffiliateLinks();
}
