import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { Request, Response } from 'express';

import { NewsDto } from './dto/news.dto';

@Injectable()
export class AppService {
	constructor(private httpService: HttpService) {}
	private formatDateExpReg =
		'^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$';

	async getNewsNYT(req: Request, res: Response) {
		const query = this.createRequestNYT(req, res);
		const responseNYT = await this.consumeNYT(query);
		const nytNewsArray = this.parseNewsNYT(responseNYT.data.response.docs);
		return nytNewsArray;
	}

	async getNewsTG(req: Request, res: Response) {
		const query = this.createRequestTG(req, res);
		const responseTG = await this.consumeTG(query);
		const tgNewsArray = this.parseNewsTG(responseTG.data.response.results);
		return tgNewsArray;
	}

	consumeNYT(query: string) {
		console.log('NYT: ' + query);
		return this.httpService
			.get(
				'https://api.nytimes.com/svc/search/v2/articlesearch.json?' +
					query +
					'&fl=abstract,source,pub_date,section_name,web_url'
			)
			.toPromise();
	}

	consumeTG(query: string) {
		console.log('GT: ' + query);
		return this.httpService
			.get('https://content.guardianapis.com/search?' + query)
			.toPromise();
	}

	parseNewsNYT(results: []) {
		const list = results.map((item) => {
			const { abstract, web_url, pub_date, section_name, source } = item;
			return NewsDto.fromJson({
				title: abstract,
				url: web_url,
				publishedDate: pub_date,
				section: section_name,
				source: source,
			});
		});
		return list;
	}

	parseNewsTG(results: []) {
		const list = results.map((item) => {
			const { webTitle, webUrl, webPublicationDate, sectionName } = item;
			return NewsDto.fromJson({
				title: webTitle,
				url: webUrl,
				publishedDate: webPublicationDate,
				section: sectionName,
				source: 'The Guardian',
			});
		});
		return list;
	}

	createRequestNYT(req: Request, res: Response) {
		const params = req.query;

		let url = '';
		if (this.validateOption(req, 'q')) url += 'q=' + params.q;

		if (this.validateOption(req, 'oncontent'))
			url.length > 3
				? (url += '&fq=body:' + params.oncontent)
				: (url += 'fq=body:' + params.oncontent);

		if (this.validateOption(req, 'onsection')) {
			const beforeSection =
				url.length > 3
					? params.hasOwnProperty('oncontent')
						? ' AND '
						: '&fq='
					: 'fq=';
			url += beforeSection + 'section_name:' + params.onsection;
		}

		if (this.validateDateOption(req, 'todate')) {
			const todate = this.formatDate(params.todate as string, 'NYT');
			url.length > 3
				? (url += '&end_date=' + todate)
				: (url += 'end_date=' + todate);
		}

		if (this.validateDateOption(req, 'fromdate')) {
			const fromdate = this.formatDate(params.fromdate as string, 'NYT');
			url.length > 3
				? (url += '&begin_date=' + fromdate)
				: (url += 'begin_date=' + fromdate);
		}

		if (this.validateNumberOption(req, 'onpage'))
			url.length > 3
				? (url += '&page=' + params.onpage)
				: (url += 'page=' + params.onpage);

		return url + '&api-key=' + process.env.NYT_KEY;
	}

	createRequestTG(req: Request, res: Response) {
		const params = req.query;

		let url = '';
		if (this.validateOption(req, 'q')) url += 'q=' + params.q;

		if (this.validateOption(req, 'oncontent'))
			url.length > 3
				? (url += ' AND ' + params.oncontent + '&query-fields=body')
				: (url += 'q=' + params.oncontent + '&query-fields=body');

		if (this.validateOption(req, 'onsection'))
			url.length > 3
				? (url += '&section=' + params.onsection)
				: (url += 'section=' + params.onsection);

		if (this.validateDateOption(req, 'todate')) {
			const todate = this.formatDate(params.todate as string, 'TG');
			url.length > 3
				? (url += '&to-date=' + todate)
				: (url += 'to-date=' + todate);
		}

		if (this.validateDateOption(req, 'fromdate')) {
			const fromdate = this.formatDate(params.fromdate as string, 'TG');
			url.length > 3
				? (url += '&from-date=' + fromdate)
				: (url += 'from-date=' + fromdate);
		}

		if (this.validateNumberOption(req, 'onpage'))
			url.length > 3
				? (url += '&page=' + params.onpage)
				: (url += 'page=' + params.onpage);

		return url + '&api-key=' + process.env.TG_KEY;
	}

	getRequiredAPIs(req) {
		const nyt = this.useAPI(req, 'nyt');
		const tg = this.useAPI(req, 'tg');
		if (nyt === tg) return { nyt: true, tg: true };
		return { nyt: this.useAPI(req, 'nyt'), tg: this.useAPI(req, 'tg') };
	}

	useAPI(req: Request, api: string): boolean {
		return req.query.hasOwnProperty(api) &&
			Boolean(JSON.parse(req.query[api] as string))
			? true
			: false;
	}

	validateOption(req: Request, name: string) {
		const params = req.query;
		if (params.hasOwnProperty(name)) {
			if (params[name] === '')
				throw new Error(`Property "${name}" has no value!`);
			return true;
		}
		return false;
	}

	validateNumberOption(req: Request, name: string) {
		const params = req.query;
		if (params.hasOwnProperty(name)) {
			if (params[name] === '')
				throw new Error(`Property "${name}" has no value!`);
			const number = Number.parseInt(params[name] as string);
			if (!Number.isInteger(number) || number < 1)
				throw new Error(
					`Property "${name}" has not a valid integer number!`
				);
			return true;
		}
		return false;
	}

	validateDateOption(req: Request, name: string) {
		const params = req.query;
		if (params.hasOwnProperty(name)) {
			if (params[name] === '')
				throw new Error(`Property "${name}" has no value!`);
			const regexp = new RegExp(this.formatDateExpReg);
			if (!regexp.test(params[name] as string))
				throw new Error(`Property "${name}" has not a valid date!`);
			return true;
		}
		return false;
	}

	formatDate(datestr: string, api: string) {
		const date = datestr.split('/');
		if (api === 'NYT') return date[2] + date[1] + date[0];
		if (api === 'TG') return date[2] + '-' + date[1] + '-' + date[0];
		throw new Error(`API "${api}" is not valid!`);
	}

	handleError(e: any) {
		if (e.hasOwnProperty('response')) {
			if (e.response.data.hasOwnProperty('fault'))
				return {
					code: e.response.status,
					message: e.response.data.fault.faultstring,
				};
			return {
				code: e.response.status,
				message:
					e.response.data.message || e.response.data.response.message,
			};
		}
		return { code: 400, message: e.message };
	}
}
