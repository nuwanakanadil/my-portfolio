import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

if ('scrollRestoration' in globalThis.history) {
	globalThis.history.scrollRestoration = 'manual';
}

if (globalThis.location.hash) {
	globalThis.history.replaceState(null, '', `${globalThis.location.pathname}${globalThis.location.search}`);
}

globalThis.scrollTo(0, 0);

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(<App />);
	globalThis.requestAnimationFrame(() => {
		globalThis.scrollTo(0, 0);
	});
}