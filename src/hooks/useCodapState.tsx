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
} from "@concord-consortium/codap-plugin-api";
import { getCases, getDataSetCollections, sortAttribute } from "../utils/apiHelpers";
import { ICollections, ICollection, IDataSet } from "../types";

const iFrameDescriptor = {
  version: "0.0.1",
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
  const [dataSets, setDataSets] = useState<IDataSet[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<any>(null);
  const [selectedDataSetName, setSelectedDataSetName] = useState<string>("");
  const [collections, setCollections] = useState<ICollections>([]);
  const [items, setItems] = useState<any[]>([]);
  const [numUpdates, setNumUpdates] = useState<number>(0);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>({
    view: null,
    dataSetName: null,
    padding: false,
    showHeaders: false,
    displayMode: ""
  });

  const handleDocumentChangeNotice = useCallback(() => getDataSets(), []);

  const getDataSets = async () => {
    const sets = await getListOfDataContexts();
    setDataSets(sets.values);
  };

  const handleSetDataSet = async (name: string|null) => {
    let dataSetInfo = null;
    if (name) {
      setSelectedDataSetName(name);
      dataSetInfo = await getDataContext(name);
      setSelectedDataSet(dataSetInfo?.values);
    }
  };

  useEffect(() => {

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

    init();
  }, [handleDocumentChangeNotice]);

  useEffect(() => {
    const handleDataContextChangeNotice = (iMessage: any) => {
      if (iMessage.resource === `dataContextChangeNotice[${selectedDataSetName}]`) {
        const theValues = iMessage.values;
        switch (theValues.operation) {
          case `selectCases`:
          case `updateCases`:
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
          case `moveCases`:
              refreshDataSetInfo();
              break;
          case `updateDataContext`:       //  includes renaming dataset, so we have to redo the menu
              refreshDataSetInfo();
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
      handleSetDataSet(selectedDataSetName);
    };

    const setUpNotifications = async () => {
      addDataContextChangeListener(selectedDataSetName, handleDataContextChangeNotice);
    };

    if (selectedDataSetName) {
      setUpNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, selectedDataSet, selectedDataSetName]);

  const updateCollections = useCallback(async () => {
    const colls = await getDataSetCollections(selectedDataSetName);
    setCollections(colls);
  }, [selectedDataSetName]);

  useEffect(() => {
    if (selectedDataSet) {
      updateCollections();
    } else {
      setCollections([]);
    }
  }, [selectedDataSet, updateCollections]);

  useEffect(() => {
    const fetchItems = async () => {
      const itemRes = await getCases(selectedDataSet.name, collections[0].name);
      const fetchedItems = itemRes.map((item: any) => item.values);
      setItems(fetchedItems);
    };

    if (collections.length === 1 && selectedDataSet) {
      fetchItems();
    } else {
      setItems([]);
    }
  }, [collections, selectedDataSet, updateCollections]);

  const handleSelectDataSet = (name: string) => {
    const selected = dataSets.filter((d) => d.title === name);
    return selected.length ? handleSetDataSet(selected[0].name) : handleSetDataSet(null);
  };

  const handleRefreshDataSet = () => {
    setNumUpdates(numUpdates + 1);
    return selectedDataSet ? handleSetDataSet(selectedDataSet) : handleSetDataSet(null);
  };

  const getCollectionNameFromId = (id: number) => {
    return collections.find((c: ICollection) => c.id === id)?.name;
  };

  const handleUpdateAttributePosition = async (coll: ICollection, attrName: string, position: number) => {
    await updateAttributePosition(selectedDataSet.name, coll.name, attrName, position);
  };

  const handleAddCollection = async (newCollectionName: string) => {
    await createNewCollection(selectedDataSet.name, newCollectionName, [{"name": "newAttr"}]);
    // update collections because CODAP does not send dataContextChangeNotice
    updateCollections();
  };

  const handleCreateCollectionFromAttribute = async (collection: ICollection, attr: any, parent: number|string) => {
    const parentStr = parent.toString();
    await createCollectionFromAttribute(selectedDataSet.name, collection.name, attr, parentStr);
    // update collections because CODAP does not send dataContextChangeNotice
    updateCollections();
  };

  const handleSortAttribute = async (context: string, attrId: number, isDescending: boolean) => {
    sortAttribute(context, attrId, isDescending);
    updateCollections();
  };

  const handleAddAttribute = async (collection: ICollection, attrName: string) => {
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

  return {
    handleSelectSelf,
    dataSets,
    selectedDataSet,
    collections,
    handleSetCollections: setCollections,
    handleSelectDataSet,
    handleRefreshDataSet,
    getCollectionNameFromId,
    updateInteractiveState,
    interactiveState,
    items,
    connected,
    numUpdates,
    handleUpdateAttributePosition,
    handleAddCollection,
    handleSortAttribute,
    handleAddAttribute,
    updateTitle,
    selectCODAPCases,
    listenForSelectionChanges,
    handleCreateCollectionFromAttribute,
  };
};
