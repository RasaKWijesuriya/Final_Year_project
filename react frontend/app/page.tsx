import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import dynamic from "next/dynamic";
import Link from "next/link";
const PredictionDataTable = dynamic(() => import("./datatable/page"), {
  ssr: false,
});
export default function Home() {
  return (
    <>
      <Header
        breadcrumb={
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        cardTitle="VBKit Vibration Prediction System"
        cardDescription="VBKit is a  system that accurately predicts vibration status based on sensor data"
      />
      <PredictionDataTable />
    </>
  );
}
