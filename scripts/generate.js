import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";

const wait = (t) => new Promise((r) => setTimeout(r, t));

const baseUrl = "https://robertsspaceindustries.com/api/starmap";

async function starmapRequest(method, url, body) {
	const options = {
		method,
		headers: {},
	};

	switch (typeof body) {
		case "object":
			options.headers["content-type"] = "application/json";
			options.body = JSON.stringify(body);
			break;
	}

	const response = await fetch(url, options);

	if (!response.ok) return;

	const responseBody = await response.json();

	if (!responseBody.success) return;

	return responseBody.data;
}

const bootup = await starmapRequest("POST", baseUrl + "/bootup");
if (!bootup) throw new Error("Failed to fetch bootup data");
console.log("Fetched bootup");

const systems = new Set(bootup.systems.resultset);
const objects = new Set();

for (const system of systems) {
	const find = await starmapRequest("POST", baseUrl + "/find", { query: system.name });
	if (!find) throw new Error("Failed to fetch data for system " + system.name);
	console.log("Fetched system " + system.name);

	objects.add(...find.objects.resultset);

	await wait(1_000); // Avoid sending too many requests
}

fs.writeFile(
	path.resolve("out/starmap.json"),
	JSON.stringify(
		{
			systems: [...systems],
			objects: [...objects],
		},
		undefined,
		4, // Beautify
	),
	function (error) {
		if (error) throw error;
	},
);
