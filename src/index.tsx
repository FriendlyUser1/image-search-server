import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./Dashboard.js";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
	<StrictMode>
		<Dashboard />
	</StrictMode>
);