# News Aggregator API

## Description

- News Aggregator API Handle searches on The Guardian's and The New York Time's APIs.
- News Aggregator is able to filter from using The Guardian's or The New York Time's API.
- News Aggregator define a common interface for the responses of the APIS.
- Server runs on port 3000.

### Sources:
[The Guardian API](https://open-platform.theguardian.com/)
[The New York Times API](https://developer.nytimes.com/)


### Requirements:

|  | VERSION  |  
|----------------|---------------|
|Node|   ^12.16.3        |     
|Typescript        |    ^3.7.4       | 
|Nestjs        | ^7.0.0 |
|@types/express | ^4.17.6| 
|@nestjs/config| ^0.5.0| 


## How to write a request:

- *Important:* Only use GET method!  

### Endpoint URL:

```
localhost:3000/news
```

### Query parameters:
| PARAMETER | DESCRIPTION  |  EXAMPLE |
|----------------|---------------|-----------|
|	  q     | Request content containing this free text. Supports AND, OR and NOT operators.|  `q=pizza`  | 
|	  oncontent     |  This query will look for matches in the body of the articles |  `content=pineapple`  | 
| onsecton  | Return only content in the sections |  `onsecton=food`  | 
| fromdate  | Return only content published on or after that date |  `fromdate=01/01/2012`  | 
| todate  | Return only content published on or before that date |  `todate=10/12/2012`  | 
| onpage  | Return only the result set from a particular page, must be a number |  `onpage=1`  | 
| nyt  | Request only on The New York Times API |  `nyt=true`  | 
| tg | Request only on The Guardian API |  `tg=true`  | 

> *Important:* By default the API Request on both sources! 

**Example :**

```
localhost:3000/news?q=pizza&oncontent=pineapple&onsection=food&fromdate=01/01/2012&todate=31/12/2012
```

