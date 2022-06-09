import "dotenv/config";
import schedule from "node-schedule";
import {Auth, NeedsUpdate, GetTags, FetchObjects, GetData} from "./navstar.js";
import * as fs from "fs";
import {GetVersion, SendData } from "./gmtransport.js";

//Load start art
console.log(`Programm starting
						       ...
	   /// //////      ((((((((/ ((((.     //// ........  .......  .........    ... .....
	  /////   //// (((((    (((( ((( ... (// ....    .   ...    ....     ...  .....   .
	 ////     /// ////      (((  (((( .((((  ......     ...    ...      ....  ...
	///      /// ///      ((((   ((( (((        .....  ...    ...      ...  ...
       ////     ///, *////  (((((     (((((    ...  ..... ...     ..... ......  ...
      ///      ///     ////( (((     #((      .......    ...       .........  ....        `);

//Load eventConfiguration from events.js
let data = fs.readFileSync('./events.json', {encoding:'UTF-8'});
const eventConfiguration = JSON.parse(data);
let lastCheck;
const task = schedule.scheduleJob('*/30 * * * * *',  async function (fireDate){
	//We need to check for errors at funciton level since callback is asyncronous
	try {
		console.log(`Expected time: ${fireDate}  Current time: ${new Date()}`);
		const version = await GetVersion();
		if(version == undefined){
			console.log("Fatal error: Could not connect to GMTransport SOAP service.")
		}else{
			console.log("GMTransport UbicacionEquipoTerceros service version: " + version);
			const auth  = await Auth();
			if(auth && auth.success===true){
				// Fetch tag id configured in .env as TAG
				const tag = await GetTags(auth.hash);
				// Fetch trackers and vehicles attached with said tag object.
				const [trackers, vehicles] = await FetchObjects(auth.hash, tag);
				// Search for new events since last check
				lastCheck = new Date();
				const newEvents = await NeedsUpdate(auth.hash, trackers, lastCheck);
				if(newEvents && newEvents.length > 0) {
					let enabledEvents = eventConfiguration.filter(e=> e.type.length > 0);
					//console.log(enabledEvents);
					let attemptedEventCounter = 0;
					let updatedEventCounter = 0;
					enabledEvents.map(async function (evt)  {
						let filteredEvents = newEvents.filter(ne=> ne.event === evt.entity);
						//console.log(filteredEvents);
						filteredEvents.map(async function (fe) {
							attemptedEventCounter ++;
							let tracker = trackers.find(t=> t.id === fe.tracker_id);
							//console.log(tracker);
							let vehicle = vehicles.find(v=> v.tracker_id === tracker.id);
							//console.log(vehicle);
							const eventData = await GetData(auth.hash, evt, fe, tracker, vehicle);
							console.log(eventData);
							if(eventData != null){
								let soapResponse = await SendData(eventData);
								if(soapResponse === true){
									updatedEventCounter ++;
									console.log(soapResponse);
								}
								console.log(`#${updatedEventCounter}/${attemptedEventCounter}- have been synced`);
							}
						});
					});
				}else{
					console.log("There's no events to sync...");
				}
			}

		}

	} catch (err){

		console.error(err);
	}
});
//The following should be executed every minute
//const updateTagTask = schedule.scheduleJob('*/1 * * * *', async function (tagId, fireDate) {
//	try{
//		console.log("Another task:" + fireDate);
//		console.log(tagId);
//		tagId = tagId + 1 ;
//	}catch(err){
//		console.error(err);
//	}
//});
