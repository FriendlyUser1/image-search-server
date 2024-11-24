import path from "node:path";
import axios from "axios";
import { search as imageSearch } from "async-image-search";
import { createWriteStream } from "node:fs";
import { isCached, writeCache } from "./db.js";
import type { CacheHit } from "./types.js";

export class ImageSearcher {
	searchQuery: string;
	searchIndex: number;
	cacheHit: CacheHit;

	constructor(searchQuery: string, searchIndex = 0) {
		this.searchQuery = searchQuery;
		this.searchIndex = searchIndex;
		this.cacheHit = [false, ""];
	}

	checkCache() {
		const cacheCheck = isCached(this.searchQuery, this.searchIndex);
		this.cacheHit = cacheCheck;
	}

	async search() {
		// search for image in cache
		this.checkCache();
		if (this.cacheHit[0]) return this.toImageLink(this.cacheHit[1]);

		// async-image-search search
		const results = await imageSearch(this.searchQuery);

		// cap index and search cache again
		if (this.searchIndex >= results.length - 1) {
			this.searchIndex = results.length - 1;
			this.checkCache();
			if (this.cacheHit[0]) return this.toImageLink(this.cacheHit[1]);
		}

		const newImageURL = new URL(results[this.searchIndex]!.url);

		const newFileExt =
			"." + newImageURL.pathname.split(".").pop()?.split("/")[0];
		const newFileName =
			(this.searchQuery + this.searchIndex).replace(/[\W_]+/g, "-") +
			newFileExt;

		// download image
		try {
			console.log(
				"Downloading image from",
				newImageURL.origin + newImageURL.pathname,
				"to",
				newFileName
			);

			const imageData = await axios.get(newImageURL.href, {
				responseType: "stream",
			});

			const imageWriter = createWriteStream(this.toPath(newFileName));

			await new Promise((resolve, reject) => {
				imageWriter.once("finish", resolve);
				imageWriter.once("error", reject);
				imageData.data.pipe(imageWriter);
			});
		} catch (error) {
			console.log("ERROR: Error while downloading image");

			if (error instanceof Error) {
				console.error("Error message:", error.message);
				if (
					error.stack &&
					Math.abs(error.stack.length - error.message.length) > 10
				)
					console.error("Error stack:", error.stack);
			}
		}

		// cache new image
		await writeCache(this.searchQuery, this.searchIndex, newFileName);

		return this.toImageLink(newFileName);
	}

	toImageLink(fileName: string) {
		return `images/${fileName}`;
	}

	toPath(fileName: string) {
		return path.join(process.cwd(), "public", "images", fileName);
	}
}
