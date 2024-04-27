"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "./ui/toast";

export function TrainModel() {
  async function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    try {
      const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;
      if (!backendHost) {
        throw new Error(
          "NEXT_PUBLIC_BACKEND_HOST environment variable is not defined"
        );
      }
      const response = await fetch(`${backendHost}/train`, {
        method: "POST",
      });
      const responseData = await response.json();

      toast({
        title: "Initiating Machine Learning Model Training",
        description:
          "The process of training the machine learning model has been successfully initiated and is now in progress.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",

        description: "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Button type="submit">Train ML Model</Button>
    </form>
  );
}
