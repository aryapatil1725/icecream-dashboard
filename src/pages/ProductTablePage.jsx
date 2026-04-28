import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProductTable from "../components/ProductTable";

export default function ProductTablePage() {
  return (
    <div className="flex h-screen bg-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-6 overflow-y-auto">
          <ProductTable />
        </div>
      </div>
    </div>
  );
}
