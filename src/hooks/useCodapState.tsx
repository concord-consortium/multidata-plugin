import {useState, useEffect} from "react";
import { connect } from "../scripts/connect";

export const useCodapState = () => {
  const [dataSets, setDataSets] = useState<any[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<any>(null);
  const [collections, setCollections] = useState<ICollections>([]);
  const [items, setItems] = useState<any[]>([]);

  const getDataSets = async () => {
    const sets = await connect.getListOfDatasets();
    setDataSets(sets);
  };

  useEffect(() => {
    const init = async () => {
      await connect.initialize();
      getDataSets();
    };

    init();
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      const colls = await connect.getDataSetCollections(selectedDataSet.name);
      setCollections(colls);
    };

    if (selectedDataSet) {
      fetchCollections();
    }

  }, [selectedDataSet]);

  useEffect(() => {
    const fetchItems = async () => {
      const fetchedItems = await connect.getItems(selectedDataSet.name);
      setItems(fetchedItems);
    };

    if (collections.length === 1 && selectedDataSet) {
      fetchItems();
    }

  }, [collections, selectedDataSet]);

  const handleSelectDataSet = async (e: any) => {
    const selected = dataSets.filter((d) => d.title === e.target.value);
    if (selected.length) {
      const dataSetInfo = await connect.getDataSet(selected[0].name);
      setSelectedDataSet(dataSetInfo);
    } else {
      setSelectedDataSet(null);
    }
  };

  const getCollectionNameFromId = (id: number) => {
    return collections.filter(c => c.id === id)[0].name;
  };

  return {
    dataSets,
    selectedDataSet,
    collections,
    handleSelectDataSet,
    getCollectionNameFromId,
    items
  };
};
