import React, { useEffect, useState } from "react";
import styles from "@/styles/index.module.css";
import Head from "next/head";
import JSONPretty from "react-json-pretty"; // https://github.com/chenckang/react-json-pretty
/**
 * Possible themes:
 * - 1337
 * - acai
 * - adventure_time
 * - monikai
 */
import jsonTheme from "react-json-pretty/themes/acai.css";

function starmap(location, system) {
	const params = {};
	if (location) params.location = location;
	if (system) params.system = system;
	return "https://robertsspaceindustries.com/starmap?" + new URLSearchParams(params);
}

export default function Index() {
	const [jsonFetched, setJsonFetched] = useState(false);
	const [rawJson, setRawJson] = useState(null);
	const [json, setJson] = useState({ message: "Hold on! Fetching starmap data." });
	const [inputDelay, setInputDelay] = useState(false);
	const [previousInput, setPreviousInput] = useState(null);
	const [resultText, setResultText] = useState("");

	useEffect(() => {
		fetch("https://raw.githubusercontent.com/robertsspaceindustries/sc-starmap/main/out/starmap.json")
			.then(async (res) => {
				if (res.ok) {
					const starmapJson = await res.json();

					const systems = starmapJson.systems.map((system) => ({
						...system,
						__starmap: starmap(system.code),
					}));

					const objects = starmapJson.objects.map((object) => ({
						...object,
						__starmap: starmap(object.code, object.star_system?.code),
					}));

					setRawJson({ systems, objects });
					setJson([]);
					setJsonFetched(true);
				} else
					setJson({
						message: "Failed to fetch starmap data.",
						code: res.status,
					});
			})
			.catch((err) =>
				setJson({
					message: "There was an error fetching starmap data.",
					error: err,
				}),
			);
	}, [setJsonFetched, setRawJson, setJson]);

	async function search(params) {
		function e(object, args) {
			let value = object;
			if (!value) return null;
			for (const key of args) {
				value = value[key];
				if (!value) return null;
			}
			return value;
		}

		const newJson = [
			...rawJson.systems.filter((system) => {
				for (const paramKey of Object.keys(params)) {
					const { options: paramOptions, value: paramValue } = params[paramKey];

					if (paramOptions.includes("includes")) {
						const realValue = e(system, paramKey.split("."))?.toLowerCase();
						const includes = realValue?.includes(paramValue.toLowerCase());
						if (!includes) return false;
					} else {
						const realValue = e(system, paramKey.split("."))?.toLowerCase();
						if (realValue !== paramValue.toLowerCase()) return false;
					}
				}

				return true;
			}),
			...rawJson.objects.filter((object) => {
				for (const paramKey of Object.keys(params)) {
					const { options: paramOptions, value: paramValue } = params[paramKey];

					if (paramOptions.includes("includes")) {
						const realValue = e(object, paramKey.split("."))?.toLowerCase();
						const includes = realValue?.includes(paramValue.toLowerCase());
						if (!includes) return false;
					} else {
						const realValue = e(object, paramKey.split("."))?.toLowerCase();
						if (realValue !== paramValue.toLowerCase()) return false;
					}
				}

				return true;
			}),
		].filter((v) => typeof v === "object");

		setJson(newJson);

		if (typeof newJson?.length === "number")
			setResultText(`${newJson.length} result${newJson.length === 1 ? "" : "s"}`);
	}

	function onSearch(event) {
		let timeout;

		if (!inputDelay) {
			setInputDelay(true);

			// Wait a bit before filtering
			timeout = setTimeout(async () => {
				const input = event.target.value;

				if (input !== previousInput) {
					setPreviousInput(input);
				}

				const params = {};

				for (const match of [
					...input.matchAll(
						/(?<key>[\w_.]+)(:|=)(?<options>[~]?)("(?<valueSurrounded>.*?)"|(?<valuePlain>\w+))/g,
					),
				]) {
					const key = match.groups.key;
					const options = match.groups.options;
					const value = (match.groups.valueSurrounded ?? match.groups.valuePlain).replaceAll("\\\\", "");

					params[key] = {
						options: options
							? options
									.trim()
									.split("")
									.map((option) => ({ "~": "includes" }[option.trim()]))
									.filter((v) => v) // Is not falsy
							: [],
						value,
					};
				}

				if (Object.keys(params).length === 0) return;

				await search(params);

				setInputDelay(false);
			}, 100);
		}

		return () => clearTimeout(timeout);
	}

	return (
		<>
			<Head>
				<title>Starmap Data</title>
			</Head>
			<main className={styles.main}>
				<div className={styles.content}>
					<a
						className={styles.searchQueryHelp}
						target="_blank"
						href="https://github.com/robertsspaceindustries/sc-starmap-search/blob/main/docs/Search_queries.md"
					>
						Search query help
					</a>
					<div className={styles.inputContainer}>
						<input
							onChange={onSearch}
							className={styles.input}
							placeholder="Search query"
							type="text"
							disabled={!jsonFetched}
						/>
						<span className={styles.inputResults}>{resultText}</span>
					</div>
					<JSONPretty data={json} className={styles.result} theme={jsonTheme}></JSONPretty>
				</div>
			</main>
		</>
	);
}
