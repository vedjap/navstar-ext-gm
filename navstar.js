import axios from "axios";
import {format} from "date-fns";

const baseURL = "http://navstar.com.mx/api-v2/"
let lastCheck;

async function Auth(){
	const login = process.env.USERNAME;
	const password = process.env.PASSWORD;

	const authRequest = await axios.post(baseURL+"user/auth",{
		login, password
	});
	const authResponse = authRequest.data;
	//console.log(authRequest.data);
	//console.log(authRequest.status);
	return authResponse;
}

async function GetTags(hash){
	try{
		const tag = process.env.TAG;

		const tagRequest = await axios.post(baseURL+"tag/list",{
			hash,
			filter: tag
		});
		const tagResponse = tagRequest.data.list;
		if(tagResponse && tagResponse.success === true){
			//console.log(tagResponse);
			//console.log();
			return tagResponse.find(x=> x.name === tag);;
		}
	}catch (err){
		console.log(err);
	}
}

async function GetEventCount(hash){
	try{
		if(lastCheck === undefined){
			lastCheck = new Date();
		}
		console.log("Last check: " + lastCheck);
		const countRequest = await axios.post(baseURL + 'history/unread/count',
			{
				hash,
				from:format(lastCheck, "yyyy-MM-dd hh:mm:ss"),
				to: format(new Date(), "yyyy-MM-dd hh:mm:ss")
			});
		lastCheck = new Date();
		console.log(countRequest.data);
		if(countRequest.data.success === true){
			return countRequest.data.count;
		}else{

			console.log("Something went wrong at trying to fetch unread events");
		}
	}catch(err){
		console.log(err.response.data);
		console.log(err);
	}
}
async function FetchObjects(hash, tag){
	try{
		console.log(tag);
		const searchRequest = await axios.post(baseURL + 'tag/search',
			{
				hash,
				tag_ids: [tag.id]
				entity_types:["tracker"]
			});
		console.log(searchRequest.data);
		if(searchRequest.data.success === true){
			const trackerResultList = searchRequest.data.result;
			console.log(trackerResultList);

			return countRequest.data.;
		}else{

			console.log("Something went wrong at trying to fetch unread events");
		}
	}catch(err){
		console.log(err.response.data);
		console.log(err);
	}
}


async function GetData(tracker_id){

}

export {
	Auth,
	GetEventCount,
	GetTags,
	FetchObjects

};
