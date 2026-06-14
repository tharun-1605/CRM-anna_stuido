import { Image as ImageIcon, Download } from 'lucide-react';

export default function ScreenshotViewer() {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-blue-400">
          <ImageIcon className="w-6 h-6 mr-3" />
          <h2 className="text-2xl font-bold">Screenshot Viewer</h2>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center">
          <Download className="w-4 h-4 mr-2" /> Download ZIP
        </button>
      </div>

      <div className="w-64 bg-[#1e2329] p-4 rounded border border-gray-800 space-y-4 absolute top-16 left-0 z-10">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Select User</label>
          <select className="w-full bg-[#181b21] border border-gray-700 rounded px-2 py-1.5 text-white text-sm">
            <option></option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start Date</label>
          <input type="date" className="w-full bg-[#181b21] border border-gray-700 rounded px-2 py-1.5 text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">End Date</label>
          <input type="date" className="w-full bg-[#181b21] border border-gray-700 rounded px-2 py-1.5 text-white text-sm" />
        </div>
        <button className="bg-gray-200 hover:bg-white text-black px-4 py-1.5 rounded text-sm font-medium w-full flex items-center justify-center mt-2">
          Load Screenshots
        </button>
      </div>

      <div className="flex-1 flex items-end justify-center pb-20">
        <div className="bg-[#111317] border border-gray-800 p-8 rounded-xl flex flex-col items-center justify-center opacity-80">
          <Download className="w-12 h-12 text-gray-500 mb-4" />
          <span className="text-gray-400 font-medium">Scroll Lock On</span>
        </div>
      </div>
    </div>
  );
}
