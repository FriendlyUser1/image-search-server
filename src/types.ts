export interface CachedImage {
	searchQuery: string;
	searchIndex: number;
	fileName: string;
}

export type ImageDatabase = { cache: CachedImage[] };

export type CacheHit = [inCache: boolean, fileName: string];
