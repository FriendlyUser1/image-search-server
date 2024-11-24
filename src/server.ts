import express from "express";
import https from "node:https";
import { existsSync, readFileSync, unlink } from "node:fs";
import { ImageSearcher } from "./ImageSearcher.js";
import path from "path";
import { deleteCacheItem, listCache } from "./db.js";
const app = express();
const PORT = 443; // 3002;

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.use(express.static("public"));

const defaultImage = await new ImageSearcher("bouncing yaris gif").search();

app.get("/getimage", async (req, res) => {
	const searchQuery = req.query.search;

	const imageIndex = req.query.index ? parseInt(req.query.index.toString()) : 0;

	let foundFile = defaultImage;

	if (searchQuery) {
		try {
			foundFile = await new ImageSearcher(
				searchQuery.toString(),
				imageIndex
			).search();
		} catch (error) {
			console.log("ERROR: Error searching for image");
			if (error instanceof Error) {
				console.log("Error message:", error.message);
				console.log("Error stack:", error.stack);
			}
		}
	}

	res.send(`${req.protocol}://${req.get("host")}/${foundFile}`);
});

app.get("/manage", async (req, res) => {
	res.sendFile(path.join(process.cwd(), "./public/dashboard.html"));
});

app.get("/api/images", (req, res) => {
	res.send(listCache());
});

app.put("/api/images/:fileName/delete", (req, res) => {
	const fileName = decodeURIComponent(req.params.fileName);
	const filePath = `./public/images/${fileName}`;

	let didDelete = false;

	if (existsSync(filePath)) {
		unlink(`./public/images/${fileName}`, (err) => {
			if (err) {
				console.log("ERROR: Error deleting image:", err);
				throw err;
			}

			console.log("INFO: Successfully deleted", fileName);
			didDelete = true;
		});
	} else console.log("ERROR: Could not find file to delete:", fileName);

	deleteCacheItem(fileName)
		.then(() => {
			console.log("INFO: Removed from cache:", fileName);
		})
		.catch((err) => {
			console.log(`ERROR: Error removing ${fileName} from cache: ${err}`);
			if (didDelete)
				console.log("WARN: Image still deleted - please update cache manually");
		});
});

app.get("/", (req, res) => {
	res.redirect("/manage");
});

const options: https.ServerOptions = {
	key: readFileSync("./keys/localhost+2-key.pem"),
	cert: readFileSync("./keys/localhost+2.pem"),
};

https
	.createServer(options, app)
	.on("error", console.error)
	.listen(PORT, () => {
		console.log(`Server is running at https://localhost:${PORT}`);
	});
