declare module "yt-search" {
  export interface YtAuthor {
    name?: string;
    url?: string;
  }

  export interface VideoDuration {
    seconds: number;
    timestamp: string;
    toString: () => string;
  }

  export interface VideoSearchResult {
    type: "video";
    videoId?: string;
    url: string;
    title: string;
    description?: string;
    image?: string;
    thumbnail?: string;
    seconds?: number;
    timestamp?: string;
    duration?: VideoDuration;
    ago?: string;
    views?: number;
    author?: YtAuthor;
  }

  export interface SearchOptions {
    query: string;
    pages?: number;
  }

  export interface SearchResult {
    videos: VideoSearchResult[];
  }

  interface SearchFunction {
    (query: string | SearchOptions): Promise<SearchResult>;
    search: (query: string | SearchOptions) => Promise<SearchResult>;
  }

  const search: SearchFunction;

  export default search;
}
