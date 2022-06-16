import axios from "axios";
const postRetry = async (url,data,n, options ) => {
	try {
		return await axios.post(url, data, options);
	} catch(err) {
		if (n === 1) throw err;
		return await postRetry(url, data, n-1, options);
	}
};
export  {
	postRetry

}
