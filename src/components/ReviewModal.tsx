import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitReview } from '../lib/api';
import { Listing, Review } from '../types';
import { 
  X, Star, Shield, Droplets, Zap, Wifi, Sparkles, Volume2, DollarSign, Send, CheckCircle2, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  listing,
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const { user, addToast } = useAuth();

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [ratings, setRatings] = useState({
    security: 5,
    water: 5,
    electricity: 5,
    internet: 5,
    cleanliness: 5,
    noise: 5,
    value: 5,
  });

  if (!isOpen) return null;

  const handleStarChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const calculateOverall = () => {
    const sum = ratings.security + ratings.water + ratings.electricity + ratings.internet + ratings.cleanliness + ratings.noise + ratings.value;
    return Number((sum / 7).toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Review Required', 'Please write a brief comment describing your experience.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const overallScore = calculateOverall();
      const newReview = await submitReview({
        listingId: listing.id,
        studentId: user?.id || 'stud_current',
        studentName: user?.name || 'Student Inspector',
        studentAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        comment: comment.trim(),
        ...ratings,
        overall: overallScore
      });

      setSubmitted(true);
      addToast('Review Submitted! ⭐', 'Thank you for helping fellow students find quality accommodation.', 'success');
      if (onReviewSubmitted) onReviewSubmitted(newReview);
    } catch (err) {
      console.error(err);
      addToast('Submission Error', 'Failed to submit feedback. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const criteria = [
    { key: 'security', label: 'Security & Gate Access', icon: Shield },
    { key: 'water', label: 'Running Water Supply', icon: Droplets },
    { key: 'electricity', label: 'Power & Light Stability', icon: Zap },
    { key: 'internet', label: 'Wi-Fi & Network Signal', icon: Wifi },
    { key: 'cleanliness', label: 'Cleanliness & Maintenance', icon: Sparkles },
    { key: 'noise', label: 'Peacefulness & Quiet', icon: Volume2 },
    { key: 'value', label: 'Value for Rent Paid', icon: DollarSign },
  ] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Rate & Review Property
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{listing.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Feedback Published!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your star rating and review have been added to this agent's listing to guide future student inspectors.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md hover:opacity-90 transition-opacity"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Overall Score Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Estimated Overall Rating</p>
                  <p className="text-xs text-slate-500">Based on your category ratings below</p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-lg shadow-md">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{calculateOverall()}</span> / 5
                </div>
              </div>

              {/* Rating Criteria List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Rate Specific Accommodation Aspects
                </p>

                {criteria.map(item => {
                  const Icon = item.icon;
                  const currentVal = ratings[item.key];

                  return (
                    <div 
                      key={item.key}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {item.label}
                      </span>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarChange(item.key, star)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= currentVal
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Your Student Feedback & Comments <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about water flow, electricity hours, caretaker attitude, or distance to campus gate..."
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Post Star Review'}
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
