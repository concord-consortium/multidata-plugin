import {useState, useEffect, useCallback} from "react";
import {
  addDataContextChangeListener,
  addDataContextsListListener,
  getDataContext,
  getListOfDataContexts,
  initializePlugin,
  codapInterface,
  selectCases,
  createNewAttribute,
  selectSelf,
  createCollectionFromAttribute,
  createNewCollection,
  updateAttributePosition,
  updateCaseById,
} from "@concord-consortium/codap-plugin-api";
import { applySnapshot, unprotect } from "mobx-state-tree";
import { getCases, getDataSetCollections, sortAttribute } from "../utils/apiHelpers";
import { ICollection, IDataSet, IProcessedCaseObj } from "../types";
import { DataSetsModel, DataSetsModelType } from "../models/datasets";
import { CollectionsModel, CollectionsModelType } from "../models/collections";

const iFrameDescriptor = {
  version: "0.5.0",
  pluginName: "multidata-plugin",
  title: "MultiData",
  dimensions: {
    width: 300,
    height: 400
  }
};

export interface InteractiveState {
  view: "nested-table" | "hierarchy" | "card-view" | null
  dataSetName: string|null;
  padding: boolean;
  showHeaders: boolean;
  displayMode: string;
}

export const useCodapState = () => {
  const [connected, setConnected] = useState(false);
  const [dataSets] = useState<DataSetsModelType>(() => {
    const newDataSets = DataSetsModel.create();
    unprotect(newDataSets);
    return newDataSets;
  });
  const [selectedDataSet, setSelectedDataSet] = useState<IDataSet|null>(null);
  const [selectedDataSetName, setSelectedDataSetName] = useState<string>("");
  const [collections] = useState<CollectionsModelType>(() => {
    const newCollectionsModel = CollectionsModel.create();
    unprotect(newCollectionsModel);
    return newCollectionsModel;
  });

  const [cases, setCases] = useState<IProcessedCaseObj[]>([]);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>({
    view: null,
    dataSetName: null,
    padding: false,
    showHeaders: false,
    displayMode: ""
  });

  const getDataSets = useCallback(async () => {
    const dataContexts = await getListOfDataContexts();
    const datasets: IDataSet[] = dataContexts.values;
    applySnapshot(dataSets, datasets);
  }, [dataSets]);

  const handleDocumentChangeNotice = useCallback(() => getDataSets(), [getDataSets]);

  const handleSetDataSet = async (name: string|null) => {
    let dataSetInfo = null;
    if (name) {
      setSelectedDataSetName(name);
      dataSetInfo = await getDataContext(name);
    }
    setSelectedDataSet(dataSetInfo?.values);
  };

  const init = async () => {
    const newState = await initializePlugin(iFrameDescriptor);
    addDataContextsListListener(handleDocumentChangeNotice);
    await getDataSets();

    // plugins in new documents return an empty object for the interactive state
    // so ignore the new state and keep the default starting state in that case
    if (Object.keys(newState || {}).length > 0) {
      setInteractiveState(newState);
    }
    setConnected(true);
  };

  useEffect(() => {
    const handleDataContextChangeNotice = (iMessage: any) => {
      if (iMessage.resource === `dataContextChangeNotice[${selectedDataSetName}]`) {
        const theValues = iMessage.values;
        switch (theValues.operation) {
          case `selectCases`:
          case `updateCases`:
          // case `moveCases`:
              refreshDataSetInfo();
              break;
          case `updateCollection`:
          case `createCollection`:
          case `deleteCollection`:
          case `moveAttribute`:
          case `deleteAttributes` :
          case `createAttributes` :
          case `updateAttributes`:
          case `hideAttributes`:
          case `showAttributes`:
          case `unhideAttributes`:
              refreshDataSetInfo();
              break;
          case `updateDataContext`:       //  includes renaming dataset, so we have to redo the menu
              refreshDataSetInfo();
              break;
          case `moveCases`:
              handleMoveCases();
              break;
          case "createCases":
          case "createItems":
              break;
          default:
              break;
        }
      }
    };

    const refreshDataSetInfo = () => {
      updateCollections();
    };

    const setUpNotifications = () => {
      if (selectedDataSet) {
        addDataContextChangeListener(selectedDataSet.name, handleDataContextChangeNotice);
      }
    };

    if (selectedDataSet) {
      setUpNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataSet, selectedDataSetName]);

  const handleMoveCases = () => {
    updateCollections();
  };

  const updateCollections = useCallback(async () => {
    const colls = await getDataSetCollections(selectedDataSetName);
    const collectionModels = colls.map((coll: ICollection) => {
      const { areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
              collapseChildren, guid, id, name, parent, title, type } = coll;
      return {
        areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
        collapseChildren, guid, id, name, parent, title, type
      };
    });
    applySnapshot(collections, collectionModels);
  }, [collections, selectedDataSetName]);

  useEffect(() => {
    if (selectedDataSet) {
      updateCollections();
    } else {
      collections.clear();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataSet]);

  useEffect(() => {
    const fetchCases = async () => {
      if (selectedDataSet) {
        const fetchedCases = await getCases(selectedDataSet.name, collections[0].name);
        setCases(fetchedCases);
      }
    };

    if (collections.length === 1 && selectedDataSet) {
      fetchCases();
    } else {
      setCases([]);
    }
  }, [collections, selectedDataSet]);


  const handleSelectDataSet = (name: string) => {
    handleSetDataSet(name);
  };

  const getCollectionNameFromId = (id: number) => {
    return collections.find(c => c.id === id)?.name;
  };

  const handleUpdateAttributePosition = async (coll: ICollection, attrName: string, position: number) => {
    if (selectedDataSet) {
      await updateAttributePosition(selectedDataSet.name, coll.name, attrName, position);
      // update collections because CODAP does not send dataContextChangeNotice
      updateCollections();
    }
  };

  const handleAddCollection = async (newCollectionName: string) => {
    if (selectedDataSet) {
      await createNewCollection(selectedDataSet.name, newCollectionName, [{"name": "newAttr"}]);
      // update collections because CODAP does not send dataContextChangeNotice
      updateCollections();
    }
  };

  const handleCreateCollectionFromAttribute =
    async (collection: ICollection, attr: any, parent: number|string) => {
      if (selectedDataSet) {
        await createCollectionFromAttribute(selectedDataSet.name, collection.name, attr, parent);
      }
    };

  const handleSortAttribute = async (context: string, attrId: number, isDescending: boolean) => {
    sortAttribute(context, attrId, isDescending);
  };

  const handleAddAttribute = async (collection: ICollection, attrName: string) => {
    if (!selectedDataSet) return;

    const proposedName = attrName.length ? attrName : "newAttr";
    let newAttributeName;
    const allAttributes: Array<any> = [];
    collections.map((coll) => coll.attrs.map((attr) => allAttributes.push(attr)));
    const attrNameAlreadyUsed = allAttributes.find((attr) => attr.name === proposedName);
    if (!attrNameAlreadyUsed) {
      newAttributeName = proposedName;
    } else {
      const attrsWithSameName = allAttributes.filter((attr) => attr.name.startsWith(proposedName));
      const indexes = attrsWithSameName.map((attr) => Number(attr.name.slice(proposedName.length)));
      const highestIndex = Math.max(...indexes);
      if (!highestIndex) {
        newAttributeName = proposedName + 1;
      } else {
        for (let i = 1; i <= highestIndex; i++) {
          const nameWithIndex = proposedName + i;
          const isNameWithIndexUsed = attrsWithSameName.find((attr) => attr.name === nameWithIndex);
          if (!isNameWithIndexUsed) {
            newAttributeName = nameWithIndex;
            break;
          } else if (i === highestIndex) {
            newAttributeName = proposedName + (highestIndex + 1);
          }
        }
      }
    }
    await createNewAttribute(selectedDataSet.name, collection.name, newAttributeName||"");
    updateCollections();
  };

  const updateInteractiveState = useCallback((update: InteractiveState) => {
    const newState = {...interactiveState, ...update};
    codapInterface.updateInteractiveState(newState);
    setInteractiveState(newState);
  }, [interactiveState, setInteractiveState]);

  const handleSelectSelf = async () => {
    selectSelf();
  };

  const updateTitle = async (title: string) => {
    const message = {
      "action": "update",
      "resource": "interactiveFrame",
      "values": {
        title
      }
    };
    await codapInterface.sendRequest(message);
  };

  const selectCODAPCases = useCallback(async (caseIds: number[]) => {
    const caseIdsToStrings = caseIds.map(c => c.toString());
    if (selectedDataSet) {
     selectCases(selectedDataSet.name, caseIdsToStrings);
    }
  }, [selectedDataSet]);

  const listenForSelectionChanges = useCallback((callback: (notification: any) => void) => {
    if (selectedDataSet) {
      addDataContextChangeListener(selectedDataSet.name, callback);
    }
  }, [selectedDataSet]);

  const editCaseValue = async (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => {
    let request;

    try {
      request = await updateCaseById(selectedDataSetName, caseObj.id, {[attrTitle]: newValue});
      if (request.success) {
        caseObj.values.set(attrTitle, newValue);
      }
    } catch (e) {
      console.error("Case not updated: ", e);
    }

    return request;
  };

  const handleSetCollections = (colls: ICollection[]) => {
    const newCollectionModels = colls.map((coll: ICollection) => {
      const { areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
              collapseChildren, guid, id, name, parent, title, type } = coll;
      return {
        areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
        collapseChildren, guid, id, name, parent, title, type
      };
    });
    applySnapshot(collections, newCollectionModels);
  };

  return {
    init,
    handleSelectSelf,
    dataSets,
    selectedDataSet,
    collections,
    handleSetCollections,
    handleSelectDataSet,
    getCollectionNameFromId,
    updateInteractiveState,
    interactiveState,
    cases,
    connected,
    handleUpdateAttributePosition,
    handleAddCollection,
    handleSortAttribute,
    handleAddAttribute,
    updateTitle,
    selectCODAPCases,
    listenForSelectionChanges,
    handleCreateCollectionFromAttribute,
    handleUpdateCollections: updateCollections,
    editCaseValue
  };
};
