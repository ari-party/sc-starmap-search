import React, { useEffect, useState } from "react";
import styles from "@/styles/index.module.css";
import Head from "next/head";
import JSONPretty from "react-json-pretty";
/**
 * Possible themes:
 * - 1337
 * - acai
 * - adventure_time
 * - monikai
 */
import jsonTheme from "react-json-pretty/themes/acai.css";

export default function Index() {
	const [jsonFetched, setJsonFetched] = useState(false);
	const [rawJson, setRawJson] = useState(null);
	const [json, setJson] = useState({ message: "Hold on! Fetching starmap data." });
	const [inputDelay, setInputDelay] = useState(false);
	const [previousValue, setPreviousValue] = useState(null);

	useEffect(() => {
		fetch("https://raw.githubusercontent.com/robertsspaceindustries/sc-starmap/main/out/starmap.json")
			.then(async (res) => {
				if (res.ok) {
					setJson([]);
					setRawJson(await res.json());
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

					setJson([
						...rawJson.systems.filter(
							(system) =>
								system.code?.includes(value.toUpperCase()) || system.name?.toLowerCase().includes(value.toLowerCase()),
						),
						...rawJson.objects.filter(
							(object) =>
								object.name?.toLowerCase().includes(value.toLowerCase()) ||
								object.designation?.toLowerCase().includes(value.toLowerCase()) ||
								object.code?.includes(value.toUpperCase()),
						),
					]);
				}

				setInputDelay(false);
			}, 300);
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
					<input
						onChange={inputOnChange}
						className={styles.input}
						placeholder="Name/Designation/Code"
						type="text"
						disabled={!jsonFetched}
					></input>
					<JSONPretty data={json} className={styles.result} theme={jsonTheme}></JSONPretty>
				</div>
			</main>
		</>
	);
}
