import { Controller, Get, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express'
import { NewsDto } from './dto/news.dto'

@Controller('news')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	async getNews(@Req() req : Request, @Res() res : Response) {

		let resultNews : NewsDto[] = [];

		const isCalled = this.appService.getRequiredAPIs(req);
		try{
			if (isCalled.tg){
				const resultNewsTG = await this.appService.getNewsTG(req, res);
				resultNews=resultNews.concat(resultNewsTG);
			}
	
			if (isCalled.nyt){
				const resultNewsNYT = await this.appService.getNewsNYT(req, res);
				resultNews=resultNews.concat(resultNewsNYT)
			}
	
			return res.status(200).json(resultNews);
		} catch(e){
			console.log();
			const error = this.appService.handleError(e);
			return res.status(error.code).send(error.message);
			
		}
		
	}
}
