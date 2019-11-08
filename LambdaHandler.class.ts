import { Context, Callback } from 'aws-lambda'
import { DynamoDB, Lambda, SES } from 'aws-sdk'
import { IStandardReturn } from '../../interfaces/StandardReturn.interface'


  export interface IRequest { }


  export interface IResponse extends IStandardReturn {
    thirdParty: { }
  }


export abstract class LambdaHandler {

    protected response:IResponse
    protected request:IRequest
    protected context:Context
    protected callback:Callback
    protected requiredInputs:string[]
    protected error:LambdaErrorHandler
    protected needsToConnectToDatabase:boolean
    protected needsToExecuteLambdas:boolean
    protected needsToSendEmails:boolean
    protected db:DynamoDB.DocumentClient
    protected lambda:Lambda
    protected emailService:SES
    private awsAccessCredentials:{ accessKeyId:string|undefined, secretAccessKey:string|undefined, region:string|undefined }


    constructor(request:IRequest, context:Context, callback:Callback) {
      console.log('REQUEST:', request)
      this.response = new Response()
      this.bootstrap(request, context, callback)
      this.hookConstructorPre()
      this.validateInputsExist()
      this.validateInputValues()
      if (this.needsToConnectToDatabase) this.connectToDatabase()
      if (this.needsToExecuteLambdas) this.initializeLambda()
      if (this.needsToSendEmails) this.initializeSimpleEmailService()
      this.hookConstructorPost();
      (async () => {
        if (await this.allConditionsAreMet()) this.performActions()
        else this.error.conditionsNotMet()
      })()
    }




        private bootstrap(request, context, callback) {
          if (request.httpMethod) this.parseRequest(request)
          else this.request = request
          this.makeAWSCredentials()
          this.context = context
          this.callback = callback
          this.error = new LambdaErrorHandler(this.callback)
          this.requiredInputs = [ ]
        }




            private parseRequest(request) {
              if (this.needsToParseBody(request)) this.parseRequestBody(request)
              else if (this.needsToParseQuery(request)) this.parseRequestQuery(request)
            }




                private needsToParseBody(request) {
                  return (request.httpMethod === 'POST' || request.httpMethod === 'PUT')
                }




                private parseRequestBody(request) {
                  this.request = JSON.parse(request.body).params
                }




                private needsToParseQuery(request) {
                  return (request.httpMethod === 'GET' || request.httpMethod === 'DELETE')
                }




                private parseRequestQuery(request) {
                  this.request = request.queryStringParameters
                }




            private makeAWSCredentials() {
              this.awsAccessCredentials = {
                accessKeyId: process.env.accessKeyId,
                secretAccessKey: process.env.secretAccessKey,
                region: process.env.region
              }
            }




        protected hookConstructorPre() { }




        private validateInputsExist() {
          this.requiredInputs.forEach(requiredInput => {
              if (!this.request[requiredInput]) this.error.missingRequiredProperty(requiredInput)
            })
        }




        protected validateInputValues() { }




        protected connectToDatabase() {
          this.db = new DynamoDB.DocumentClient(this.awsAccessCredentials)
        }




        protected initializeLambda() {
          this.lambda = new Lambda(this.awsAccessCredentials)
        }




        protected initializeSimpleEmailService() {
          this.emailService = new SES(this.awsAccessCredentials)
        }




        protected hookConstructorPost() { }




        protected async allConditionsAreMet():Promise<boolean> {
          return new Promise((resolve)=> { resolve(true) })
        }




        protected performActions() { }




        protected hasSucceeded(result) {
          this.response.success = true
          this.response.details = result
          this.sendResponse()
        }




        protected hasFailed(error) {
          this.response.success = false
          this.response.details = error
          this.sendResponse()
        }




    protected sendResponse() {
      let output = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.response)
      }
      this.callback(null, output)
    }

}



export class LambdaErrorHandler {

  protected callback:Callback

  constructor(callback) { this.callback = callback }

  public missingRequiredProperty(propertyName:string) { this.respond(`Missing required property '${ propertyName }'.`) }

  public failedDependency(dependencyName:string) { this.respond(`Dependency ${ dependencyName } failed.`) }

  public conditionsNotMet() { this.respond(`Not all initial conditions where met, did not proceed.`) }

  public noDatabaseConnection() { this.respond(`Unable to establish connection to database.`) }

  public insertRecordFailed(recordName:string, error?:any) { this.respond(`Unable to insert ${ recordName } into database.`, error) }

  public noExpectedSuccessOrFailureResult(atMethodName) { this.respond(`Received no Success or Failure response at ${ atMethodName }`) }

  public invokedLambdaFunctionReturnedFailure(functionName) { this.respond(`${ functionName } returned back a failed response.`) }

  protected respond(msg:string, error?:any) { if (error) console.log(`Error: ${ msg }`, error); this.callback(new Error(msg)) }

} // End ErrorHandler Class -------



export class Response implements IResponse {
  success:boolean
  details:any = { }
  thirdParty:any = { }
}
