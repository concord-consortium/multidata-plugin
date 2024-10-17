import {
  getCollectionList,
  getCollection,
  getCaseCount,
  getCaseByIndex,
  getCaseByID,
  codapInterface
} from "@concord-consortium/codap-plugin-api";
import { ICollection, ICollections, IProcessedCaseObj } from "../types";

export const getCases = async (selectedDataSetName: string, collName: string) => {
  const processCase = async (caseObj: any) => {
    if (caseObj.children) {
      for (let i = 0; i < caseObj.children.length; i++){
        const childCase = await getCaseByID(selectedDataSetName, caseObj.children[i]);
        const childCaseObj = childCase.values.case;
        if (childCaseObj.children.length) {
          caseObj.children[i] = await processCase(childCaseObj);
        } else {
          caseObj.children[i] = childCase.values.case;
        }
      }
      return caseObj;
    }
  };
  const caseCountObj = await getCaseCount(selectedDataSetName, collName);
  const caseCount = caseCountObj.values;

  const cases = [];

  for (let i = 0; i < caseCount; i++) {
    const caseByIndex = await getCaseByIndex(selectedDataSetName, collName, i);
    const caseObj = caseByIndex.values.case;
    const processedCase: IProcessedCaseObj = await processCase(caseObj);
    cases.push(processedCase);
  }
  return cases;
};

export const getDataSetCollections = async (selectedDataSetName: string) => {
  const collectionList = (await getCollectionList(selectedDataSetName)).values;
  const colls: ICollections = [];

  for (let i = 0; i < collectionList.length; i++) {
    const coll = (await getCollection(selectedDataSetName, collectionList[i].name)).values;
    const cases = await getCases(selectedDataSetName, collectionList[i].name);
    coll.cases = cases;
    colls.push(coll);
  }

  return colls;
};

export const getCollectionById = async (selectedDataSetName: string, collId: number) => {
  const collectionList = (await getCollectionList(selectedDataSetName)).values;
  const collectionName = collectionList.find((c: ICollection) => c.id === collId).name;
  return collectionName;
};

export const sortAttribute = async (context: string, attrId: number, isDescending: boolean) => {
  await codapInterface.sendRequest({
    "action": "update",
    "resource": `dataContext[${context}]`,
    "values": {
      "sort": {
        attr: attrId,
        isDescending,
      }
    }
  });
};

export function startCodapDrag(context: string, attrTitle: string, overlayHeight?: number, overlayWidth?: number) {
  codapInterface.sendRequest({
    "action": "notify",
    "resource": `dataContext[${context}].attribute[${attrTitle}]`,
    "values": {
      "request": "dragStart",
      overlayHeight,
      overlayWidth
    }
  });
}

function continueCodapDrag(request: string, context: string, attrTitle: string, mouseX?: number, mouseY?: number) {
  codapInterface.sendRequest({
    "action": "notify",
    "resource": `dataContext[${context}].attribute[${attrTitle}]`,
    "values": {
      request,
      mouseX,
      mouseY
    }
  });
}

export function moveCodapDrag(context: string, attrTitle: string, mouseX: number, mouseY: number) {
  continueCodapDrag("dragOver", context, attrTitle, mouseX, mouseY);
}

export function endCodapDrag(context: string, attrTitle: string, mouseX: number, mouseY: number) {
  continueCodapDrag("dragEnd", context, attrTitle, mouseX, mouseY);
}
