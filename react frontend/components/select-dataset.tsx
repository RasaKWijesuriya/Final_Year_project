"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "./ui/toast";

const FormSchema = z.object({
  dataset: z.string({
    required_error: "Please select an dataset to collect.",
  }),
});

export function SelectDataset() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;
      if (!backendHost) {
        throw new Error(
          "NEXT_PUBLIC_BACKEND_HOST environment variable is not defined"
        );
      }
      const response = await fetch(`${backendHost}/collect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: data.dataset }),
      });
      const responseData = await response.json();

      toast({
        title: "Data Collection Initiated",
        description: "The process of collecting data has started successfully.",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" flex space-x-2">
        <FormField
          control={form.control}
          name="dataset"
          render={({ field }) => (
            <FormItem className=" space-x-4 w-64">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="normal">Normal Dataset</SelectItem>
                  <SelectItem value="error">Error Dataset</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant={"secondary"} type="submit">
          Collect Data
        </Button>
      </form>
    </Form>
  );
}
