import { createMRTColumnHelper } from "material-react-table";

const columnHelper = createMRTColumnHelper<any>();

export const columns = [
  columnHelper.accessor("Timestamp", {
    header: "Timestamp",
    size: 200,
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
