import "dotenv/config";
import schedule from "node-schedule";
import {Auth, GetEventCount, GetTags, FetchObjects} from "./navstar.js";
import * as fs from "fs";


//Load start art
console.log(`Programm starting
						       ...
	   /// //////      ((((((((/ ((((.     //// ........  .......  .........    ... .....
	  /////   //// (((((    (((( ((( ... (// ....    .   ...    ....     ...  .....   .
	 ////     /// ////      (((  (((( .((((  ......     ...    ...      ....  ...
	///      /// ///      ((((   ((( (((        .....  ...    ...      ...  ...
       ////     ///, *////  (((((     (((((    ...  ..... ...     ..... ......  ...
      ///      ///     ////( (((     #((      .......    ...       .........  ....        `);

const task = schedule.scheduleJob('*/15 * * * * *',  async function (fireDate){
	//We need to check for errors at funciton level since callback is asyncronous
	try {
		console.log(`Expected time: ${fireDate}  Current time: ${new Date()}`);
		const auth  = await Auth();
		if(auth && auth.success===true){
			// Fetch tag id configured in .env as TAG
			const tag = await GetTags(auth.hash);
			console.log(tag);
			// Fetch trackers and vehicles attached with said tag object.
			const [trackers, vehicles] = await  FetchObjects(hash, tag);

			// Search for unread notifications since last check
			//			const count = await (auth.hash, trackers);
			//if(count && count.length > 0) {
			//	console.log(count);
			//
			//			}else{
			//				console.log("There's no events to sync...");
			//}
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
