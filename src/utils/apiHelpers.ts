import {
  getCollectionList,
  getCollection,
  getCaseCount,
  getCaseByIndex,
  getCaseByID
} from "@concord-consortium/codap-plugin-api";
import { ICollections } from "../types";

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
    const caseObj = (await getCaseByIndex(selectedDataSetName, collName, i)).values.case;
    const processedCase = await processCase(caseObj);
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
  const collectionName = collectionList.find((c: any) => c.id === collId).name;
  return collectionName;
};
