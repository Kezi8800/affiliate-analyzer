const AMAZON_TAG_RULES = [
  {
    publisher: "BuzzFeed",
    groupKey: "buzzfeed",
    category: "commerce_media",

    // 精确匹配
    amazonTags: ["buzz0f-20", "buzzfeed-20"],

    // ⭐ v2.5：支持 editor / creator / author tag
    tagPrefixes: [
      "buzz0f",
      "buzzfeed",
      "bf",
      "bfh",
      "bfshop",
      "bfshopping"
    ],

    // ⭐ v2.5：支持 ascsubtag / btn_ref / ref 反推
    keywords: [
      "buzzfeed",
      "bf-shp",
      "bf-shopping",
      "bf-sfp",
      "bf-shop",
      "bfcommerce",
      "bf-"
    ],

    notes: "Matched BuzzFeed commerce signal (media + editor + creator level)."
  },

  {
    publisher: "CNET",
    groupKey: "ziff_davis",
    category: "commerce_media",
    amazonTags: ["cnet-api-20", "cnet-buy-button-20"],
    tagPrefixes: ["cnet"],
    keywords: ["cnet"],
    notes: "Matched CNET Amazon Associates tag."
  },

  {
    publisher: "PCMag",
    groupKey: "ziff_davis",
    category: "review_site",
    amazonTags: ["p00935-20"],
    tagPrefixes: ["pcmag", "pcmagcom"],
    keywords: ["pcmag"],
    notes: "Matched PCMag Amazon Associates tag."
  },

  {
    publisher: "Tom's Guide",
    groupKey: "future",
    category: "review_site",
    tagPrefixes: ["tomsguide", "tomsguide-us"],
    keywords: ["tomsguide", "toms-guide"],
    notes: "Matched Tom's Guide Amazon publisher signal."
  },

  {
    publisher: "TechRadar",
    groupKey: "future",
    category: "review_site",
    tagPrefixes: ["techradar"],
    keywords: ["techradar"],
    notes: "Matched TechRadar Amazon publisher signal."
  },

  {
    publisher: "Slickdeals",
    groupKey: "deal_community",
    category: "deal_site",
    tagPrefixes: ["slickdeals", "slickdeal", "sd-"],
    keywords: ["slickdeals"],
    notes: "Matched Slickdeals Amazon publisher signal."
  },

  {
    publisher: "Wirecutter",
    groupKey: "nyt",
    category: "review_site",
    tagPrefixes: ["wirecutter", "nytwirecutter"],
    keywords: ["wirecutter"],
    notes: "Matched Wirecutter Amazon publisher signal."
  },

  {
    publisher: "Forbes Vetted",
    groupKey: "forbes",
    category: "commerce_media",
    tagPrefixes: ["forbes", "forbesvetted"],
    keywords: ["forbes", "vetted"],
    notes: "Matched Forbes commerce publisher signal."
  },

  {
    publisher: "CNN Underscored",
    groupKey: "cnn",
    category: "commerce_media",
    tagPrefixes: ["cnnunderscored", "cnn-underscored"],
    keywords: ["cnn-underscored", "underscored"],
    notes: "Matched CNN Underscored publisher signal."
  },

  {
    publisher: "Reviewed / USA Today",
    groupKey: "gannett",
    category: "review_site",
    tagPrefixes: ["reviewed", "usatoday", "reviewedcom"],
    keywords: ["reviewed", "usatoday"],
    notes: "Matched Reviewed / USA Today publisher signal."
  }
];
