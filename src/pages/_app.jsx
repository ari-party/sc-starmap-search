import React from "react";
import "@/styles/globals.css";
import PropTypes from "prop-types";

function App({ Component, pageProps }) {
	return <Component {...pageProps} />;
}

App.propTypes = {
	Component: PropTypes.any.isRequired,
	pageProps: PropTypes.any.isRequired,
};

export default App;
