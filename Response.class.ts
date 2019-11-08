export interface IResponse {
  success:boolean
  details:any
  thirdParty:any
}

export class Response implements IResponse {
  success:boolean
  details:any = { }
  thirdParty:any = { }
}