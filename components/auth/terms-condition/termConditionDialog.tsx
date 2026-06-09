'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface TermConditionDialogProps {
  onAccept: () => void;
}

function TermConditionDialog({ onAccept }: TermConditionDialogProps) {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable and if already at bottom on mount
  useEffect(() => {
    const checkScrollable = () => {
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainer;
        
        // If content is not scrollable (fits entirely in view), enable the button
        if (scrollHeight <= clientHeight) {
          setIsAtBottom(true);
        } else {
          // Check if already at bottom
          const reachedBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
          setIsAtBottom(reachedBottom);
        }
      }
    };

    // Check after component mounts and content is rendered
    const timer = setTimeout(checkScrollable, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Check if scrolled to bottom (with a small threshold for precision issues)
    const reachedBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
    
    setIsAtBottom(reachedBottom);
  };

  // Get the actual scrollable element for ScrollArea
  const handleScrollAreaScroll = () => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const reachedBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
      setIsAtBottom(reachedBottom);
    }
  };

  return (
    <>
      <DialogTitle className="text-xl font-bold mb-4 text-gray-300">Terms and Conditions</DialogTitle>
      <DialogDescription asChild>
        <div className="space-y-4">
          <ScrollArea 
            ref={scrollAreaRef} 
            className="h-96 w-full rounded-md border border-gray-600 p-4 bg-gray-700 text-gray-300"
            onScrollCapture={handleScrollAreaScroll}
          >
            <div className="pr-4">
              <h3 className="font-semibold mt-4">1. Acceptance of Terms</h3>
              <p className="text-sm mb-2">
                By creating an account with us, you agree to be bound by these Terms and Conditions, 
                our Privacy Policy, and any additional terms applicable to certain programs in which you may elect to participate.
              </p>

              <h3 className="font-semibold mt-4">2. Account Registration</h3>
              <p className="text-sm mb-2">
                To use our services, you must register for an account by providing accurate and complete information, 
                including your first name, last name, birthdate, phone number, email address, and a secure password.
              </p>
              <p className="text-sm mb-2">
                You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.
              </p>

              <h3 className="font-semibold mt-4">3. Eligibility</h3>
              <p className="text-sm mb-2">
                You must be at least 13 years old to register for an account. If you are under 18, you must have permission from a parent or legal guardian.
              </p>

              <h3 className="font-semibold mt-4">4. Data Collection and Privacy</h3>
              <p className="text-sm mb-2">
                We collect and process your personal data as described in our Privacy Policy. By creating an account, you consent to:
              </p>
              <ul className="text-sm list-disc pl-5 mb-2">
                <li>Collection of the information you provide during registration</li>
                <li>Use of your data to provide and improve our services</li>
                <li>Communication regarding your account and our services</li>
              </ul>

              <h3 className="font-semibold mt-4">5. User Responsibilities</h3>
              <p className="text-sm mb-2">
                You agree to:
              </p>
              <ul className="text-sm list-disc pl-5 mb-2">
                <li>Provide accurate and current information</li>
                <li>Update your information if it changes</li>
                <li>Not share your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="font-semibold mt-4">6. Account Security</h3>
              <p className="text-sm mb-2">
                You are responsible for safeguarding your password and for any activities or actions under your account.
              </p>

              <h3 className="font-semibold mt-4">7. Communications</h3>
              <p className="text-sm mb-2">
                By providing your email address and phone number, you consent to receive electronic communications from us regarding your account, 
                security updates, product information, and promotional materials. You may opt-out of promotional communications at any time.
              </p>

              <h3 className="font-semibold mt-4">8. Termination</h3>
              <p className="text-sm mb-2">
                We reserve the right to suspend or terminate your account at our sole discretion if we believe you have violated these Terms and Conditions.
              </p>

              <h3 className="font-semibold mt-4">9. Limitation of Liability</h3>
              <p className="text-sm mb-2">
                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
              </p>

              <h3 className="font-semibold mt-4">10. Changes to Terms</h3>
              <p className="text-sm mb-2">
                We may modify these Terms and Conditions at any time. We will provide notice of significant changes through our website or via email. 
                Continued use of our services after changes constitutes acceptance of the modified terms.
              </p>

              <h3 className="font-semibold mt-4">11. Governing Law</h3>
              <p className="text-sm mb-4">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is established.
              </p>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-x-2">
            <div className="text-xs text-gray-500">
              {!isAtBottom && "Please scroll to the bottom to continue"}
            </div>
            <Button 
              type="button" 
              disabled={!isAtBottom}
              onClick={onAccept}
              className={isAtBottom ? `bg-yellow-400 hover:bg-yellow-500 text-gray-800` : ''}
            >
              Accept
            </Button>
          </div>
        </div>
      </DialogDescription>
    </>
  )
}

export default TermConditionDialog;