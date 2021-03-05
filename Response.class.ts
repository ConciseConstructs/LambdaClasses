export interface TApiResponse {
  success:boolean
  input:any
  output:any
  thirdParty?:any
}

export class Response implements TApiResponse {
  success:boolean
  input:any = null
  output:any = { }
  thirdParty:any = { }
}