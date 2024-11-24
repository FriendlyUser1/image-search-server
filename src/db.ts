import { JSONFilePreset } from "lowdb/node";
import type { CacheHit, ImageDatabase } from "./types.js";

const defaultData: ImageDatabase = { cache: [] };
const db = await JSONFilePreset<ImageDatabase>(
	"cachedQueries.json",
	defaultData
);

export const isCached = (
	searchQuery: string,
	searchIndex: number
): CacheHit => {
	const matches = db.data.cache.filter(
		(item) =>
			item.searchQuery === searchQuery && item.searchIndex === searchIndex
	);

	if (matches[0]) return [true, matches[0].fileName];
	return [false, ""];
};

export const writeCache = async (
	searchQuery: string,
	searchIndex: number,
	fileName: string
) => {
	db.data.cache.push({ searchQuery, searchIndex, fileName });
	await db.write();
};

export const listCache = () =>
	db.data.cache.sort((a, b) => a.fileName.localeCompare(b.fileName));

export const deleteCacheItem = async (fileName: string) => {
	db.data.cache = db.data.cache.filter((item) => item.fileName !== fileName);
	await db.write();
};
