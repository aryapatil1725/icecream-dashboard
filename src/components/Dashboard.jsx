import Sidebar from "./Sidebar";
import Header from "./Header";
import Stats from "./Stats";
import ProductTable from "./ProductTable";
import Orders from "./Orders";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-pink-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-6 space-y-6 overflow-y-auto">
          <Stats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductTable />
            <Orders />
          </div>
        </div>
      </div>
    </div>
  );
}