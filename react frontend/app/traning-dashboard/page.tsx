import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import dynamic from "next/dynamic";
import TrainController from "@/components/train-controller";
import Link from "next/link";
const DataTable = dynamic(() => import("./table"), { ssr: false });
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Training Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        cardTitle="VBKit Model Training Dashboard"
        cardDescription="Monitoring and managing the training of VBKit models, providing real-time updates on training progress"
      />
      <TrainController />
      <DataTable />
    </>
  );
}
