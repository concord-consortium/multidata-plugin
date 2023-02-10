import {useState, useEffect, useCallback} from "react";
import { codapInterface } from "../scripts/codapInterface";
import { connect } from "../scripts/connect";
import { ICollections, ICollection, IDataSet } from "../types";

export const useCodapState = () => {
  const [dataSets, setDataSets] = useState<IDataSet[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<any>(null);
  const [selectedDataSetName, setSelectedDataSetName] = useState<string>("");
  const [collections, setCollections] = useState<ICollections>([]);
  const [items, setItems] = useState<any[]>([]);
  const [numUpdates, setNumUpdates] = useState<number>(0);

  const handleDocumentChangeNotice = useCallback(() => getDataSets(), []);

  const getDataSets = async () => {
    const sets = await connect.getListOfDatasets();
    setDataSets(sets);
  };

  const handleSetDataSet = async (name: string|null) => {
    let dataSetInfo = null;
    if (name) {
      setSelectedDataSetName(name);
      dataSetInfo = await connect.getDataSet(name);
    }
    setSelectedDataSet(dataSetInfo);
  };

  useEffect(() => {
    const setUpDocumentNotifications = async () => {
      //  receive notifications about doc changes, especially number of datasets
      const tResource = `documentChangeNotice`;
      codapInterface.on("notify", tResource, undefined, handleDocumentChangeNotice);
  };

    const init = async () => {
      await connect.initialize();
      await setUpDocumentNotifications();
      getDataSets();
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
      const sResource = `dataContextChangeNotice[${selectedDataSetName}]`;
      codapInterface.on("notify", sResource, undefined, handleDataContextChangeNotice);
    };

    if (selectedDataSetName) {
      setUpNotifications();
    }

  }, [selectedDataSetName]);

  useEffect(() => {
    const fetchCollections = async () => {
      const colls = await connect.getDataSetCollections(selectedDataSet.name);
      setCollections(colls);
    };

    if (selectedDataSet) {
      fetchCollections();
    } else {
      setCollections([]);
    }
  }, [selectedDataSet]);

  useEffect(() => {
    const fetchItems = async () => {
      const fetchedItems = await connect.getItems(selectedDataSet.name);
      setItems(fetchedItems);
    };

    if (collections.length === 1 && selectedDataSet) {
      fetchItems();
    } else {
      setItems([]);
    }
  }, [collections, selectedDataSet]);

  const handleSelectDataSet = (e: any) => {
    const selected = dataSets.filter((d) => d.title === e.target.value);
    return selected.length ? handleSetDataSet(selected[0].name) : handleSetDataSet(null);
  };

  const handleRefreshDataSet = () => {
    setNumUpdates(numUpdates + 1);
    return selectedDataSet ? handleSetDataSet(selectedDataSet) : handleSetDataSet(null);
  };

  const getCollectionNameFromId = (id: number) => {
    return collections.filter((c: ICollection) => c.id === id)[0].name;
  };

  return {
    dataSets,
    selectedDataSet,
    collections,
    handleSelectDataSet,
    handleRefreshDataSet,
    getCollectionNameFromId,
    items
  };
};
