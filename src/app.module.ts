import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


@Module({
	imports: [HttpModule, ConfigModule.forRoot({
		envFilePath: '.development.env',
	})],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
