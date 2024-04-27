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
import { columns } from "./TableColumns";

const TableData = () => {
  const [wsData, setWsData] = useState<any[]>([]);

  // Connecting to WebSocket to fetch realtime data
  useEffect(() => {
    const mainDataStreamUrl = process.env.NEXT_PUBLIC_COLLECTION_DATA_STREAM;
    if (!mainDataStreamUrl) {
      throw new Error(
        "NEXT_PUBLIC_COLLECTION_DATA_STREAM environment variable is not defined"
      );
    }
    const socket = new WebSocket(mainDataStreamUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Connected.");
      if (
        wsData.length === 0 ||
        JSON.stringify(wsData[0]) !== JSON.stringify(data)
      ) {
        const formattedData = {
          ...data,
          ACC_X: data.SensorData[0],
          ACC_Y: data.SensorData[1],
          ACC_Z: data.SensorData[2],
          GYR_X: data.SensorData[3],
          GYR_Y: data.SensorData[4],
          GYR_Z: data.SensorData[5],
          MAG_X: data.SensorData[6],
          MAG_Y: data.SensorData[7],
          MAG_Z: data.SensorData[8],
        };
        setWsData((prevData) => [formattedData, ...prevData]);
      }
    };

    socket.onclose = (event) => {
      console.error("WebSocket closed:", event.code, event.reason);
    };

    return () => {
      socket.close();
    };
  }, [wsData]);

  // handing pdf export
  const handleExportRows = (rows: MRT_Row<any>[]) => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => [
      row.original.Timestamp,
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
    return [...wsData];
  }, [wsData]);

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
      <MaterialReactTable table={table} />
    </>
  );
};

export default TableData;
