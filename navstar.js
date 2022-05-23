import axios from "axios";
import {format} from "date-fns";

const baseURL = "http://navstar.com.mx/api-v2/"
let lastCheck;
/**
 * Auth function authenticate the client against the navstar api.
 * This is the first function that triggers and interacts with the api.
 * It is run every 15 sec.
 *
 * */
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
		const tagResponse = tagRequest.data;
		if(tagResponse && tagResponse.success === true){
			//console.log(tagResponse);
			//console.log();
			return tagResponse.list.find(x=> x.name === tag);
		}
	}catch (err){
		console.log(err);
	}
}

async function GetTrackers(hash){
	try{
		const trackerRequest = await axios.post(baseURL+"tracker/list",{
			hash,
		});
		const trackerResponse = trackerRequest.data;
		if(trackerResponse && trackerResponse.success === true){
			//console.log(tagResponse);
			//console.log();
			return trackerResponse.list;
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
		console.log(err);
	}
}
async function FetchObjects(hash, tag){
	try{
		const trackers = await GetTrackers(hash);
		if(trackers && trackers.length > 0 ){
			const trackerResultList = trackers.filter(t=>{
				if(t.tag_bindings.find(b=> b.tag_id === tag.id)){
					return true;
				}
				return false;
			});
			return [trackerResultList, vehicleResultList];
		}else{

			console.log("Something went wrong at trying to fetch unread events");
		}
	}catch(err){
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
