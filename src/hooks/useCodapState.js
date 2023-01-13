import {useState, useEffect} from "react";
import { connect } from "../scripts/connect";

export const useCodapState = () => {
  const [dataSets, setDataSets] = useState(null);
  const [selectedDataSet, setSelectedDataSet] = useState(null);
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);

  const getDataSets = async () => {
    const sets = await connect.getListOfDatasets();
    setDataSets(sets);
  }

  const init = async () => {
    await connect.initialize();
    getDataSets();
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      const colls = await connect.getDataSetCollections(selectedDataSet.name);
      setCollections(colls);
    }
    if (!!selectedDataSet) {
      fetchCollections();
    }
  }, [selectedDataSet])

  useEffect(() => {
    const fetchItems = async () => {
      const items = await connect.getItems(selectedDataSet.name);
      setItems(items);
    }

    if (collections.length === 1) {
      fetchItems();
    }
  }, [collections])

  const handleSelectDataSet = async (e) => {
    const selected = dataSets.filter((d) => d.title === e.target.value);
    if (selected.length) {
      const dataSetInfo = await connect.getDataSet(selected[0].name);
      setSelectedDataSet(dataSetInfo);
    } else {
      setSelectedDataSet(null);
    }
  };

  const getCollectionNameFromId = (id) => {
    return collections.filter(c => c.id === id)[0].name;
  }

  return {
    dataSets,
    selectedDataSet,
    collections,
    handleSelectDataSet,
    getCollectionNameFromId,
    items
  }
}