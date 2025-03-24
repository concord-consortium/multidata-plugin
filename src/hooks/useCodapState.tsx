import {useState, useEffect, useCallback} from "react";
import {
  addDataContextChangeListener,
  addDataContextsListListener,
  getDataContext,
  getListOfDataContexts,
  getSelectionList,
  initializePlugin,
  codapInterface,
  selectCases,
  createNewAttribute,
  selectSelf,
  createCollectionFromAttribute,
  createNewCollection,
  getAttribute,
  updateAttribute,
  updateAttributePosition,
  updateCaseById,
} from "@concord-consortium/codap-plugin-api";
import { runInAction } from "mobx";
import { applySnapshot, unprotect } from "mobx-state-tree";
import { getCases, getCollectionById, getDataSetCollections } from "../utils/apiHelpers";
import { ICollection, IDataSet, IProcessedCaseObj } from "../types";
import { DataSetsModel, DataSetsModelType } from "../models/datasets";
import { CollectionsModel, CollectionsModelSnapshot, CollectionsModelType } from "../models/collections";
import { newAttributeSlug } from "../utils/utils";

const iFrameDescriptor = {
  version: "0.9.0",
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
  activeTableIndex: number;
}

function unprotectedCollectionsModel(snap?: CollectionsModelSnapshot) {
  const collectionsModel = CollectionsModel.create(snap);
  unprotect(collectionsModel);
  return collectionsModel;
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
  const [collectionsModel, setCollectionsModel] = useState<CollectionsModelType>(() => unprotectedCollectionsModel());

  const [cases, setCases] = useState<IProcessedCaseObj[]>([]);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>({
    view: null,
    dataSetName: null,
    padding: true,
    showHeaders: true,
    displayMode: "",
    activeTableIndex: 0
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
          case "updateDataContext":       //  includes renaming dataset, so we have to redo the menu
          case "createCollection":
          case "updateCollection":
          case "deleteCollection":
          case "createAttributes":
          case "moveAttribute":
          case "updateAttributes":
          case "deleteAttributes":
          case "hideAttributes":
          case "showAttributes":
          case "unhideAttributes":
          case "createCases":
          case "createItems":
          case "moveCases":
          case "selectCases":
          case "updateCases":
            // TODO: consider throttling
            refreshDataSetInfo();
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

  const handleSetCollections = useCallback((colls: ICollection[]) => {
    const newCollectionModels = colls.map((coll: ICollection) => {
      const { areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
              collapseChildren, guid, id, name, parent, title, type } = coll;
      return {
        areParentChildLinksConfigured, attrs, caseName, cases: _cases, childAttrName,
        collapseChildren, guid, id, name, parent, title, type
      };
    });
    setCollectionsModel(unprotectedCollectionsModel({collections: newCollectionModels}));
  }, []);

  const updateCollections = useCallback(async () => {
    const colls = await getDataSetCollections(selectedDataSetName);
    handleSetCollections(colls);
  }, [handleSetCollections, selectedDataSetName]);

  useEffect(() => {
    if (selectedDataSet) {
      updateCollections();
    } else {
      runInAction(() => collectionsModel.collections.clear());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataSet]);

  useEffect(() => {
    const fetchCases = async () => {
      if (selectedDataSet) {
        const fetchedCases = await getCases(selectedDataSet.name, collectionsModel.collections[0].name);
        setCases(fetchedCases);
      }
    };

    if (collectionsModel.collections.length === 1 && selectedDataSet) {
      fetchCases();
    } else {
      setCases([]);
    }
  }, [collectionsModel, selectedDataSet]);


  const handleSelectDataSet = (name: string) => {
    const dataSetIdentifier = dataSets.find((d) => d.title === name || d.name === name)?.name;
    return dataSetIdentifier ? handleSetDataSet(dataSetIdentifier) : handleSetDataSet("");
  };

  const getCollectionNameFromId = (id: number) => {
    return collectionsModel.collections.find(c => c.id === id)?.name;
  };

  const handleUpdateAttributePosition = async (coll: ICollection, attrName: string, position: number) => {
    if (selectedDataSet) {
      await updateAttributePosition(selectedDataSet.name, coll.name, attrName, position);
    }
  };

  const handleAddCollection = async (newCollectionName: string) => {
    if (selectedDataSet) {
      await createNewCollection(selectedDataSet.name, newCollectionName, [{"name": newAttributeSlug}]);
    }
  };

  const handleCreateCollectionFromAttribute =
    async (collection: ICollection, attr: any, parent: number|string) => {
      if (selectedDataSet) {
        await createCollectionFromAttribute(selectedDataSet.name, collection.name, attr, parent);
      }
    };

  const handleAddAttribute = async (collection: ICollection, attrName: string, tableIndex=0) => {
    if (!selectedDataSet) return;

    const proposedName = attrName.length ? attrName : newAttributeSlug;
    let newAttributeName;
    const allAttributes: Array<any> = [];
    collectionsModel.collections.map((coll) => coll.attrs.map((attr) => allAttributes.push(attr)));
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
    setInteractiveState({...interactiveState, activeTableIndex: tableIndex});
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

  const updateSelection = async () => {
    if (selectedDataSet) {
      try {
        const selectionListResult = await getSelectionList(selectedDataSet.name);
        if (selectionListResult.success) {
          return selectionListResult.values;
        }
      } catch (error) {
        // This will happen if not embedded in CODAP
        console.warn("Not embedded in CODAP", error);
      }
    }
  };

  // This is used to select cases in CODAP when the user clicks on a MD plugin row in the table
  // or when user navigates to a different case in the card view
  const selectCODAPCases = useCallback(async (caseIds: number[]) => {
    const caseIdsToStrings = caseIds.map(c => c.toString());
    if (selectedDataSet) {
     selectCases(selectedDataSet.name, caseIdsToStrings);
    }
  }, [selectedDataSet]);

  const handleUpdateInteractiveState = useCallback((update: Partial<InteractiveState>) => {
    const newState = {...interactiveState, ...update};
    if (JSON.stringify(newState) !== JSON.stringify(interactiveState)) {
      updateInteractiveState(newState);
    }
  }, [interactiveState, updateInteractiveState]);

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
        runInAction(() => caseObj.values.set(attrTitle, newValue));
      }
    } catch (e) {
      console.error("Case not updated: ", e);
    }

    return request;
  };

  const addAttributeToCollection = async (collectionId: number, attrName: string) => {
    try {
      const collectionName = await getCollectionById(selectedDataSetName, collectionId);
      await createNewAttribute(selectedDataSetName, collectionName, attrName);
    } catch (e) {
      console.error("Failed to add attribute to collection: ", e);
    }
  };

  const renameAttribute = async (collectionName: string, attrId: number, oldName: string, newName: string) => {
    const _attribute = await getAttribute(selectedDataSetName, collectionName, oldName);
    const attribute = {..._attribute, name: oldName};
    try {
      await updateAttribute(selectedDataSetName, collectionName, oldName, attribute, {name: newName});
    } catch (e) {
      console.error("Failed to rename attribute: ", e);
    }
  };

  return {
    init,
    handleSelectSelf,
    dataSets,
    selectedDataSet,
    collectionsModel,
    handleSetCollections,
    handleSelectDataSet,
    getCollectionNameFromId,
    updateInteractiveState,
    interactiveState,
    cases,
    connected,
    handleUpdateAttributePosition,
    handleAddCollection,
    handleAddAttribute,
    updateTitle,
    selectCODAPCases,
    updateSelection,
    listenForSelectionChanges,
    handleCreateCollectionFromAttribute,
    handleUpdateCollections: updateCollections,
    editCaseValue,
    addAttributeToCollection,
    handleUpdateInteractiveState,
    renameAttribute
  };
};
