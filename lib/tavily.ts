interface TavilySearchOptions {
  query: string;
  auto_parameters?: boolean;
  topic?: 'general' | 'news';
  search_depth?: 'basic' | 'advanced';
  chunks_per_source?: number;
  max_results?: number;
  time_range?: 'day' | 'week' | 'month' | 'year' | 'd' | 'w' | 'm' | 'y';
  days?: number;
  include_answer?: boolean;
  include_raw_content?: boolean;
  include_images?: boolean;
  include_image_descriptions?: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
  country?: string;
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

interface TavilySearchResponse {
  query: string;
  answer?: string;
  images: Array<{
    url: string;
    description?: string;
  }>;
  results: TavilySearchResult[];
  response_time: number;
  auto_parameters?: Record<string, any>;
}

export class TavilyService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TAVILY_API_KEY not found in environment variables');
    }
  }

  /**
   * Execute a search query using Tavily Search
   */
  async search(options: TavilySearchOptions): Promise<TavilySearchResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key is not configured');
    }

    const searchPayload = {
      query: options.query,
      auto_parameters: options.auto_parameters ?? false,
      topic: options.topic ?? 'general',
      search_depth: options.search_depth ?? 'basic',
      chunks_per_source: options.chunks_per_source ?? 3,
      max_results: options.max_results ?? 5,
      time_range: options.time_range ?? null,
      days: options.days ?? 7,
      include_answer: options.include_answer ?? true,
      include_raw_content: options.include_raw_content ?? false,
      include_images: options.include_images ?? false,
      include_image_descriptions: options.include_image_descriptions ?? false,
      include_domains: options.include_domains ?? [],
      exclude_domains: options.exclude_domains ?? [],
      country: options.country ?? null,
    };

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${errorText}`);
      }

      const data: TavilySearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Tavily API:', error);
      throw error;
    }
  }

  /**
   * Search for general information
   */
  async searchGeneral(
    query: string, 
    maxResults: number = 5, 
    includeAnswer: boolean = true
  ): Promise<TavilySearchResponse> {
    return this.search({
      query,
      topic: 'general',
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: includeAnswer,
    });
  }

  /**
   * Search for news and current events
   */
  async searchNews(
    query: string, 
    maxResults: number = 5, 
    timeRange: 'day' | 'week' | 'month' = 'week',
    includeAnswer: boolean = true
  ): Promise<TavilySearchResponse> {
    return this.search({
      query,
      topic: 'news',
      search_depth: 'basic',
      max_results: maxResults,
      time_range: timeRange,
      include_answer: includeAnswer,
    });
  }

  /**
   * Advanced search with more detailed content
   */
  async searchAdvanced(
    query: string, 
    maxResults: number = 3, 
    includeRawContent: boolean = true
  ): Promise<TavilySearchResponse> {
    return this.search({
      query,
      topic: 'general',
      search_depth: 'advanced',
      chunks_per_source: 3,
      max_results: maxResults,
      include_answer: true,
      include_raw_content: includeRawContent,
    });
  }

  /**
   * Search with specific domain inclusion
   */
  async searchWithDomains(
    query: string, 
    includeDomains: string[], 
    maxResults: number = 5
  ): Promise<TavilySearchResponse> {
    return this.search({
      query,
      topic: 'general',
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: true,
      include_domains: includeDomains,
    });
  }

  /**
   * Search excluding specific domains
   */
  async searchExcludingDomains(
    query: string, 
    excludeDomains: string[], 
    maxResults: number = 5
  ): Promise<TavilySearchResponse> {
    return this.search({
      query,
      topic: 'general',
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: true,
      exclude_domains: excludeDomains,
    });
  }

  /**
   * Get a quick answer to a query
   */
  async getQuickAnswer(query: string): Promise<string> {
    try {
      const result = await this.search({
        query,
        topic: 'general',
        search_depth: 'basic',
        max_results: 3,
        include_answer: true,
      });
      
      return result.answer || 'No answer available';
    } catch (error) {
      console.error('Error getting quick answer:', error);
      return 'Unable to retrieve information at this time';
    }
  }

  /**
   * Format search results for AI agent consumption
   */
  formatSearchResults(searchResponse: TavilySearchResponse): string {
    const { query, answer, results } = searchResponse;
    
    let formatted = `Search Query: "${query}"\n\n`;
    
    if (answer) {
      formatted += `Answer: ${answer}\n\n`;
    }
    
    if (results && results.length > 0) {
      formatted += `Top Results:\n`;
      results.forEach((result, index) => {
        formatted += `${index + 1}. ${result.title}\n`;
        formatted += `   URL: ${result.url}\n`;
        formatted += `   Content: ${result.content}\n`;
        formatted += `   Relevance Score: ${result.score.toFixed(2)}\n\n`;
      });
    }
    
    return formatted;
  }
}

// Export a singleton instance
export const tavilyService = new TavilyService(); 