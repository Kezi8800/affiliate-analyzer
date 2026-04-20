(function () {
  const API_ENDPOINT = "https://tools.brandshuo.com/api/analyze";

  const input = document.getElementById("bs-input-url");
  const detectBtn = document.getElementById("bs-detect-btn");
  const clearBtn = document.getElementById("bs-clear-btn");
  const status = document.getElementById("bs-status");
  const results = document.getElementById("bs-results");
  const rawJson = document.getElementById("bs-raw-json");

  function setStatus(msg, show = true) {
    if (!status) {
      alert("没找到 #bs-status");
      return;
    }
    status.textContent = msg || "";
    status.classList.toggle("show", !!show);
  }

  async function detect() {
    alert("Detect 按钮已点击");

    if (!input) {
      alert("没找到输入框 #bs-input-url");
      return;
    }

    const url = input.value.trim();

    if (!url) {
      alert("请输入 URL");
      setStatus("Please paste a URL first.");
      return;
    }

    setStatus("正在请求接口...");
    console.log("request url =", API_ENDPOINT);
    console.log("input url =", url);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      alert("接口已返回，HTTP 状态: " + res.status);

      const text = await res.text();
      console.log("response text =", text);

      if (rawJson) {
        rawJson.textContent = text;
      }

      if (results) {
        results.classList.add("show");
      }

      if (!res.ok) {
        setStatus("接口报错: " + res.status);
        alert("接口报错:\n" + text);
        return;
      }

      setStatus("请求成功");
      alert("请求成功，已收到返回数据");
    } catch (err) {
      console.error(err);
      setStatus("请求失败: " + (err.message || "unknown error"));
      alert("fetch 失败:\n" + (err.message || "unknown error"));
    }
  }

  function init() {
    alert("analyze.js 已加载");

    if (!detectBtn) {
      alert("没找到按钮 #bs-detect-btn");
      return;
    }

    detectBtn.addEventListener("click", detect);

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (input) input.value = "";
        if (rawJson) rawJson.textContent = "";
        if (results) results.classList.remove("show");
        setStatus("", false);
      });
    }

    setStatus("页面已加载", false);
    console.log("bind success");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
