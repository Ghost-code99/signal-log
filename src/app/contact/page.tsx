import { ContactForm } from '@/components/contact-form'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata = {
  title: 'Contact | Signal Log',
  description: 'Get in touch with the Signal Log team'
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    hello@signallog.com
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    123 Innovation Drive<br />
                    Tech City, TC 12345
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Sat: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Why Contact Us?</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Technical support</li>
              <li>• Feature requests</li>
              <li>• Partnership opportunities</li>
              <li>• General inquiries</li>
              <li>• Bug reports</li>
            </ul>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
