import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { User, Mail, MessageSquare, Info, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function FormDemo() {
  const [submittedData, setSubmittedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onTouched', // Validates as user interacts
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/contact', data);
      setSubmittedData(response.data.receivedData);
    } catch (err) {
      console.warn('Backend server not running. Falling back to client-side simulation.', err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmittedData(data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          React Hook Form Validation
        </h1>
        <p className="text-slate-400 mt-1 max-w-lg mx-auto">
          Demonstrates client-side validation rules, real-time error states, and submission handling using React Hook Form.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {!submittedData ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters long',
                    },
                  })}
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    errors.fullName ? 'border-red-500/55 focus:border-red-500' : 'border-slate-800 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-slate-655 focus:outline-none transition-all duration-200`}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="johndoe@example.com"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format',
                    },
                  })}
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    errors.email ? 'border-red-500/55 focus:border-red-500' : 'border-slate-800 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-slate-655 focus:outline-none transition-all duration-200`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Topic Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  Reason for Contact
                </label>
                <select
                  defaultValue=""
                  {...register('reason', {
                    required: 'Please select a reason',
                  })}
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    errors.reason ? 'border-red-500/55 focus:border-red-500' : 'border-slate-800 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white focus:outline-none transition-all duration-200`}
                >
                  <option value="" disabled>Select an option...</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="general">General Feedback</option>
                </select>
                {errors.reason && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  Your Message
                </label>
                <textarea
                  rows="4"
                  placeholder="How can we help you?"
                  {...register('message', {
                    required: 'Message content is required',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters long',
                    },
                  })}
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    errors.message ? 'border-red-500/55 focus:border-red-500' : 'border-slate-800 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-slate-655 focus:outline-none transition-all duration-200`}
                ></textarea>
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="relative flex items-start cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('agreeTerms', {
                      required: 'You must agree to the terms',
                    })}
                    className="mt-1 h-4 w-4 bg-slate-900 border border-slate-800 text-purple-600 focus:ring-purple-500/50 rounded cursor-pointer"
                  />
                  <span className="ml-2.5 text-xs sm:text-sm text-slate-400">
                    I agree to the privacy policy and terms of service.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    Submitting Form...
                  </>
                ) : (
                  'Submit Inquiry'
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-slate-950 border border-emerald-500/20 bg-emerald-500/1 rounded-2xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden animate-scaleIn">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
            
            <div className="flex justify-center mb-4 text-emerald-400">
              <CheckCircle2 className="h-14 w-14" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Form Submitted Successfully!</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Your inquiry has been processed. Below is the validated data that was captured:
            </p>

            {/* Displaying captured data */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-slate-300 space-y-2 mb-6">
              <div><span className="text-purple-400">fullName:</span> "{submittedData.fullName}"</div>
              <div><span className="text-purple-400">email:</span> "{submittedData.email}"</div>
              <div><span className="text-purple-400">reason:</span> "{submittedData.reason}"</div>
              <div><span className="text-purple-400">message:</span> "{submittedData.message}"</div>
              <div><span className="text-purple-400">agreeTerms:</span> {String(submittedData.agreeTerms)}</div>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-200"
            >
              Reset Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
