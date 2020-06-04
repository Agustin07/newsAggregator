import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { Request, Response } from 'express'

import { NewsDto } from './dto/news.dto';

@Injectable()
export class AppService {
	constructor(private httpService: HttpService) {}
	getNewsNYT(query : string) {
		return this.httpService.get('https://api.nytimes.com/svc/search/v2/articlesearch.json?'+query+'&fl=abstract,source,pub_date,section_name,web_url').toPromise();
	}

	getNewsTG(query : string){
		return this.httpService.get('https://content.guardianapis.com/search?'+query).toPromise();
	}

	parseNewsNYT(results : []) {
		const all=results.map((item) => {
			const { abstract, web_url, pub_date, section_name, source } = item;
			return NewsDto.fromJson({ title : abstract, url : web_url, publishedDate : pub_date, section : section_name, source : source });
		});
		return all;
	}

	parseNewsTG(results : [] ) {
		const all=results.map((item) => {
			const { webTitle, webUrl, webPublicationDate, sectionName } = item;
			return NewsDto.fromJson({ title : webTitle, url : webUrl, publishedDate : webPublicationDate, section : sectionName, source : 'The Guardian' });
		});
		return all;
	}

	createRequestNYT(req : Request, url : string){
		const params = req.query;
		return url+'&api-key='+process.env.NYT_KEY;
	}

	createRequestTG(req : Request, url : string){
		const params = req.query;
		return url+'&api-key='+process.env.TG_KEY;
	}

	createRequests(req : Request){
		const params = req.query;
		let url = '';
		if (params.hasOwnProperty('q')) url+='q='+params.q;
		return { nytQuery : this.createRequestNYT(req, url), tgQuery : this.createRequestTG(req, url) }
	}

	validateResponseTG(result) : Boolean {
		return result.hasOwnProperty('message');
	}

	useAPI(req : Request, api : string) : boolean {
		return ( ( req.query.hasOwnProperty(api) && req.query[api] ) ? true : false );
	}


}