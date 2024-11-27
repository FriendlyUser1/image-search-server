import React from "react";

const RowItem = ({
	n,
	query,
	index,
	fileName,
	removeImage,
}: {
	n: number;
	query: string;
	index: number;
	fileName: string;
	removeImage: (fileName: string) => void;
}) => {
	return (
		<tr>
			<th scope="row">{n}</th>
			<td>{query}</td>
			<td>{index}</td>
			<td>
				<a href={`https://localhost/images/${fileName}`} target="_blank">
					{fileName}
				</a>
			</td>
			<td>
				<input type="checkbox" onChange={() => removeImage(fileName)} />
			</td>
		</tr>
	);
};

export default RowItem;
