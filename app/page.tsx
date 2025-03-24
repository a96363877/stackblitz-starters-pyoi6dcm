'use client';

import DonationForm from '@/components/donation-form';
import Image from 'next/image';

export default function DonationPage() {
 
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center border-b ">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Mohammed bin Rashid Al Maktoum Global Initiatives"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <img
            src="/fe-log.png"
            alt="Mohammed bin Rashid Al Maktoum Global Initiatives"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <button className="text-gray-500">
          <div className="flex flex-col gap-1">
            <div className="w-6 h-0.5 bg-gray-400"></div>
            <div className="w-6 h-0.5 bg-gray-400"></div>
            <div className="w-6 h-0.5 bg-gray-400"></div>
          </div>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1  max-w-md mx-auto w-full m-4 bg-[#ede7dd]">
      <div className="relative mb-6  w-full">
          <div className="rounded-lg overflow-hidden">
            <Image
              src="/bg.png"
              alt="Father's Endowment"
              width={500}
              height={300}
              className="w-full h-auto"
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-4">
            <h1 className="text-4xl font-bold text-teal-600 mb-2 rtl:font-semibold">
              وقف الأب
            </h1>
            <p className="text-blue-900 text-xl rtl:font-semibold">
              تبرعك صدقة جارية عن جميع الآباء
            </p>
          </div>
        </div>
        {/* Hero Section */}
        <DonationForm/>

    
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-xs">PRHCE-004026213 :رقم ترخيص</div>
          <Image
            src="/foot.webp"
            alt="License"
            width={100}
            height={30}
            className="h-6 w-auto"
          />
        </div>
        <div className="text-sm font-semibold">© FATHERS' ENDOWMENT</div>
      </footer>
    </div>
  );
}
