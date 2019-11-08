# lambdahandler
Abstract LambdaHandler Class.
This abstract class can be extended to quickly get a lambda function up and running.


Pre-Processing:

1.) If Database, Lambdas or Emails are needed, in the child inherited class, overwrite the protected lifecycle hook "hookConstructorPre" method and set "needsToConnectToDatabase", "needsToExecuteLambdas", or "needsToSendEmails" booleans to true to initialize the AWS resource(s).

Example (In child class):

  hookConstructorPre() {
    this.needsToConnectToDatabase = true
  }


2.) The "requiredInputs:string[]" property can be set and the abstract class will loop through all the parameters passed into the function and make sure that property exists before proceeding.  Simply push the property name into this array of strings.





Post-Processing:

1.) Outcome/response is set and triggered by calling the "hasSucceeded(result?:any)" and "hasFailed(error?:any)" protected methods.  These methods will return a response to the caller with an extended IResponse interface:


  IResponse {
    success:boolean
    details:any
    thirdParty:any
  }

  This Response object is created immediately by the parent abstract class:

    "this.response = new Response()"

  So at anytime you can manipulate the "this.response" property.


  * The "success:boolean" is easily checkable so the caller can quickly determine correct logic flow, e.g.  "If (!result.success) this.onFailureHandler(result.details) else this.onSuccessHandler(result.details)".  This property is set automatically depending on whether you call "hasSucceeded()" or "hasFailed()"

  * The "details:any" property is the body/data generated internally from the lambda.  This property is the "result" or "error" parameters passed into either "hasSucceeded(result)" or "hasFailed(error)" methods.

  * The "thirdParty:any" property is the body/data generated externally from a third party api the lambda may have connected to which the caller may need.  This is not automatically assigned a value.  You must manually assign this value to separate internal data from external data.

    Example:

    doWhatever(internalDatabaseInfo, externalThirdPartyData) {
      this.response.thirdParty = { thirdPartyServiceName: externalThirdPartyData }
      this.hasSucceeded(internalDatabaseInfo)
    }

    Outputs:
    {
        success: true,
        details: any,
        thirdParty: {
            thirdPartyServiceName:any
        },
    }
