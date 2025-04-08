import { useState } from 'react';

interface FilterDropdownProps {
  selectedApps: string[];
  onSelectionChange: (selected: string[]) => void;
}

export default function FilterDropdown({
  selectedApps,
  onSelectionChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listAppsFilter] = useState<string[]>(['Craft', 'Scratch', 'Optimize', 'Spotlight']);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const closeFilter = () => {
    setIsOpen(false);
  };

  const handleCheckboxChange = (app: string) => {
    if (selectedApps.includes(app)) {
      onSelectionChange(selectedApps.filter((item) => item !== app));
    } else {
      onSelectionChange([...selectedApps, app]);
    }
  };

  const handleDone = () => {
    // Just close the dropdown, the state is already updated
    closeFilter();
  };

  return (
    <div className="relative  max-w-64 w-1/2 ">
      <button
        onClick={toggleFilter}
        className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left"
      >
        <span>Apps</span>
        <span>{selectedApps.length > 0 ? `(${selectedApps.length})` : ''}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg">
          <div className="flex items-center justify-between p-2 bg-blue-100 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-blue-800 font-medium">Apps</span>
            </div>
            <button
              onClick={closeFilter}
              className="text-blue-800 hover:bg-blue-200 rounded-md p-1"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-2">
            <div className="space-y-2">
              {listAppsFilter.map((app) => (
                <div key={app} className="flex items-center space-x-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id={app}
                      checked={selectedApps.includes(app)}
                      onChange={() => handleCheckboxChange(app)}
                      className="w-4 h-4 border border-gray-300 rounded"
                    />
                    <label htmlFor={app} className="ml-2 text-sm font-medium">
                      {app}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end p-2 border-t border-gray-300">
            <button
              onClick={handleDone}
              className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
