import { codapInterface } from "./codapInterface";

export const connect = {
    initialize: async function () {
        return await codapInterface.init(this.iFrameDescriptor, null);
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
        if (item.values) {
          items.push(item.values.values);
        }
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
      if (caseObj.children) {
        for (let i = 0; i < caseObj.children.length; i++){
          let childCase = await this.getCaseByID(dSName, caseObj.children[i]);
          let childCaseObj = childCase.case;
          if (childCaseObj.children.length) {
            caseObj.children[i] = await this.processCase(dSName, childCaseObj);
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

    updateAttributePosition: async function(dSName, collName, attrName, newPosition) {
      const message = {
        "action": "update",
        "resource": `dataContext[${dSName}].collection[${collName}].attributeLocation[${attrName}]`,
        "values": {
          "collection": collName,
          "position": newPosition
        }
      };
      await codapInterface.sendRequest(message);
    },

    createNewCollection: async function(dSName, collName) {
      const message = {
        "action": "create",
        "resource": `dataContext[${dSName}].collection`,
        "values": {
          "name": collName,
          "attributes": [{
            "name": "newAttr",
          }]
        }
      };
      await codapInterface.sendRequest(message);
    },

    ensureUniqueCollectionName: async function (dSName, collectionName, index) {
      index = index || 0;
      const uniqueName = `${collectionName}${index ? index : ""}`;
      const getCollection = {
        "action": "get",
        "resource": `dataContext[${dSName}].collection[${uniqueName}]`
      };
      const getCollectionResult = await codapInterface.sendRequest(getCollection);
      if (getCollectionResult.success) {
        // guard against run away loops
        if (index >= 100) {
          return undefined;
        }
        return connect.ensureUniqueCollectionName(dSName, collectionName, index + 1);
      } else {
        return uniqueName;
      }
    },

    createCollectionFromAttribute: async function(dSName, oldCollectionName, attr, parent) {
      // check if a collection for the attribute already exists
      const getCollection = {
        "action": "get",
        "resource": `dataContext[${dSName}].collection[${attr.name}]`
      };
      const getCollectionResult = await codapInterface.sendRequest(getCollection);

      // since you can't "re-parent" collections we need to create a temp top level collection, move the attribute,
      // and then check if CODAP deleted the old collection as it became empty and if so rename the new collection
      const moveCollection = getCollectionResult.success;
      const newCollectionName = moveCollection ? await connect.ensureUniqueCollectionName(dSName, attr.name) : attr.name;
      if (newCollectionName === undefined) {
        return;
      }

      const createCollectionRequest = {
        "action": "create",
        "resource": `dataContext[${dSName}].collection`,
        "values": {
          "name": newCollectionName,
          "title": newCollectionName,
          "parent": parent,
        }
      };
      const createCollectionResult = await codapInterface.sendRequest(createCollectionRequest);
      if (!createCollectionResult.success) {
        return;
      }

      const moveAttributeRequest = {
        "action": "update",
        "resource": `dataContext[${dSName}].collection[${oldCollectionName}].attributeLocation[${attr.name}]`,
        "values": {
          "collection": newCollectionName,
          "position": 0
        }
      }
      const moveResult = await codapInterface.sendRequest(moveAttributeRequest);
      if (!moveResult.success) {
        return;
      }

      if (moveCollection) {
        // check if the old collection has been
        const getAttributeListRequest = {
          "action": "get",
          "resource": `dataContext[${dSName}].collection[${oldCollectionName}].attributeList`
        };
        const getAttributeListResult = await codapInterface.sendRequest(getAttributeListRequest);

        // CODAP deleted the old collection after we moved the attribute so rename the new collection
        if (!getAttributeListResult.success) {
          const updateCollectionNameRequest = {
            "action": "update",
            "resource": `dataContext[${dSName}].collection[${newCollectionName}]`,
            "values": {
              "name": attr.name,
              "title": attr.name,
            }
          };
          const updateCollectionNameResult = await codapInterface.sendRequest(updateCollectionNameRequest);
        }
      }
    },

    createNewAttribute: async function(dSName, collName, attrName) {
      const message = {
        "action": "create",
        "resource": `dataContext[${dSName}].collection[${collName}].attribute`,
        "values": {
          "name": attrName,
        }
      };
      await codapInterface.sendRequest(message);
    },

    removeAttribute: async function (dSName, collName, attrName) {
      const message = {
        "action": "delete",
        "resource": `dataContext[${dSName}].collection[${collName}].attribute[${attrName}]`,
      };
      await codapInterface.sendRequest(message);
    },

    // Selects this component. In CODAP this will bring this component to the front.
    selectSelf: async function () {
      let myCODAPId = null;
      const selectComponent = async function (id) {
        return await codapInterface.sendRequest({
            action: "notify",
            resource:  `component[${id}]`,
            values: {request: "select"}
        });
      }
      if (myCODAPId == null) {
           const r1 = await codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'});
          if (r1.success) {
              myCODAPId = r1.values.id;
          }
      }
      if (myCODAPId != null) {
          return await selectComponent(myCODAPId);
      }
    },

    updateTitle: async function(title) {
      const message = {
        "action": "update",
        "resource": "interactiveFrame",
        "values": {
          "title": title
        }
      };
      await codapInterface.sendRequest(message);
    },

    selectCases: async function (dSName, caseIds) {
      const message = {
        "action": "create",
        "resource": `dataContext[${dSName}].selectionList`,
        "values": caseIds
      };
      await codapInterface.sendRequest(message);
    },

    iFrameDescriptor: {
      version: '0.0.1',
      name: 'multidata-plugin',
      title: 'MultiData'
    },
}
