"use client";

import React, { useState } from 'react';
import { Mail, Phone, Send, MapPin, Clock } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      content: "basebd25@gmail.com"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      content: "+880 1234 567 890"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location",
      content: "Amigo 14 Square, Asad Avenue, Mohammadpur"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Hours",
      content: "Mon-Fri 9AM-6PM"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 uppercase bg-red-50 px-4 py-2 rounded-full mb-4">
            <Mail className="w-4 h-4 text-red-800" />
            <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">Get In Touch</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase text-black mb-3">
            Have a{' '}
            <span className="text-red-800">Question?</span>
          </h2>
          <div className="w-16 h-1 bg-red-800 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-black/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-black mb-2">Send us a Message</h3>
              <p className="text-black/70 text-sm">We'll get back to you shortly</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Your Name *"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Your Email *"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="Your Message *"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-black mb-4">Contact Information</h3>
              <p className="text-black/70 text-sm mb-6">
                Have questions about the event? We're here to help!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border border-black/5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-800">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-black text-sm">{info.title}</h4>
                      <p className="text-black/70 text-sm">{info.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Note */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-red-800 text-sm font-medium">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}