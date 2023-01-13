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
        const dataContextList = await codapInterface.sendRequest(tMessage);
        return dataContextList.values;
    },

    getDataSet: async function (name) {
      const tMessage = {
        "action": "get",
        "resource": `dataContext[${name}]`
    }
    const dataContext = await codapInterface.sendRequest(tMessage);
    return dataContext.values;
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

    getItems: async function(dSName) {
      const itemCount = await this.getItemCount(dSName);
      let items = [];

      for (let i = 0; i < itemCount; i ++) {
        const tMessage = {
          "action": "get",
          "resource": `dataContext[${dSName}].item[${i}]`,
        }
        const item = await codapInterface.sendRequest(tMessage);
        items.push(item.values.values);
      }

      return items;
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
        const caseObj = (await this.getCaseByIndex(dSName, collName, i)).case;
        const processedCase = await this.processCase(dSName, caseObj);
        cases.push(processedCase);
      }
      return cases;
    },

    processCase: async function(dSName, caseObj) {
      if (!caseObj.children) {
        return caseObj;
      } else {
        for (let i = 0; i < caseObj.children.length; i++){
          let childCase = await this.getCaseByID(dSName, caseObj.children[i]);
          let childCaseObj = childCase.case;
          if (childCaseObj.children.length) {
            caseObj.children[i] = await this.processCase(dSName, childCase.case);
          } else {
            caseObj.children[i] = childCase.case;
          }
        }
        return caseObj;
      }
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
