/* Use Case  
1. Manager update status from OPEN to IN PROGRESS / IN PROGRESS to COMPLETED

*/


import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function request(event, context) {
  const data = JSON.parse(event.body)
  const params = {
    TableName: process.env.maintanancesTable,
    Key: {
      requestId: event.pathParameters.requestId,
      // apartId: data.apartId
      requestedAt: data.requestedAt
    },
    UpdateExpression:
      "SET requestStatus = :requestStatus",
    ExpressionAttributeValues: {
      ":requestStatus": data.requestStatus + 1
    },
    ReturnValues: "ALL_NEW",
  }

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
