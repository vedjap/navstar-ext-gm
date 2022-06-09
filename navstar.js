import axios from "axios";
import {format} from "date-fns";

const baseURL = "http://navstar.com.mx/api-v2/"
function GmDate(eventTime){
	let eventDate = new Date(eventTime);
	let parts =  eventDate.toISOString().replace(/[TZ]/g, " ").split(" ");
	return  parts[0].replace(/-/g, "")+ parts[1].replace(/:/g, "").substring(0, 6);
}
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
	return authRequest.data;
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
			//console.log();
			return trackerResponse.list;
		}
	}catch (err){
		console.log(err);
	}
}

async function GetVehicles (hash, trackers){
	try{
		const vehicleRequest = await axios.post(baseURL+"vehicle/list",{
			hash,
		});
		const vehicleResponse = vehicleRequest.data;
		if(vehicleResponse && vehicleResponse.success === true){
			const vehicles = trackers.map(t=>vehicleResponse.list.find(v=> v.tracker_id === t.id));
			return vehicles;
		}
	}catch (err){
		console.log(err);
	}
}


async function FetchObjects(hash, tag){
	try{
		const trackers = await GetTrackers(hash);
		if(trackers && trackers.length > 0 ){
			const trackerResultList = trackers.filter(t=>{
				if(t.tag_bindings.find(b=> b.tag_id === tag.id) !== undefined){
					return true;
				}
				return false;
			});
			//	console.log(trackerResultList);
			const vehicles = await GetVehicles(hash, trackerResultList);
			return [trackerResultList, vehicles];
		}else{

			console.log("Something went wrong at trying to fetch trackers");
		}
	}catch(err){
		console.log(err);
	}
}

async function NeedsUpdate(hash, trackers, lastCheck){
	try{
		console.log("Last check: " + lastCheck);
		const historyRequest = await axios.post(baseURL + 'history/tracker/list',
			{
				hash,
				trackers: trackers.map(t=> t.id),
				from:format(lastCheck, "yyyy-MM-dd hh:mm:ss"),
				to: format(new Date(), "yyyy-MM-dd hh:mm:ss")
			});
		console.log(historyRequest.data);
		if(historyRequest.data.success === true){
			//Here we should filter out the events that are not being tracked
			return historyRequest.data.list;
		}else{

			console.log("Something went wrong at trying to fetch history events");
		}
	}catch(err){
		console.log(err);
	}
}

async function GetLastGPS(hash, tracker){
	try{
		const lastGPSrequest = await axios.post(baseURL+"tracker/get_last_gps_point",{
			hash,
			tracker_id: tracker.id
		});
		if(lastGPSrequest.data && lastGPSrequest.data.success === true){
			return lastGPSrequest.data.value;
		}
	}catch (err){
		console.log(err);
	}
}

async function GetTemp(hash, tracker){
	try{
		const diagnosticsRequest = await axios.post(baseURL+"tracker/get_diagnostics",{
			hash,
			tracker_id: tracker.id
		});
		if(diagnosticsRequest.data && diagnosticsRequest.data.success === true){
			let inputs = diagnosticsRequest.data.inputs;
			let value;
			if(inputs && inputs.find(i=> i.name === "can_engine_temp")){
				value = inputs.find(i=> i.name === "can_engine_temp");
			}else if(inputs.find(i=> i.name === "can_coolant_t")){
				value = inputs.find(i=> i.name === "can_coolant_t");
			}else if(inputs && inputs.find(i=> i.name === "obd_coolant_t")){
				value = inputs.find(i=> i.name === "obd_coolant_t");
			}else if(inputs.find(i=> i.name === "obd_intake_air_t")){
				value = inputs.find(i=> i.name === "obd_intake_air_t");
			}else if(inputs.find(i=> i.name === "can_intake_air_t")){
				value = inputs.find(i=> i.name === "can_intake_air_t");
			}
			if(value === undefined){
				console.log("No temp. value could be found for: " + tracker.id);
				return null;
			}
			if(value.units_type !== 'celsius'){
				return ((value.value - 32)*5)/9;

			}
			return value.value;
		}
	}catch (err){
		console.error(err);
	}
}

async function GetOdometer(hash, tracker){
	try{
		const counterRequest = await axios.post(baseURL+"tracker/get_counters",{
			hash,
			tracker_id: tracker.id
		});
		if(counterRequest.data && counterRequest.data.success === true){
			let res = counterRequest.data.list.find(e=> e.type === "odometer");
			return res != undefined ? res.value : (null && console.log(`Odometer could not be found for: ${tracker.id}`));
		}
	}catch (err){
		console.log(err);
	}
}

function readFuelPercentage(data, vehicle){
	if(data.units_type === 'percentage'){
		return data.value;
	}
	if(data.units === '' && data.max_value === 100 && data.min_value === 0){
		return data.value;
	}
	if(vehicle.fuel_tank_volume === undefined){
		return null;
	}
	if(data.units_type === 'litre'){
		//liters
		return (data.value*100)/vehicle.fuel_tank_volume;
	}
	if(data.units_type.contains('gallon')){
		return ((data.value*3.785411)*100)/vehicle.fuel_tank_volume;
	}
	return null;
}

async function GetFuel(hash, tracker, vehicle){
	try{
		const fuelRequest = await axios.post(baseURL+"tracker/get_fuel",{
			hash,
			tracker_id: tracker.id
		});
		if(fuelRequest.data && fuelRequest.data.success === true){
			let result;
			let value;
			let inputs = fuelRequest.data.inputs;
			if(inputs &&  inputs.find(i=>
				(i.name === "fuel_level" ||
					i.name === "can_fuel" ||
					i.name === "can_fuel_1" ||
					i.name === "can_fuel_2" ||
					i.name === "can_fuel_litres" ||
					i.name === "obd_fuel") && i.value !== undefined)){
				value = inputs.find(i=>
					(i.name === "fuel_level" ||
						i.name === "can_fuel" ||
						i.name === "can_fuel_1" ||
						i.name === "can_fuel_2" ||
						i.name === "can_fuel_litres" ||
						i.name ==="obd_fuel") && i.value !== undefined);
				result = readFuelPercentage(value, vehicle);
			}
			if(result === undefined){
				console.log("Fuel data not found on: "+ tracker.id);
				return null;
			}
			return result;
		}
	}catch (err){
		console.log(err);
	}
}


async function GetData(hash, event, history, tracker, vehicle){
	try{
		let result = {};
		let lastGPS = await GetLastGPS(hash,tracker);
		let tempData= await GetTemp(hash,tracker);
		let odometer = await GetOdometer(hash, tracker);
		let fuel = await GetFuel(hash, tracker, vehicle);
		result.sNoSerie = vehicle.vin !== undefined && vehicle.vin.length > 0 ? vehicle.vin : tracker.source.device_id;
		result.sEvento = event.code;
		result.sFechaHoraPaquete = GmDate(history.time);
		result.sLatitud =`${history.location.lat}`;
		result.sLongitud = `${history.location.lng}`;
		result.sVelocidad = lastGPS != undefined ?`${lastGPS.speed}`: null;
		result.sHeading = lastGPS != undefined ? `${lastGPS.heading}`: null;
		result.sTemperatura = tempData != undefined ? `${tempData}`: null;
		result.sOdometroGPS = odometer != undefined ? `${odometer}`: null;
		result.sPorcentajeGasolina = fuel != undefined ? `${fuel}`: null;
		return result;
	}catch(err){
		console.error(err)}
}


export {
	Auth,
	GetTags,
	FetchObjects,
	NeedsUpdate,
	GetData

};
