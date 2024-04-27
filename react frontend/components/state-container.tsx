import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
const StateContainer = ({ prediction, startFetch, setStartFetch,handleLoadHistory }: any) => {
  return (
    <div className="p-6 py-8 my-8 rounded-sm border bg-card text-card-foreground shadow min-w-[32rem] relative flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
      <div className="flex  items-center space-x-4 min-w-fit">
        <div className="-space-y-2">
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>

        <span
          className={`${prediction === "Good"
            ? "text-green-600 bg-green-100"
            : prediction === "Waiting..."
              ? "text-gray-600 bg-gray-100"
              : "text-red-600 bg-red-100"
            } py-1 px-2 pr-3 flex items-center  rounded-full`}
        >
          <span className="relative mr-3 flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${prediction === "Good"
                ? "bg-green-400 "
                : prediction === "Waiting..."
                  ? "bg-gray-400"
                  : "bg-red-400"
                }  opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3  ${prediction === "Good"
                ? "bg-green-400 "
                : prediction === "Waiting..."
                  ? "bg-gray-400"
                  : "bg-red-400"
                }`}
            ></span>
          </span>
          {prediction === "Bad" ? "Bad" : prediction}
        </span>
        <span className="text-xs text-muted-foreground">
          {"- predicted result"}
        </span>
      </div>
      <div className="ml-auto flex w-full space-x-2 sm:justify-end">
        <Button color="secondary" onClick={() => handleLoadHistory()} >
          Load History
        </Button>
        <Button color="secondary" onClick={() => setStartFetch(!startFetch)} >
          {startFetch ? "Stop" : "Start"}  Listing
        </Button>
        <Button asChild>
          <Link href={"/traning-dashboard"}>Go to Traning Dashboard</Link>
        </Button>

      </div>
    </div>
  );
};

export default StateContainer;
