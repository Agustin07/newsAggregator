import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: Function) {
		req.query['auth'] =
			req.headers.authorization !== process.env.JWT_KEY
				? 'false'
				: 'true';
		if (req.query.auth === 'false') {
			if (req.query.hasOwnProperty('nyt')) {
				if (!req.query.hasOwnProperty('tg'))
					return res
						.status(403)
						.send(
							'The New York Times API require a valid authentication key!'
						);
			}
		}

		next();
	}
}
