'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Home, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const donationId = localStorage.getItem('visitor');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    // Set current date
    const now = new Date();
    setDate(
      now.toLocaleDateString('ar-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    // Redirect if no donation ID is provided
    if (!donationId) {
      router.push('/');
      return;
    }

    // Fetch donation details
    const fetchDonation = async () => {
        // Check if Firebase is initialized
          setAmount('100');

        const donationRef = doc(db, 'pays', donationId);
        const donationSnap = await getDoc(donationRef);

        if (donationSnap.exists()) {
          const data = donationSnap.data();
          setAmount(data.customAmount || data.amount);
        } else {
          // If donation not found, use the ID from URL params
          // This is a fallback for when Firebase isn't properly initialized
          setAmount('100');
        }

    fetchDonation();
  }
  }, [donationId, router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center border-b">
        <div className="w-8"></div> {/* Empty div for spacing */}
        <div className="text-blue-600 text-sm font-semibold">
          <div>وقف الأب</div>
          <div className="text-xs text-gray-500">وقف الرعاية الصحية</div>
        </div>
        <div className="w-8"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <Card className="mb-6 text-center border-2 border-gray-200 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">شكراً لك!</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-lg mb-4">تمت معالجة تبرعك بنجاح.</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">مبلغ التبرع:</span>
                <span className="font-bold text-blue-900">{amount} درهم</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">تاريخ التبرع:</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">رقم المعاملة:</span>
                <span className="font-mono text-sm">{donationId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الدفع:</span>
                <span className="text-green-600 font-medium">مكتمل</span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              تم إرسال تأكيد إلى بريدك الإلكتروني ورقم هاتفك.
            </p>

            <div className="flex justify-center space-x-3 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>تنزيل الإيصال</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span>مشاركة</span>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
          <p className="mb-4">
            شكراً على مساهمتك السخية في وقف الأب. سيساعد تبرعك في دعم مبادرات
            الرعاية الصحية للمحتاجين.
          </p>
          <div className="flex justify-center">
            <Image
              src="/placeholder.svg?height=60&width=200"
              alt="وقف الأب"
              width={200}
              height={60}
              className="h-12 w-auto mx-auto opacity-70"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-xs">رقم ترخيص: PRHCE-004026213</div>
          <Image
            src="/placeholder.svg?height=30&width=100"
            alt="ترخيص"
            width={100}
            height={30}
            className="h-6 w-auto"
          />
        </div>
        <div className="text-sm font-semibold">© وقف الأب</div>
      </footer>
    </div>
  );
}
