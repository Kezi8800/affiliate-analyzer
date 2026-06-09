// BrandShuo Attribution Intelligence — Node.js SDK
// npm package ready · Zero dependencies · TypeScript-friendly (JSDoc)
//
// Install:  npm install brandshuo-attribution
// Usage:
//   const BrandShuo = require('brandshuo-attribution');
//   const client = new BrandShuo({ apiKey: 'bsak_xxx' });
//   const result = await client.analyze('https://example.com/?tag=test');

/**
 * @typedef {Object} BrandShuoOptions
 * @property {string} [apiUrl='https://tools.brandshuo.com/api'] - API base URL
 * @property {string} [apiKey] - Your BrandShuo API key
 * @property {number} [timeout=15000] - Request timeout in ms
 */

/**
 * @typedef {Object} AnalyzeResult
 * @property {boolean} ok
 * @property {string} platform
 * @property {string} network
 * @property {string} publisher
 * @property {string} publisher_id
 * @property {string} publisher_url
 * @property {string} publisher_group
 * @property {number} quality_score
 * @property {string} incrementality_risk
 * @property {string} channel_role
 * @property {string} confidence
 * @property {Object} path_classification
 * @property {Object} publisher_intelligence
 */

/**
 * @typedef {Object} BatchResult
 * @property {boolean} ok
 * @property {Object} stats - { total, success, failed, networks, publishers, duration_ms }
 * @property {Array<{url: string, ok: boolean, platform: string, network: string, publisher: string}>} results
 */

/**
 * @typedef {Object} TraceResult
 * @property {boolean} ok
 * @property {string} original_url
 * @property {string} final_url
 * @property {number} total_hops
 * @property {Array<{url: string, status_code: number, redirect_to: string}>} redirect_chain
 * @property {Object} final_analysis - AnalyzeResult subset
 */

class BrandShuo {
  /**
   * @param {BrandShuoOptions} options
   */
  constructor(options = {}) {
    this.apiUrl = (options.apiUrl || 'https://tools.brandshuo.com/api').replace(/\/+$/, '');
    this.apiKey = options.apiKey || '';
    this.timeout = options.timeout || 15000;
  }

  /**
   * Make an API request
   * @private
   */
  async _request(path, body = {}, method = 'POST') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['X-API-Key'] = this.apiKey;

      const res = await fetch(`${this.apiUrl}${path}`, {
        method,
        headers,
        body: method === 'GET' ? undefined : JSON.stringify(body),
        signal: controller.signal
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const err = new Error(data.message || 'API request failed');
        err.code = data.code || 'API_ERROR';
        err.status = res.status;
        throw err;
      }

      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Analyze a single affiliate link
   * @param {string} url - The URL to analyze
   * @returns {Promise<AnalyzeResult>}
   */
  async analyze(url) {
    return this._request('/analyze', { url });
  }

  /**
   * Analyze multiple URLs in batch (up to 100)
   * @param {string[]} urls - Array of URLs to analyze
   * @returns {Promise<BatchResult>}
   */
  async batch(urls) {
    if (!Array.isArray(urls)) throw new Error('urls must be an array');
    if (urls.length > 100) throw new Error('Maximum 100 URLs per batch request');
    return this._request('/batch', { urls });
  }

  /**
   * Trace the full HTTP redirect chain of a link
   * @param {string} url - The URL to trace
   * @returns {Promise<TraceResult>}
   */
  async trace(url) {
    return this._request('/trace', { url });
  }

  /**
   * Search the publisher database
   * @param {Object} filters - Search filters
   * @param {string} [filters.q] - Search query
   * @param {string} [filters.category] - Publisher category
   * @param {string} [filters.network] - Affiliate network
   * @param {string} [filters.region] - Region code
   * @param {number} [filters.limit=50] - Results per page
   * @returns {Promise<{ok: boolean, total: number, results: Array}>}
   */
  async searchPublishers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.network) params.set('network', filters.network);
    if (filters.region) params.set('region', filters.region);
    if (filters.limit) params.set('limit', String(filters.limit));
    return this._request(`/publishers?${params.toString()}`, {}, 'GET');
  }

  /**
   * Get detailed info about a specific publisher
   * @param {string} id - Publisher ID (e.g. 'slickdeals', 'nerdwallet')
   * @returns {Promise<{ok: boolean, publisher: Object}>}
   */
  async getPublisher(id) {
    return this._request(`/publisher/${encodeURIComponent(id)}`, {}, 'GET');
  }

  /**
   * Get system stats and publisher database statistics
   * @returns {Promise<{ok: boolean, database: Object, usage: Object, cache: Object}>}
   */
  async stats() {
    return this._request('/stats', {}, 'GET');
  }

  /**
   * Health check
   * @returns {Promise<{ok: boolean, status: string, database: Object, cache: Object}>}
   */
  async health() {
    return this._request('/health', {}, 'GET');
  }

  /**
   * Submit publisher feedback to improve the database
   * @param {Object} feedback
   * @param {string} feedback.url - The URL that was analyzed
   * @param {string} [feedback.publisher_name] - Correct publisher name
   * @param {string} [feedback.publisher_group] - Media group
   * @param {string} [feedback.network] - Affiliate network
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async submitFeedback({ url, publisher_name, publisher_group, network }) {
    return this._request('/feedback', { url, publisher_name, publisher_group, network });
  }

  /**
   * Get an API key (free tier)
   * @param {string} [email] - Your email
   * @returns {Promise<{ok: boolean, api_key: string, tier: string}>}
   */
  async getApiKey(email) {
    return this._request('/keys', { email });
  }
}

module.exports = BrandShuo;
module.exports.BrandShuo = BrandShuo;
