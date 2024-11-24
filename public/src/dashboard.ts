interface CachedImage {
	searchQuery: string;
	searchIndex: number;
	fileName: string;
}

// TODO Possibly rewrite dashboard in React

function getImages() {
	fetch(`${window.location.origin}/api/images`)
		.then((response) => response.json())
		.then((cachedImages: CachedImage[]) => {
			cachedImages.forEach((cachedImage, n) => {
				addRow(
					n.toString(),
					cachedImage.searchQuery,
					cachedImage.searchIndex.toString(),
					cachedImage.fileName
				);
			});
		});
}

function addRow(n: string, query: string, index: string, fileName: string) {
	const table = document.getElementById("imageTable");
	if (!table) return;

	const baseURL = window.location.origin;

	const rowN = newElement({
		tag: "th",
		text: n,
		attrs: { scope: "row" },
	});
	const rowQuery = newElement({ tag: "td", text: query });
	const rowIndex = newElement({ tag: "td", text: index });

	const rowFileLink = newElement({
		tag: "a",
		text: fileName,
		attrs: {
			href: `${baseURL}/images/${fileName}`,
			target: "_blank",
		},
	});
	const rowFileName = newElement({
		tag: "td",
		children: [rowFileLink],
	});

	const rowDeleteButton = newElement({
		tag: "input",
		attrs: { type: "checkbox" },
	});
	rowDeleteButton.addEventListener("change", (e) => {
		document.getElementById(n)?.remove();
		fetch(`${baseURL}/api/images/${encodeURIComponent(fileName)}/delete`, {
			method: "PUT",
		})
			.then(() => {
				document.getElementById(n)?.remove();
			})
			.catch((err) => console.log("ERROR: Error removing image:", err));
	});
	const rowDelete = newElement({ tag: "td", children: [rowDeleteButton] });

	const newRow = newElement({
		tag: "tr",
		children: [rowN, rowQuery, rowIndex, rowFileName, rowDelete],
		attrs: { id: n },
	});

	table.appendChild(newRow);
}

function newElement(options: NewElementOptions) {
	const { tag, text = "", attrs = {}, children = [] } = options;

	const newElement = document.createElement(tag);

	newElement.innerHTML = text;

	for (let attr in attrs) newElement.setAttribute(attr, attrs[attr]!);

	children.forEach((child) => newElement.appendChild(child));

	return newElement;
}

type Attribute = { [key: string]: string };

type NewElementOptions = {
	tag: string;
	text?: string;
	attrs?: Attribute;
	children?: HTMLElement[];
};
