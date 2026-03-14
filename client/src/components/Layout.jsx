export default function Layout({ children }) {
  return (
    <div className="min-h-screen transition-colors duration-300
       from-blue-50 via-white to-indigo-50
      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      text-gray-800 dark:text-gray-200">
      {children}
    </div>
  );
}
