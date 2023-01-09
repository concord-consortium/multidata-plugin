import { connect } from "./connect";

export const notify = {
  setUpDocumentNotifications: async function () {
      //  receive notifications about doc changes, especially number of datasets
      //  (user has added or deleted a dataset)
      const tResource = `documentChangeNotice`;
      codapInterface.on(
          'notify',
          tResource,
          //  'updateAttribute',
          notify.handleDocumentChangeNotice
      );
  },
  /**
   * Ask to be notified about changes in attributes and selections
   * @returns {Promise<void>}
   */
  setUpNotifications: async function () {
    const name = connect.state.selectedDataSet;
    if (name) {
      //  register to receive notifications about changes to the data context (including selection)
      const sResource = `dataContextChangeNotice[${name}]`;
      codapInterface.on(
          'notify',
          sResource,
          //'selectCases',
          notify.handleDataContextChangeNotice
      );
    }
  },

  handleDataContextChangeNotice: function (iMessage) {
      const name = connect.state.selectedDataSet;
      if (iMessage.resource === `dataContextChangeNotice[${name}]`) {
          this.nHandled++;
          if (this.nHandled % 50 === 0) {
          }

          const theValues = iMessage.values;
          switch (theValues.operation) {
              case `selectCases`:
              case `updateCases`:
                  choosy.handlers.handleSelectionChangeFromCODAP();
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

                  choosy_ui.update();     //  which reads the database structure (cols, atts) from CODAP
                  break;
              //  todo: alter when JS fixes the bug about not issuing notifications for plugin-initiated changes.

              case `updateDataContext`:       //  includes renaming dataset, so we have to redo the menu
                  choosy.setUpDatasets();
                  choosy_ui.update();
                  break;

              case 'createCases':
              case 'createItems':
                  break;

              default:
                  break;
          }
      }
  },

  handleDocumentChangeNotice: function (iMessage) {
      this.nHandled++;
      // choosy.log(`handleDocumentChange operation: ${theValues.operation}`);
      choosy.setUpDatasets();
  },

}


  // const setUpDocumentNotifications = async () => {
  //   console.log("I am setUpDocumentNotifications");
  //   const tResource = `documentChangeNotice`;
  //   codapInterface.on(
  //       'notify',
  //       tResource,
  //       //  'updateAttribute',
  //       handleDocumentChangeNotice
  //   );
  // };

  // const setUpNotifications = async () => {
  //   //  register to receive notifications about changes to the data context (including selection)
  //   const sResource = `dataContextChangeNotice[${selectedDataSet}]`;
  //   codapInterface.on(
  //       'notify',
  //       sResource,
  //       //'selectCases',
  //       handleDataContextChangeNotice
  //   );
  // };

  // const handleStateUpdate = () => {
  //   console.log("datasetupdates", dataSetUpdates);
  //   setDataSetUpdates([...dataSetUpdates, 'true']);
  // }

  // const handleDocumentChangeNotice = (iMessage) =>{
  //   console.log("handleDocumentChangeNotice IMessage", iMessage);
  //   getDataSets();
  // }

  // const handleUpdate = () => {
  //   console.log("I AM HANDLE UPDATE!");
  //   console.log("dataSetUpdates before I change it", dataSetUpdates);
  //   console.log("[...dataSetUpdates] before I change it", [...dataSetUpdates]);
  //   const newUpdates = [...dataSetUpdates];
  //   console.log("newUpdates before I change it", newUpdates);
  //   newUpdates.push("update");
  //   console.log("newUpdates after I change it", newUpdates);
  //   setDataSetUpdates(newUpdates);
  // }

  // const handleDataContextChangeNotice = (iMessage) => {
  //   console.log("handleDataContextChangeNotice IMessage", iMessage);
  //   if (iMessage.resource === `dataContextChangeNotice[${selectedDataSet}]`) {
  //     const theValues = iMessage.values;
  //     console.log("theValues.operation", theValues.operation);
  //     switch (theValues.operation) {
  //       case 'createCollection':
  //         handleUpdate();
  //         break;
  //       default:
  //         handleUpdate();
  //         break;
  //     }
  //   }
  // };