"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

export default function EventRatingForm({
  bookingId,
  existingRating,
}: {
  bookingId: string;
  existingRating?: { rating: number; review?: string | null };
}) {
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(existingRating?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState(existingRating?.review ?? "");
  const [message, setMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
    if (rating === 0) return;
    setMessage("");
    startTransition(async () => {
      try {
        const { rateEvent } = await import("./actions");
        await rateEvent(formData);
        setMessage("Rating submitted!");
      } catch {
        setMessage("Failed to submit rating");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all"
          >
            <Star
              className={`size-6 ${(hovered || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
            />
          </button>
        ))}
      </div>
      <textarea
        name="review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
        placeholder="Share your experience (optional)"
        aria-label="Event review"
      />
      {message && <p className="text-xs text-green-400">{message}</p>}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-medium text-black hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {existingRating ? "Update Rating" : pending ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}
