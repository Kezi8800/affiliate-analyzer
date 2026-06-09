// TypeScript type definitions for brandshuo-attribution SDK

declare module 'brandshuo-attribution' {
  interface BrandShuoOptions {
    apiUrl?: string;
    apiKey?: string;
    timeout?: number;
  }

  interface AnalyzeResult {
    ok: boolean;
    platform: string;
    network: string;
    publisher: string;
    publisher_id: string | null;
    publisher_url: string | null;
    publisher_group: string | null;
    publisher_type: string;
    traffic_type: string;
    quality_score: number;
    incrementality_risk: string;
    channel_role: string;
    confidence: string;
    hostname: string;
    is_shortened_url: boolean;
    redirect_hint: object | null;
    path_classification: {
      path_label: string;
      path_nodes: string[];
      publisher_label: string;
      channel_role: string;
    };
    publisher_intelligence: {
      publisher: string;
      type: string;
      subtype: string;
      media_group: string;
      matched_by: string;
      confidence: string;
      network: string;
    };
  }

  interface BatchResult {
    ok: boolean;
    stats: {
      total: number;
      success: number;
      failed: number;
      networks: string[];
      publishers: string[];
      duration_ms: number;
    };
    results: Array<{
      url: string;
      ok: boolean;
      platform: string;
      network: string;
      publisher: string;
      quality_score: number;
      incrementality_risk: string;
      confidence: string;
    }>;
  }

  interface TraceResult {
    ok: boolean;
    original_url: string;
    final_url: string;
    total_hops: number;
    followed: number;
    truncated: boolean;
    is_shortened: boolean;
    duration_ms: number;
    redirect_chain: Array<{
      url: string;
      status_code: number;
      redirect_to: string | null;
      redirect_type: string;
      is_shortener: boolean;
      error: string | null;
    }>;
    final_analysis: {
      platform: string;
      network: string;
      publisher: string;
      publisher_id: string | null;
      publisher_url: string | null;
      quality_score: number;
      incrementality_risk: string;
      channel_role: string;
      confidence: string;
    };
  }

  interface PublisherSearchResult {
    ok: boolean;
    total: number;
    results: Array<{
      id: string;
      publisher: string;
      group: string;
      category: string;
      publisher_type: string;
      quality: number;
      region: string;
      domains: string[];
      networks: string[];
      incrementality_risk: string;
    }>;
  }

  interface PublisherDetail {
    ok: boolean;
    publisher: {
      id: string;
      publisher: string;
      name: string;
      group: string;
      group_key: string;
      category: string;
      publisher_type: string;
      traffic_type: string;
      intent: string;
      role: string;
      quality: number;
      incrementality_risk: string;
      attribution_risk: string;
      region: string;
      domains: string[];
      amazon_tags: string[];
      aliases: string[];
      networks: string[];
    };
  }

  interface StatsResult {
    ok: boolean;
    database: {
      total_publishers: number;
      categories: number;
      networks_covered: number;
      regions: number;
    };
    by_category: Record<string, number>;
    by_network: Record<string, number>;
    by_region: Record<string, number>;
    risk_distribution: Record<string, number>;
    top_publishers: Array<{
      id: string;
      publisher: string;
      group: string;
      category: string;
      quality: number;
      region: string;
      networks: string[];
    }>;
  }

  interface FeedbackInput {
    url: string;
    publisher_name?: string;
    publisher_group?: string;
    network?: string;
  }

  class BrandShuo {
    constructor(options?: BrandShuoOptions);
    analyze(url: string): Promise<AnalyzeResult>;
    batch(urls: string[]): Promise<BatchResult>;
    trace(url: string): Promise<TraceResult>;
    searchPublishers(filters?: { q?: string; category?: string; network?: string; region?: string; limit?: number }): Promise<PublisherSearchResult>;
    getPublisher(id: string): Promise<PublisherDetail>;
    stats(): Promise<StatsResult>;
    health(): Promise<any>;
    submitFeedback(feedback: FeedbackInput): Promise<{ ok: boolean; message: string }>;
    getApiKey(email?: string): Promise<{ ok: boolean; api_key: string; tier: string }>;
  }

  export = BrandShuo;
}
