import React from "react";
import { Link } from "react-router-dom";

const testimonials = [
  {
    id: 1,
    stars: 5,
    text: "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI. The dashboard is clean, and I can track all my customer feedback in one place.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    stars: 5,
    text: "As a business owner, I’ve found this platform incredibly useful for managing customer feedback. Not only helps me collect reviews through email, SMS, and QR codes but also generates AI-driven replies that save me a lot of time. The analytics dashboard gives great insights into customer sentiment and performance trends.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    stars: 5,
    text: "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI. The dashboard is clean, and I can track all my customer feedback in one place.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=3",
  },
   {
    id: 4,
    stars: 5,
    text: "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI. The dashboard is clean, and I can track all my customer feedback in one place.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 5,
    stars: 5,
    text: "As a business owner, I’ve found this platform incredibly useful for managing customer feedback. Not only helps me collect reviews through email, SMS, and QR codes but also generates AI-driven replies that save me a lot of time. The analytics dashboard gives great insights into customer sentiment and performance trends.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 6,
    stars: 5,
    text: "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI. The dashboard is clean, and I can track all my customer feedback in one place.",
    name: "Abhishek Thakur",
    role: "Manager",
    img: "https://i.pravatar.cc/100?img=3",
  },
];

const TestimonialCard = ({ stars, text, name, role, img }) => (
  <div className="relative group">
    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-all duration-300 group-hover:duration-200"></div>
    <div className="relative bg-[#12122b] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-800 group-hover:border-purple-500/30">
    <div className="flex items-center mb-3">
      <span className="text-yellow-400 text-lg">
        {"★".repeat(stars)}{"☆".repeat(5 - stars)}
      </span>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed mb-4">{text}</p>
    <div className="flex items-center space-x-3">
      <img src={img} alt={name} className="w-10 h-10 rounded-full" />
      <div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-gray-400 text-sm">{role}</p>
      </div>
    </div>
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <section className=" text-white py-12">
      <div className="text-center max-w-3xl mx-auto mb-10 px-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          What Our <span className="text-purple-400">Customer</span>Say
        </h2>
        <p className="text-gray-400 mt-2">
          Here from our incredible customers who are building at lightning speed
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/all-reviews">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition">
          View All
        </button>
        </Link>
      </div>
    </section>
  );
};

export default Testimonials;
