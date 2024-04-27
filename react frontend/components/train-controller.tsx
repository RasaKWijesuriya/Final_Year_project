import React from "react";
import { SelectDataset } from "./select-dataset";
import { TrainModel } from "./train-model";
const TrainController = () => {
  return (
    <div className="p-6 py-8 my-8 rounded-sm border bg-card text-card-foreground shadow min-w-[32rem] relative flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
      <div className="flex  items-center space-x-2 min-w-fit">
        <h2 className="text-lg font-semibold">Playground</h2>
        <span className="text-xs font-light  bg-green-200 p-1 px-3 rounded-full">
          Collecting data ...
        </span>
      </div>
      <div className="ml-auto flex w-full space-x-2 sm:justify-end">
        <SelectDataset />
        <TrainModel />
      </div>
    </div>
  );
};

export default TrainController;
