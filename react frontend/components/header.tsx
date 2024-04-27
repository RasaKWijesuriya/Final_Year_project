import React, { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface headerTypes {
  breadcrumb: ReactNode;
  cardTitle: string;
  cardDescription: string;
}
const Header = ({ breadcrumb, cardTitle, cardDescription }: headerTypes) => {
  return (
    <Card className="min-w-[32rem] relative">
      <CardHeader className="my-2">
        {breadcrumb}
        <div className="flex   items-center justify-between space-x-10">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default Header;
