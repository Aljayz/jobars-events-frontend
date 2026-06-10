import { getCachedBusinessSettings } from "@/lib/business"
import Image from 'next/image'
import Link from 'next/link'

async function Footer() {
  const settings = await getCachedBusinessSettings()

  return (
    <footer className='bg-gray-950'>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div className="lg:col-span-2">
              <div className='lg:col-span-2'>
                <div className='flex items-center gap-x-3 mb-6'>
                  <Image
                    src="/images/jobars-logo.png"
                    alt='Jobars Events'
                    width={60}
                    height={60}
                    className='rounded-full'
                  />
                  <Image
                    src="/images/jobars-events.png"
                    alt='Jobars Events'
                    width={200}
                    height={60}
                    className='rounded-full'
                  />
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Creating unforgettable experiences in {settings.address}. From intimate gatherings to grand
                  celebrations, we bring your vision to life with our comprehensive event services and attention to
                  detail.
                </p>

              </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href={settings.facebook_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition-colors">
                      <Image
                        src="/images/facebook-icon.svg"
                        alt='Facebook'
                        width={24}
                        height={24}
                      />
                      Facebook Page
                  </Link>
                </li>
              </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-6">Contact Info</h4>
            <ul className="space-y-3">
              <li className="text-gray-300">{settings.address}</li>
              <li className="text-gray-300">{settings.phone}</li>
              <li className="text-gray-300">{settings.email}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2026 {settings.business_name}. All rights reserved. | {settings.address}</p>
        </div>
        
      </div>
    </footer>
  )
}

export default Footer
