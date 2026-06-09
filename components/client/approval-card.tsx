"use client";

import { useActionState, useState } from "react";
import { updateApprovalStatus } from "@/app/dashboard/client/actions";
import { Check, X, FileText, Image, Video, Clock, ThumbsUp, AlertTriangle } from "lucide-react";

interface ApprovalItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  status: string;
  feedback: string | null;
}

const statusConfig: Record<string, { border: string; label: string; icon: typeof Clock; iconColor: string }> = {
  pending: {
    border: "border-l-yellow-500",
    label: "Pending Review",
    icon: Clock,
    iconColor: "text-yellow-400",
  },
  approved: {
    border: "border-l-green-500",
    label: "Approved",
    icon: ThumbsUp,
    iconColor: "text-green-400",
  },
  revision_requested: {
    border: "border-l-red-500",
    label: "Revision Requested",
    icon: AlertTriangle,
    iconColor: "text-red-400",
  },
};

const fileIcons: Record<string, typeof FileText> = {
  invitation: FileText,
  photo: Image,
  video_preview: Video,
};

export default function ApprovalCard({ item }: { item: ApprovalItem }) {
  const [feedback, setFeedback] = useState(item.feedback ?? "");
  const [showFeedback, setShowFeedback] = useState(false);

  const [, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await updateApprovalStatus(formData);
      setShowFeedback(false);
      return result;
    },
    undefined,
  );

  const config = statusConfig[item.status] ?? statusConfig.pending;
  const FileIcon = fileIcons[item.file_type ?? ""] ?? FileText;
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-xl border border-gray-800 border-l-4 ${config.border} bg-gray-900/50 p-5 transition-all hover:bg-gray-900/80`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800">
            <FileIcon className="size-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-200 truncate">{item.title}</h3>
            {item.description && (
              <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{item.description}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600 capitalize">{item.file_type?.replace("_", " ") ?? "document"}</span>
              <span className="text-gray-700">·</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.iconColor}`}>
                <StatusIcon className="size-3" />
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {item.status !== "approved" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <form action={action}>
            <input type="hidden" name="approvalId" value={item.id} />
            <input type="hidden" name="status" value="approved" />
            <input type="hidden" name="feedback" value="" />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-all active:scale-95"
            >
              <Check className="size-3.5" />
              Approve
            </button>
          </form>
          <button
            type="button"
            onClick={() => setShowFeedback(!showFeedback)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-all"
          >
            <X className="size-3.5" />
            Request Revision
          </button>
        </div>
      )}

      {showFeedback && (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="approvalId" value={item.id} />
          <input type="hidden" name="status" value="revision_requested" />
          <textarea
            name="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe the changes you need..."
            aria-label="Revision feedback"
            rows={3}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none transition-colors"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending || !feedback.trim()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-all active:scale-95"
            >
              {pending ? "Sending..." : "Send Revision Request"}
            </button>
            <button
              type="button"
              onClick={() => setShowFeedback(false)}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
