import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-56 pt-14">

        <div className="p-6">

          <h1 className="text-lg font-bold">
            {title}
          </h1>

          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-500">
            This section will be implemented shortly.
          </p>

        </div>

      </main>

    </div>
  );
};

export default Placeholder;
