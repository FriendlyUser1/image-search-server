import React, { useState } from "react";
import { useEffect } from "react";
import RowItem from "./DashboardRowItem.js";

export type CachedImage = {
	searchQuery: string;
	searchIndex: number;
	fileName: string;
};

const Dashboard = () => {
	const [images, setImages] = useState<CachedImage[]>([]);

	useEffect(() => {
		fetch(`/api/images`)
			.then((response) => response.json())
			.then((cachedImages: CachedImage[]) => {
				console.log("fetched images");
				setImages(cachedImages);
			})
			.catch((err) => console.error("Error fetching images:", err));
	}, []);

	const removeImage = (fileName: string) => {
		setImages(images.filter((image) => image.fileName !== fileName));

		fetch(
			`https://localhost/api/images/${encodeURIComponent(fileName)}/delete`,
			{
				method: "PUT",
			}
		).catch((err) => console.log("ERROR: Error removing image:", err));
	};

	return images.map((image, n) => (
		<RowItem
			key={n}
			n={n}
			query={image.searchQuery}
			index={image.searchIndex}
			fileName={image.fileName}
			removeImage={removeImage}
		/>
	));
};

export default Dashboard;
