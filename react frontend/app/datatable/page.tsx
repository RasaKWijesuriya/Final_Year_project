"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
} from "material-react-table";
import { Box, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { database } from "../../firebase.config";
import { get, ref, push, set } from "firebase/database";
import { columns } from "./TableColumns";
import StateContainer from "@/components/state-container";
import axios from 'axios'
import firebase from 'firebase/app';
import 'firebase/database';


const TableData = () => {
  const [wsData, setWsData] = useState<any[]>([]);
  const [fbData, setFbData] = useState<any>([]);
  const [startFetch, setStartFetch] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<string | null>(
    "Waiting..."
  );
  //fetching data from the node server BE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8070/data");
        const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;

        const data = response.data;
        const dataList =
        {
          "time": data.timestamp,
          "Acceleration_x": data.accelx,
          "Acceleration_y": data.accely,
          "Acceleration_z": data.accelz,
          "Gyroscope_x": data.gyrox,
          "Gyroscope_y": data.gyrox,
          "Gyroscope_z": data.gyroz,
          "magnetic_x": data.magx,
          "magnetic_y": data.magy,
          "magnetic_z": data.magz
        }
        //Making data list & send it to python BE server to calculate prediction
        const res = await axios.post(`${backendHost}/predict`, dataList, {
          headers: {
            "Content-Type": "application/json",
          }
        });

        // Given timestamp string
        const timestampString = data.timestamp;

        // Convert timestamp string to Date object
        const date = new Date(timestampString);

        // Extract individual date-time components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is 0-indexed, so add 1
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Format the date-time string as desired (e.g., "YYYY-MM-DD HH:MM:SS")
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        //collect prediction and sent data and pass it to table row
        const formattedData = {
          ...data,
          ACC_X: data.accelx,
          ACC_Y: data.accely,
          ACC_Z: data.accelz,
          GYR_X: data.gyrox,
          GYR_Y: data.gyroy,
          GYR_Z: data.gyroz,
          MAG_X: data.magx,
          MAG_Y: data.magy,
          MAG_Z: data.magz,
          Prediction: res.data.prediction,
          Timestamp: formattedDateTime
        };

        const payload = {
          'accelx': data.accelx,
          'accely': data.accely,
          'accelz': data.accelz,
          'gyrox': data.gyrox,
          'gyroy': data.gyroy,
          'gyroz': data.gyroz,
          'magx': data.magx,
          'magy': data.magy,
          'magz': data.magz,
          'prediction': res.data.prediction
        }

        const uploadResponse = await axios.post("http://localhost:8070/addtohistory", payload);

        //set table data
        setWsData((prevData) => [formattedData, ...prevData]);
        setLatestPrediction(res.data.prediction); // Update the latest prediction

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (startFetch) {
      fetchData();
    }
  }, [wsData, startFetch]);

  // Connecting to WebSocket to fetch realtime data
  // useEffect(() => {
  //   const mainDataStreamUrl = process.env.NEXT_PUBLIC_MAIN_DATA_STREAM;
  //   if (!mainDataStreamUrl) {
  //     throw new Error(
  //       "NEXT_PUBLIC_MAIN_DATA_STREAM environment variable is not defined"
  //     );
  //   }
  //   const socket = new WebSocket(mainDataStreamUrl);

  //   socket.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     console.log("WS Connected.");
  //     if (
  //       wsData.length === 0 ||
  //       JSON.stringify(wsData[0]) !== JSON.stringify(data)
  //     ) {
  //       const formattedData = {
  //         ...data,
  //         ACC_X: data.SensorData[0],
  //         ACC_Y: data.SensorData[1],
  //         ACC_Z: data.SensorData[2],
  //         GYR_X: data.SensorData[3],
  //         GYR_Y: data.SensorData[4],
  //         GYR_Z: data.SensorData[5],
  //         MAG_X: data.SensorData[6],
  //         MAG_Y: data.SensorData[7],
  //         MAG_Z: data.SensorData[8],

  //       };
  //       setWsData((prevData) => [formattedData, ...prevData]);
  //       setLatestPrediction(formattedData.Prediction); // Update the latest prediction
  //       console.log(latestPrediction);
  //     }
  //   };

  //   socket.onclose = (event) => {
  //     console.error("WebSocket closed:", event.code, event.reason);
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, [wsData]);

  // Connection to Firebase to fetch historical data
  useEffect(() => {// Connection to Firebase to fetch historical data
    const fetchDataFromFirebase = async () => {
      try {
        const snapshot = await get(ref(database, "dest"));
        console.log(snapshot.val());
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.values(data)
            .reverse()
            .map((item: any) => ({
              Timestamp: item.Timestamp,
              Prediction: item.Prediction,
              ACC_X: item.SensorData[0],
              ACC_Y: item.SensorData[1],
              ACC_Z: item.SensorData[2],
              GYR_X: item.SensorData[3],
              GYR_Y: item.SensorData[4],
              GYR_Z: item.SensorData[5],
              MAG_X: item.SensorData[6],
              MAG_Y: item.SensorData[7],
              MAG_Z: item.SensorData[8],
            }));

          setFbData(formattedData);

          // Update the latest prediction
          if (formattedData.length > 0) {
            setLatestPrediction(formattedData[0].Prediction);
          }
        }
      } catch (error) {
        console.error("Error fetching data from Firebase: ", error);
      }
    };

    fetchDataFromFirebase();
  }, []);

  // handing pdf export
  const handleExportRows = (rows: MRT_Row<any>[]) => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => [
      row.original.Timestamp,
      row.original.Prediction,
      row.original.ACC_X,
      row.original.ACC_Y,
      row.original.ACC_Z,
      row.original.GYR_X,
      row.original.GYR_Y,
      row.original.GYR_Z,
      row.original.MAG_X,
      row.original.MAG_Y,
      row.original.MAG_Z,
    ]);
    const tableHeaders = columns.map((c) => c.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
    });
    doc.save("VBKit-data-export.pdf");
  };

  const tableData = useMemo(() => {
    return [...wsData, ...fbData];
  }, [wsData, fbData]);

  const handleLoadHistory = async () => {
    const response = await axios.get("http://localhost:8070/all");

    const dataList = response.data;
    dataList.map((data :any) => {
      // Given timestamp string
      const timestampString = data.timestamp;

      // Convert timestamp string to Date object
      const date = new Date(timestampString);

      // Extract individual date-time components
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Month is 0-indexed, so add 1
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      // Format the date-time string as desired (e.g., "YYYY-MM-DD HH:MM:SS")
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      //collect prediction and sent data and pass it to table row
      const formattedData = {
        ...data,
        ACC_X: data.accelx,
        ACC_Y: data.accely,
        ACC_Z: data.accelz,
        GYR_X: data.gyrox,
        GYR_Y: data.gyroy,
        GYR_Z: data.gyroz,
        MAG_X: data.magx,
        MAG_Y: data.magy,
        MAG_Z: data.magz,
        Prediction: data.prediction,
        Timestamp: formattedDateTime
      };

      //set table data
      setWsData((prevData) => [formattedData, ...prevData]);
      setLatestPrediction(data.prediction); // Update the latest prediction
    })

  }

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableRowSelection: false,
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          padding: "8px",
          flexWrap: "wrap",
          borderRadius: "16px",
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  return (
    <>
      <StateContainer prediction={latestPrediction} handleLoadHistory={handleLoadHistory} setStartFetch={setStartFetch} startFetch={startFetch} />
      <MaterialReactTable table={table} />
    </>
  );
};

export default TableData;
