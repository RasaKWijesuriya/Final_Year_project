import { createMRTColumnHelper } from "material-react-table";

const columnHelper = createMRTColumnHelper<any>();

export const columns = [
  columnHelper.accessor("Timestamp", {
    header: "Timestamp",
    size: 200,
  }),
  columnHelper.accessor("Prediction", {
    header: "Prediction",
    size: 100,
    Cell: ({ row }) => (
      <span
        className={`${
          row.original.Prediction === "Good"
            ? "text-green-600 bg-green-100 "
            : "text-red-600 bg-red-100"
        }  py-1 px-2  rounded-md`}
      >
        {row.original.Prediction === "Old" ? "Bad" : row.original.Prediction}
      </span>
    ),
  }),
  columnHelper.accessor("ACC_X", {
    header: "ACC_X",
    size: 100,
  }),
  columnHelper.accessor("ACC_Y", {
    header: "ACC_Y",
    size: 100,
  }),
  columnHelper.accessor("ACC_Z", {
    header: "ACC_Z",
    size: 100,
  }),
  columnHelper.accessor("GYR_X", {
    header: "GYR_X",
    size: 100,
  }),
  columnHelper.accessor("GYR_Y", {
    header: "GYR_Y",
    size: 100,
  }),
  columnHelper.accessor("GYR_Z", {
    header: "GYR_Z",
    size: 100,
  }),
  columnHelper.accessor("MAG_X", {
    header: "MAG_X",
    size: 100,
  }),
  columnHelper.accessor("MAG_Y", {
    header: "MAG_Y",
    size: 100,
  }),
  columnHelper.accessor("MAG_Z", {
    header: "MAG_Z",
    size: 100,
  }),
];
