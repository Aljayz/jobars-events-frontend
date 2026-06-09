'use client'

import { Send, User, Mail, MessageSquare, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitContact } from '@/app/contact/actions'

function Contact() {
  return (
    <section id="contact" className='py-16 sm:py-24 bg-gradient-to-t from-black to-gray-900 px-4 sm:px-6'>
        <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>

                {/* Left Side: Text Content */}
                <div className='space-y-6 text-center lg:text-left animate-fade-in-up'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs sm:text-sm font-medium'>
                        <MessageSquare className='size-3.5 sm:size-4' />
                        <span>Communication is Key</span>
                    </div>
                    <h2 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight'>
                        Ready to Start Your <span className='text-yellow-400 italic'>Next Event?</span>
                    </h2>
                    <p className='text-sm sm:text-base lg:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0'>
                        Have an event in mind? Fill out the form and we&apos;ll get back to you as soon as possible to discuss your vision. We typically respond within 24 hours.
                    </p>

                    <div className='hidden lg:block pt-8 border-t border-gray-800'>
                        <div className='flex items-center gap-4 text-gray-500 italic text-sm'>
                            <span>• Weddings</span>
                            <span>• Corporate</span>
                            <span>• Birthdays</span>
                            <span>• Reunions</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form Card */}
                <div className='bg-gray-800/40 border border-gray-700/50 p-6 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group animate-fade-in-up stagger-2'>
                    <div className="absolute -top-24 -right-24 size-48 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-400/10 transition-colors duration-500"></div>

                    <form action={submitContact} className='space-y-6 relative z-10'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div className='space-y-2'>
                                <Label htmlFor="contact-name" className="text-gray-300 text-sm font-medium ml-1">Your Name</Label>
                                <div className='relative'>
                                    <User className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500' />
                                    <Input
                                        id="contact-name"
                                        name="name"
                                        placeholder="John Doe"
                                        className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                                    />
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor="contact-email" className="text-gray-300 text-sm font-medium ml-1">Your Email</Label>
                                <div className='relative'>
                                    <Mail className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500' />
                                    <Input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor="contact-subject" className="text-gray-300 text-sm font-medium ml-1">Subject</Label>
                            <div className='relative'>
                                <Tag className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500' />
                                <Input
                                    id="contact-subject"
                                    name="subject"
                                    placeholder="Event Inquiry"
                                    className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor="contact-message" className="text-gray-300 text-sm font-medium ml-1">Message</Label>
                            <textarea
                                id="contact-message"
                                name="message"
                                aria-label="Message"
                                placeholder="Tell us more about your event..."
                                className="w-full min-h-[120px] sm:min-h-[150px] bg-gray-900/60 border border-gray-700 rounded-2xl p-4 text-white text-sm focus:border-yellow-400 focus:outline-none transition-all resize-none placeholder:text-gray-600"
                            ></textarea>
                        </div>

                        <Button type="submit" className='w-full h-12 sm:h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-400/10'>
                            Send Message
                            <Send className='size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Contact
