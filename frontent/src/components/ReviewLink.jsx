import { useContext, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {  useSidebar } from "./context/SidebarContext";


function Card({ children, className }) {
  return <div className={`rounded-xl shadow-md ${className}`}>{children}</div>;
}

function CardContent({ children, className }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function Button({ children, className, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function ReviewPage() {
  const [rating, setRating] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Abhishek Thakur",
      text: "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI.",
      stars: 5,
    },
    {
      id: 2,
      name: "Riya Mehta",
      text: "Great platform! It helped me manage my customer feedback more effectively. The AI-generated responses are a lifesaver.",
      stars: 4,
    },
    {
      id: 3,
      name: "Arjun Kapoor",
      text: "Amazing dashboard and very clean UI. Tracking reviews and ratings has never been easier for my business.",
      stars: 5,
    },
    {
      id: 4,
      name: "Sneha Patel",
      text: "It's good overall, but I would love to see more customization options for the reports.",
      stars: 3,
    },
    {
      id: 5,
      name: "Vikram Singh",
      text: "This platform has simplified review collection and response management for us. Highly recommend it!",
      stars: 5,
    },
  ];

  const ratings = [
    { stars: "Five ", count: 999 },
    { stars: "Four ", count: 678 },
    { stars: "Three ", count: 45 },
    { stars: "Two ", count: 22 },
    { stars: "One ", count: 10 },
  ];

  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen w-full text-white">
      <div className="w-full px-2 sm:px-4 md:px-6 mx-auto transition-all duration-300">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Review Link</h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">
                  Help us grow by sharing your valuable feedback. Click the link to leave
                  your review, and subscribe to receive updates, tips, and special offers.
                </p>
                <div className="flex flex-col sm:flex-row items-center mt-4 bg-[#111] rounded-lg p-2 gap-2">
                  <input
                    type="text"
                    defaultValue="https://reviewlink.com"
                    className="bg-transparent flex-1 text-xs sm:text-sm px-2 outline-none w-full"
                  />
                  <Button className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">Edit</Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Feedback</h2>
                <div className="space-y-3 sm:space-y-4 h-[calc(100vh-300px)] overflow-y-auto pr-1" style={{scrollbarWidth:"none"}}>
                  {reviews.map((review) => (
                    <Card key={review.id} className="bg-[#1e1e3a] border-none text-white">
                      <CardContent className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-500 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{review.name}</h3>
                            <div className="text-yellow-400 text-sm sm:text-base">
                              {'⭐'.repeat(review.stars)}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-300 mt-2 break-words">{review.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-[#1e1e3a] border-none text-white h-full">
                <CardContent className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                  <h2 className="text-lg sm:text-xl font-bold mb-4">Ratings Summary</h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={ratings} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="stars" type="category" width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#facc15" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}