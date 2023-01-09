import { codapInterface } from "./codapInterface";

export const connect = {
    state: {
      selectedDataSet: null
    },

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
    },

    getListOfDatasets: async function () {
        const tMessage = {
            "action": "get",
            "resource": "dataContextList"
        }
        const dataContextResult = await codapInterface.sendRequest(tMessage);
        return dataContextResult.values;
    },

    getDataSetCollections: async function (name) {
      console.log("getDataSetCollections");
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${name}].collectionList`
      }
      const collectionList = await codapInterface.sendRequest(tMessage);
      const collections = [];

      for (let i = 0; i < collectionList.values.length; i++) {
        const coll = await this.getCollection(name, collectionList.values[i].name);
        const cases = await this.getCases(name, collectionList.values[i].name);
        coll.cases = cases;
        collections.push(coll);
      }
      return collections;
    },

    getCollection: async function (dSName, collName) {
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${dSName}].collection[${collName}]`
      }

      const collection = await codapInterface.sendRequest(tMessage);
      return collection.values;
    },

    getItemCount: async function(dSName) {
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${dSName}].itemCount`,
      }

      const itemCount = await codapInterface.sendRequest(tMessage);
      return itemCount.values;
    },

    getCases: async function(dSName, collName) {
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${dSName}].collection[${collName}].caseCount`,
      }

      const caseCountObj = await codapInterface.sendRequest(tMessage);
      const caseCount = caseCountObj.values;

      let cases = [];

      for (let i = 0; i < caseCount; i++) {
        const c = await this.getCaseByIndex(dSName, collName, i);
        // store details about the case children
        if (c.case.children && c.case.children.length) {
          for (let j = 0; j < c.case.children.length; j++) {
            const child = await this.getCaseByID(dSName, c.case.children[j]);
            c.case.children[j] = child.case.values;
          }
        }
        cases.push(c.case);
      }

      return cases;
    },

    getCaseByIndex: async function(dSName, collName, i) {
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${dSName}].collection[${collName}].caseByIndex[${i}]`,
      };
      const singleCase = await codapInterface.sendRequest(tMessage);
      return singleCase.values;
    },

    getCaseByID: async function(dSName, id) {
      const message = {
        "action": "get",
        "resource": `dataContext[${dSName}].caseByID[${id}]`,
      };
      const singleCase = await codapInterface.sendRequest(message);
      return singleCase.values;
    },

    iFrameDescriptor: {
      version: 'foo',
      name: 'test',
      title: 'test',
      dimensions: {
          width: 333, height: 444,
      },
  },
}
