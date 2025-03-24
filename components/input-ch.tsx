"use client"

import { Check } from 'lucide-react'
import { useState, useEffect } from "react"

interface CheckmarkInputProps {
  value?: string
  isValid?: boolean
  className?: string
}

export default function CheckmarkInput({ value, isValid = true, className = "" }: CheckmarkInputProps) {
  return (
    <div className={`flex items-center justify-between border-2 ${isValid ? 'border-green-500' : 'border-gray-300'} rounded-md p-3 mb-2 bg-white ${className}`}>
      <span className="text-gray-700">{value || "المبلغ صحيح"}</span>
      {isValid && <Check className="text-green-500 h-5 w-5" />}
    </div>
  )
}
