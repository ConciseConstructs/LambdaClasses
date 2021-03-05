import { LambdaHandler } from './AbstractLambdaHandler.class'
import { TApiResponse } from './Response.class'
import { Context, Callback } from 'aws-lambda'


  export type TApiReadRequest = {
    accountId:string
    condition?:'all'|'beginsWith'|'isBetween'|'isExactly'|'isGreaterOrEqual'|'isGreaterThan'|'isLessOrEqual'|'isLessThan'
    value?:any
    indexName?:string
    view?:any
    lastEvaluatedKey?:any
    lowerBounds?:any
    upperBounds?:any
  }


export abstract class ReadHandler extends LambdaHandler {
    protected request:TApiReadRequest
    protected response:TApiResponse
    protected syntax:any


    constructor(incomingRequest:TApiReadRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['accountId']
          this.needsToConnectToDatabase = true
        }




    protected performActions() {
      this.makeInitialSyntax()
      if (this.request.indexName) this.addQueryByIndexSyntax()
      if (this.request.view) this.addProjectionSyntax()
      if (this.request.lastEvaluatedKey) this.addLastEvaluatedKeySyntax()
      this.performQuery()
    }




        protected makeInitialSyntax() {
          if (!this.request.condition) this.makeAllSyntax()
          else switch (this.request.condition) {
            case "all": this.makeAllSyntax(); break
            case "beginsWith": this.makeBeginsWithSyntax(); break
            case "isBetween": this.makeIsBetweenSyntax(); break
            case "isExactly": this.makeIsExactlySyntax(); break
            case "isGreaterOrEqual": this.makeIsGreaterOrEqualSyntax(); break
            case "isGreaterThan": this.makeIsGreaterThanSyntax(); break
            case "isLessOrEqual": this.makeIsLessOrEqualSyntax(); break
            case "isLessThan": this.makeIsLessThanSyntax(); break
          }
        }




            protected makeAllSyntax() {
              this.syntax =  {
                TableName: `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#x = :y',
                ExpressionAttributeNames: {
                  "#x": 'table'
                },
                ExpressionAttributeValues: {
                  ':y': `${ this.request.accountId }.${ process.env.model }`,
                }
              }
            }




            protected makeBeginsWithSyntax() {
                this.syntax = {
                  TableName : `${ process.env.saasName }-${ process.env.stage }`,
                  KeyConditionExpression: '#table = :table AND begins_with(#index, :value)',
                  ExpressionAttributeNames:{
                      "#table": 'table',
                      "#index": 'id'
                  },
                  ExpressionAttributeValues: {
                      ":table": `${ this.request.accountId }.${ process.env.model }`,
                  }
                }
                if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ this.request.indexName }:${ this.request.value }`
                else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




                protected get needsToConcatIndexNameWithValue() {
                  return (this.request.indexName && this.request.indexName !== 'createdAt' && this.request.indexName !== 'updatedAt')
                }




            protected makeIsBetweenSyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index BETWEEN :lowerBounds and :upperBounds',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                  ":table": `${ this.request.accountId }.${ process.env.model }`,
                },
              }
              if (this.needsToConcatIndexNameWithValue) {
                this.syntax.ExpressionAttributeValues[":lowerBounds"] = `${ this.request.indexName }:${ this.request.lowerBounds }`
                this.syntax.ExpressionAttributeValues[":upperBounds"] = `${ this.request.indexName }:${ this.request.upperBounds }`
              }
              else {
                this.syntax.ExpressionAttributeValues[":lowerBounds"] = this.request.lowerBounds
                this.syntax.ExpressionAttributeValues[":upperBounds"] = this.request.upperBounds
              }
            }




            protected makeIsExactlySyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index = :value',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                    ":table": `${ this.request.accountId }.${ process.env.model }`,
                }
              }
              if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ this.request.indexName }:${ this.request.value }`
              else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




            protected makeIsGreaterOrEqualSyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index >= :value',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                    ":table": `${ this.request.accountId }.${ process.env.model }`,
                }
              }
              if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ this.request.indexName }:${ this.request.value }`
              else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




            protected makeIsGreaterThanSyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index > :value',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                    ":table": `${ this.request.accountId }.${ process.env.model }`,
                }
              }
              if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ process.env[`${ this.request.indexName  }`] }:${ this.request.value }`
              else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




            protected makeIsLessOrEqualSyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index <= :value',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                    ":table": `${ this.request.accountId }.${ process.env.model }`,
                }
              }
              if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ this.request.indexName }:${ this.request.value }`
              else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




            protected makeIsLessThanSyntax() {
              this.syntax = {
                TableName : `${ process.env.saasName }-${ process.env.stage }`,
                KeyConditionExpression: '#table = :table AND #index < :value',
                ExpressionAttributeNames:{
                    "#table": 'table',
                    "#index": 'id'
                },
                ExpressionAttributeValues: {
                    ":table": `${ this.request.accountId }.${ process.env.model }`,
                }
              }
              if (this.needsToConcatIndexNameWithValue) this.syntax.ExpressionAttributeValues[":value"] = `${ this.request.indexName }:${ this.request.value }`
              else this.syntax.ExpressionAttributeValues[":value"] = this.request.value
            }




        protected addQueryByIndexSyntax() {
          for (let [ propertyName, value ] of Object.entries(process.env)) {
            if (this.request.indexName === value) {
              this.syntax.IndexName = propertyName
              this.syntax.ExpressionAttributeNames["#index"] = propertyName
            }
          }
        }




        protected addProjectionSyntax() {
          this.request.view = JSON.parse(this.request.view)
          this.syntax.ProjectionExpression = this.request.view.ProjectionExpression
          for (let [ placeholder, value ] of Object.entries(this.request.view.ExpressionAttributeNames) as any) {
            this.syntax.ExpressionAttributeNames[placeholder] = value
          }
        }




        protected addLastEvaluatedKeySyntax() {
          this.syntax.ExclusiveStartKey = JSON.parse(this.request.lastEvaluatedKey)
        }




        protected performQuery() {
          this.db.query(this.syntax).promise()
            .then(result => this.hasSucceeded(result))
            .catch(error => this.hasFailed(error))
        }

} // End Main Handler Function -------
