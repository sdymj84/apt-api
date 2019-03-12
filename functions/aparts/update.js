/* Use Case  
1. Manager update apartment info such as
  floorPlan, rentPrice, announcement
2. Resident contract lease -> Manager create resident
  -> System automatically update apartment by adding resident in apart
3. Resident lease end and payment balance is 0
  -> Systen automatically update apartment by removing resident from apart

*/


/*===================================================================
  Update Apart info by Manager
===================================================================*/
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.apartId
    },
    UpdateExpression:
      "SET residentId = list_append(residentId, :residentId), \
      address = :address, \
      floorPlan = :floorPlan, \
      isOccupied = :isOccupied, \
      rentPrice = :rentPrice, \
      announcement = :announcement",

    ExpressionAttributeValues: {
      ":residentId": data.residentId,
      ":address": data.address,
      ":floorPlan": data.floorPlan,
      ":isOccupied": data.isOccupied,
      ":rentPrice": data.rentPrice,
      ":announcement": data.announcement
    },
    ReturnValues: "ALL_NEW",
  };

  /* mock event for create resident
  {
    "residentId": ["63c2799f-d78b-4c0b-b7d5-f362be3b2ae3"],
    "isOccupied": true,
    "rentPrice": 950,
    "announcement": "Welcome Minjun",
    "address": {
      "street": "5901 College Blvd",
      "apt": "0401",
      "city": "Overland Park",
      "zipcode": "66211"
    },
    "floorPlan": {
      "name": "Sunset",
      "roomCount": 1,
      "sqft": 925
    },
    "buildingNum": "4"
  } 
  */

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}


/*===================================================================
  System add Resident in Apart
===================================================================*/
export async function addResident(event, context) {
  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.apartId
    },
    UpdateExpression:
      "SET residentId = list_append(residentId, :residentId), \
      isOccupied = :isOccupied",
    ExpressionAttributeValues: {
      ":residentId": [event.pathParameters.residentId],
      ":isOccupied": true,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}


/*===================================================================
  System remove Resident in Apart
===================================================================*/
export async function removeResident(event, context) {
  const params1 = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.apartId,
    }
  };

  try {
    const prevState = await dynamoDbLib.call("get", params1);
    const i = prevState.Item.residentId.indexOf(event.pathParameters.residentId)

    const params2 = {
      TableName: process.env.apartsTable,
      Key: {
        pk: "SAVOY",
        apartId: event.pathParameters.apartId
      },
      UpdateExpression:
        `REMOVE residentId[${i}] \
        SET isOccupied = :isOccupied`,
      ExpressionAttributeValues: {
        ":isOccupied": prevState.Item.residentId.length == 1 ? false : true,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDbLib.call("update", params2);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }



}