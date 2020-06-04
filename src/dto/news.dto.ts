interface INewsDto {
    title : string;
    url : string;
    publishedDate : string; 
    section : string; 
    source : string;
}



export class NewsDto implements INewsDto { 
    constructor(
        // ? these are added as class properties
        public title : string,
        public url : string,
        public publishedDate : string, 
        public section : string,
        public source : string
      ) {}
      toJson(): INewsDto {
        const { title, url, publishedDate, section, source } = this;
        return {
            title,
            url,
            publishedDate, 
            section,
            source 
        };
      }
      static fromJson(data: INewsDto) {
        const { title, url, publishedDate, section, source } = data;
        return new NewsDto(title, url, publishedDate, section, source);
      }
}