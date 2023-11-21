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
	const [previousValue, setPreviousValue] = useState(null);
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

	function inputOnChange(event) {
		let timeout;

		if (!inputDelay) {
			setInputDelay(true);

			// Wait a bit before filtering
			timeout = setTimeout(() => {
				const value = event.target.value;

				if (value !== previousValue && value.trim() !== "") {
					setPreviousValue(value);

					setJson(
						[
							...rawJson.systems.filter(
								(system) =>
									system.code?.includes(value.toUpperCase()) ||
									system.name?.toLowerCase().includes(value.toLowerCase()),
							),
							...rawJson.objects.filter(
								(object) =>
									object.name?.toLowerCase().includes(value.toLowerCase()) ||
									object.designation?.toLowerCase().includes(value.toLowerCase()) ||
									object.code?.includes(value.toUpperCase()),
							),
						].filter((v) => typeof v === "object"),
					);

					if (typeof json?.length === "number")
						setResultText(`${json.length} result${json.length === 1 ? "" : "s"}`);
				}

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
					<div className={styles.inputContainer}>
						<input
							onChange={inputOnChange}
							className={styles.input}
							placeholder="Name/Designation/Code"
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
