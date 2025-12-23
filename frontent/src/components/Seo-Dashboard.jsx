import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const keywordData = [
  { name: "1", new: 20000, lost: 10000 },
  { name: "2", new: 35000, lost: 15000 },
  { name: "3", new: 50000, lost: 20000 },
  { name: "4", new: 40000, lost: 10000 },
  { name: "5", new: 45000, lost: 15000 },
  { name: "6", new: 30000, lost: 12000 },
  { name: "7", new: 42000, lost: 14000 },
];

const backlinkData = [
  { name: "1", new: 15000, lost: 8000 },
  { name: "2", new: 30000, lost: 12000 },
  { name: "3", new: 25000, lost: 10000 },
  { name: "4", new: 35000, lost: 15000 },
  { name: "5", new: 28000, lost: 12000 },
  { name: "6", new: 32000, lost: 14000 },
  { name: "7", new: 22000, lost: 11000 },
];

export default function SeoDashboard() {
  return (
    <div className="min-h-screen bg-[#2a2440] text-white p-6">
      <div className=" mx-auto mt-10 lg:mt-20">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">
          Boost Your Reputation & Rank Higher with <br />
          <span className="text-[#5e6bff]">AI-Powered Reviews and SEO</span>
        </h1>
        <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
          Collect customer reviews, manage them with AI, and optimize your SEO—all in one powerful dashboard. Build trust, improve visibility, and grow your business effortlessly.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 ">
        {[
          "Visits",
          "Unique visitors",
          "Page/Visits",
          "Avg. Visit Duration",
          "Bounce Rate",
          "Traffic Rank",
        ].map((title, i) => (
          <div
            key={i}
            className="bg-[#241a55] border-none rounded-2xl text-center py-6"
          >
            <h3 className="text-lg font-semibold">{title} May</h3>
            <p className="text-2xl font-bold mt-2">198.5k</p>
            <p className="text-red-500 mt-1">6.8%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#241a55] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Keyword</h2>
            <span className="text-sm text-gray-400">19 June 2019 - 20 July 2020</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={keywordData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="new" stackId="a" fill="#2d8cff" />
              <Bar dataKey="lost" stackId="a" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>

          <table className="w-full mt-6 text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2">Keyword</th>
                <th>Position</th>
                <th>Volume</th>
                <th>Traffic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">YouTube View</td>
                <td>1 (2)</td>
                <td>12.8k</td>
                <td>0.0%</td>
              </tr>
              <tr>
                <td className="py-2">What is SEO</td>
                <td>2 (3)</td>
                <td>12.8k</td>
                <td>0.0%</td>
              </tr>
              <tr>
                <td className="py-2">Get Subscribe for YouTube</td>
                <td>1 (2)</td>
                <td>12.8k</td>
                <td>0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#241a55] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Backlink</h2>
            <span className="text-sm text-gray-400">19 June 2019 - 20 July 2020</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={backlinkData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="new" stackId="a" fill="#2d8cff" />
              <Bar dataKey="lost" stackId="a" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>

          <table className="w-full mt-6 text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2">Source page</th>
                <th>Page score</th>
                <th>First Seen</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">http://youtube.com</td>
                <td>88</td>
                <td>6-06-2016</td>
                <td>7-08-2022</td>
              </tr>
              <tr>
                <td className="py-2">http://youtube.com</td>
                <td>88</td>
                <td>6-06-2016</td>
                <td>7-08-2022</td>
              </tr>
              <tr>
                <td className="py-2">http://youtube.com</td>
                <td>88</td>
                <td>6-06-2016</td>
                <td>7-08-2022</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}