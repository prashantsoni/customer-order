import { createAppStorage } from "./storage/index.js";
import { newId, nowIso } from "./domain/defaults.js";
import { mountApp } from "./ui/app.js";

// Composition root: builds storage once and mounts the UI into the app shell.
const { store, customers, orders } = createAppStorage({ now: nowIso, newId });
mountApp({ root: document.getElementById("app"), customers, orders, store });
