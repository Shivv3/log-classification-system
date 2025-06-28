import { useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { LayoutDashboard, FileText } from 'lucide-react'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function App() {
  const [file, setFile] = useState(null)
  const [inputPreview, setInputPreview] = useState([])
  const [results, setResults] = useState([])
  const [outputPreview, setOutputPreview] = useState([])
  const [statsTable, setStatsTable] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const f = e.target.files[0]
    setFile(f)
    setResults([])
    setOutputPreview([])
    setStatsTable([])
    if (f) {
      const formData = new FormData()
      formData.append('file', f)
      try {
        const res = await fetch('http://localhost:8000/preview', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Preview failed')
        const data = await res.json()
        setInputPreview(data.preview || [])
      } catch (err) {
        setInputPreview([])
        setError(err.message)
      }
    } else {
      setInputPreview([])
    }
  }

  const handleClassify = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults([])
    setOutputPreview([])
    setStatsTable([])
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Classification failed')
      const data = await res.json()
      setResults(data.results || [])
      setOutputPreview(data.output_preview || [])
      setStatsTable(data.stats_table || [])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleDownload = () => {
    window.open('http://localhost:8000/download', '_blank')
  }

  // Pie chart data
  const pieData = {
    labels: statsTable.map(row => row.log_class),
    datasets: [
      {
        data: statsTable.map(row => row.count),
        backgroundColor: [
          '#6366f1', '#22d3ee', '#f59e42', '#f43f5e', '#10b981', '#eab308', '#a78bfa'
        ],
      },
    ],
  }

  // Pie chart options for bigger legend and chart
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: {
            size: 18
          }
        }
      }
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center py-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4 text-center">Log Classification System</h1>
      <p className="text-gray-600 text-center mb-6">Classify logs with AI. Upload your log file and get instant predictions!</p>
      {/* Description Container */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm p-6 mb-8 w-full max-w-2xl">
        <div className="mb-3">
          <span className="font-semibold text-indigo-700">How it works:</span>
          <ul className="list-disc list-inside text-gray-700 mt-1 text-base">
            <li>Upload your log file in CSV format using the "Choose file" button below.</li>
            <li>Our AI model will analyze each log entry and classify it automatically.</li>
            <li>Get instant predictions, statistics, and visualizations for your logs.</li>
          </ul>
        </div>
        <div className="mb-3">
          <span className="font-semibold text-indigo-700">Input file format:</span>
          <ul className="list-disc list-inside text-gray-700 mt-1 text-base">
            <li>The file should be a <span className="font-mono bg-indigo-100 px-1 rounded">.csv</span> with columns: <span className="font-mono bg-indigo-100 px-1 rounded">source</span> (source of log file), <span className="font-mono bg-indigo-100 px-1 rounded">log_message</span> (the log message).</li>
            <li>Example:
              <div className="bg-white border border-gray-200 rounded p-2 mt-1 text-xs font-mono">
                source,log_message<br />
                app1,Failed to connect to database<br />
                app2,User login successful
              </div>
            </li>
          </ul>
        </div>
        <div>
          <span className="font-semibold text-indigo-700">What you get:</span>
          <ul className="list-disc list-inside text-gray-700 mt-1 text-base">
            <li>A downloadable <span className="font-mono bg-indigo-100 px-1 rounded">output.csv</span> with predicted labels for each log entry.</li>
            <li>Statistics and summary of log classes.</li>
            <li>A pie chart visualizing the distribution of predicted classes.</li>
          </ul>
        </div>
      </div>
      {/* End Description Container */}
      {/* Dashboard Heading */}
      <div className="w-full max-w-2xl mb-2 justify-center text-center flex items-center gap-2">
        <LayoutDashboard className="inline-block text-indigo-800" size={32} />
        <h2 className="text-3xl font-bold text-indigo-800 mb-2">Dashboard</h2>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 w-[95%] flex flex-col items-center">
        {/* Centered file input */}
        <div className="flex justify-center items-center w-full mb-6">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-indigo-50 text-indigo-700 font-semibold py-2 px-6 rounded-full shadow hover:bg-indigo-100 transition text-center flex items-center gap-2"
            style={{ display: 'inline-block' }}
          >
            <FileText className="inline-block mr-2" size={20} />
            Choose file
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="ml-4 text-gray-500 text-sm">
            {file ? file.name : 'No file chosen'}
          </span>
        </div>
        {/* Input Preview */}
        {inputPreview.length > 0 && (
          <div className="w-full mb-4 flex flex-col items-center">
            <div className="mb-1 font-semibold text-indigo-700 text-xl self-start">Input Preview</div>
            <div className="overflow-x-auto rounded border border-gray-200 max-h-32 mb-4 w-full" style={{maxHeight: '8rem', minHeight: '3rem', overflowY: 'auto'}}>
              <table className="min-w-full bg-white text-gray-900 text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border-b text-left font-semibold">Source</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Log Message</th>
                  </tr>
                </thead>
                <tbody>
                  {inputPreview.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50">
                      <td className="px-2 py-1 border-b">{row.source}</td>
                      <td className="px-2 py-1 border-b">{row.log_message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Centered Classify Button */}
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition disabled:opacity-50 mx-auto"
              onClick={handleClassify}
              disabled={!file || loading}
            >
              {loading ? 'Classifying...' : 'Classify'}
            </button>
          </div>
        )}
        {/* Divider between input and output */}
        {inputPreview.length > 0 && results.length > 0 && (
          <hr className="w-full border-t-2 border-indigo-300 my-8" />
        )}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {/* Output Preview, Stats, Pie Chart, Results */}
        {results.length > 0 && (
          <div className="mt-6 w-full flex flex-col items-center">
            {/* Output Preview */}
            <div className="w-full">
              <div className="text-xl font-semibold text-indigo-700 mb-2">Output Preview</div>
              <div className="overflow-x-auto rounded border border-gray-200 max-h-32 mb-2 w-full" style={{maxHeight: '8rem', minHeight: '3rem', overflowY: 'auto'}}>
                <table className="min-w-full bg-white text-gray-900 text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border-b text-left font-semibold">Source</th>
                      <th className="px-2 py-1 border-b text-left font-semibold">Log Message</th>
                      <th className="px-2 py-1 border-b text-left font-semibold">Predicted Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputPreview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50">
                        <td className="px-2 py-1 border-b">{row.source}</td>
                        <td className="px-2 py-1 border-b">{row.log_message}</td>
                        <td className="px-2 py-1 border-b">{row.predicted_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Centered Download Button */}
              <div className="flex justify-center mb-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow text-sm"
                  onClick={handleDownload}
                >
                  Download CSV
                </button>
              </div>
            </div>
            {/* Divider */}
            <hr className="w-full border-t-2 border-indigo-200 my-8" />
            {/* Stats Section: Side-by-side layout */}
            <div className="mb-8 w-full flex flex-col items-center mt-8">
              <div className="font-bold text-indigo-700 mb-1 text-lg text-center">Output Statistics</div>
              <div className="flex flex-col md:flex-row w-full justify-center gap-8 items-start">
                {/* Right: Stats Table */}
                <div className="flex-1 min-w-[260px] max-w-xs overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full text-gray-900 text-base">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 border-b text-left font-semibold">Log Class</th>
                        <th className="px-3 py-2 border-b text-left font-semibold">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsTable.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border-b">{row.log_class}</td>
                          <td className="px-3 py-2 border-b">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Divider */}
            <hr className="w-full border-t-2 border-indigo-200 my-8" />
            {/* Visualization Section */}
            <div className="mb-8 w-full flex flex-col items-center">
              <div className="font-bold text-indigo-700 text-lg text-center mb-4">Visualization</div>
              {/* Pie Chart */}
              {statsTable.length > 0 && (
                <div className="mb-8 w-full flex flex-col items-center">
                  <div className="w-80 h-80 flex items-center justify-center">
                    <Pie data={pieData} options={{
                      ...pieOptions,
                      plugins: { ...pieOptions.plugins, title: { display: true, text: 'Class Distribution', font: { size: 18 } } }
                    }} width={320} height={320} />
                  </div>
                </div>
              )}
              {/* Divider */}
              <hr className="w-full border-t-2 border-indigo-200 my-8" />
              {/* Full Results */}
              <div className="mb-2 font-semibold text-indigo-700 text-lg text-center w-full">Full Output</div>
              <div className="overflow-x-auto rounded border border-gray-200 max-h-72 w-full" style={{maxHeight: '18rem', minHeight: '6rem', overflowY: 'auto'}}>
                <table className="min-w-full bg-white text-gray-900 text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border-b text-left font-semibold">Source</th>
                      <th className="px-2 py-1 border-b text-left font-semibold">Log Message</th>
                      <th className="px-2 py-1 border-b text-left font-semibold">Predicted Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50">
                        <td className="px-2 py-1 border-b">{row.source}</td>
                        <td className="px-2 py-1 border-b">{row.log_message}</td>
                        <td className="px-2 py-1 border-b">{row.predicted_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

