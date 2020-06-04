import { Controller, Get, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express'

@Controller('news')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	async getNews(@Req() req : Request, @Res() res : Response) {
		
		
		const { nytQuery, tgQuery } = this.appService.createRequests(req);
		//console.log(nytQuery);
		//console.log(tgQuery);

		try{
			const nytResults = await this.appService.getNewsNYT(nytQuery);
			const tgResults = await this.appService.getNewsTG(tgQuery);

			//if(this.appService.validateResponseTG(tgResults)) return res.status(404).send(tgResults.data.message);

			let result = this.appService.parseNewsNYT(nytResults.data.response.docs);

			let result2 = this.appService.parseNewsTG(tgResults.data.response.results);
			
			return res.status(200).json(result.concat(result2));
		}
		catch(e){
			return res.status(e.response.status).send(e.response.data.message || e.response.data.fault.faultstring);
		}
	}
}
