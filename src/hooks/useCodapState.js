import {useState, useEffect} from "react";
import { connect } from "../scripts/connect";

export const useCodapState = () => {
  const [dataSets, setDataSets] = useState(null);
  const [selectedDataSet, setSelectedDataSet] = useState(null);
  const [collections, setCollections] = useState([]);
  const [itemCount, setItemCount] = useState(0);

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
      const colls = await connect.getDataSetCollections(selectedDataSet);
      const iCount = await connect.getItemCount(selectedDataSet);
      setCollections(colls);
      setItemCount(iCount)
    }
    if (selectedDataSet) {
      fetchCollections();
    }
  }, [selectedDataSet])


  const handleSelectDataSet = (e) => {
    setSelectedDataSet(e.target.value);
  };

  const getCollectionNameFromId = (id) => {
    return collections.filter(c => c.id === id)[0].name;
  }

  return {
    dataSets,
    selectedDataSet,
    collections,
    handleSelectDataSet,
    itemCount,
    getCollectionNameFromId
  }
}