import * as soap from "soap";
const wsdlURL = "http://gmtransportft.com/GMTGPSINTEGRACIONTERCEROS_WEB/awws/GMTGPSIntegracionTerceros.awws?wsdl";

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
		const response = await client.UbicacionEquipoTercerosAsync(eventData);
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
