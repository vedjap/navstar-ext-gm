import * as soap from "soap";
const wsdlURL = "https://gmtransportft.com/GMTGPSINTEGRACIONTERCEROS_WEB/awws/GMTGPSIntegracionTerceros.awws?wsdl";

const dbRetry = async (client, data, n ) => {
	try {
		return await client.UbicacionEquipoTercerosAsync(data);
	} catch(err) {
		if (n === 1) throw err;
		return await dbRetry(url, data, n-1);
	}
}
async function GetVersion(){
	try{
		const client = await soap.createClientAsync(wsdlURL);

		const response = await client.GetVersionAsync("tgd");
		return response[0].GetVersionResult;
	}catch(err){
		console.log(err);

	}
}

async function SendData(eventData){
	try{
		const client = await soap.createClientAsync(wsdlURL);
		const response = await dbRetry(client, eventData, 3);
		console.log(response);
		return response[0].UbicacionEquipoTercerosResult;
	}catch(err){
		console.error(err)

	}
}

export {
	GetVersion,
	SendData

}
