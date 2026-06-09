"use client";

import { useActionState } from "react";
import { toggleMilestone } from "@/app/dashboard/client/actions";
import { Check, ListChecks } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
}

export default function MilestoneCheckbox({
  milestone,
  isLast,
}: {
  milestone: Milestone;
  isLast?: boolean;
}) {
  const [, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => toggleMilestone(formData),
    undefined,
  );

  return (
    <form action={action} className="group relative flex items-start gap-4">
      <input type="hidden" name="milestoneId" value={milestone.id} />
      <input type="hidden" name="isCompleted" value={milestone.is_completed ? "false" : "true"} />

      <div className="flex flex-col items-center">
        <button
          type="submit"
          disabled={pending}
          className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            milestone.is_completed
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-gray-600 bg-gray-900 hover:border-yellow-400/70"
          }`}
        >
          {milestone.is_completed && <Check className="size-3" />}
        </button>
        {!isLast && (
          <div className={`w-px flex-1 ${milestone.is_completed ? "bg-yellow-400/30" : "bg-gray-800"}`} style={{ minHeight: "24px" }} />
        )}
      </div>

      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${
            milestone.is_completed ? "text-gray-500 line-through" : "text-gray-200"
          }`}>
            {milestone.title}
          </p>
          {milestone.is_completed && (
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">Done</span>
          )}
        </div>
        {milestone.description && (
          <p className="mt-0.5 text-xs text-gray-500">{milestone.description}</p>
        )}
        {milestone.due_date && (
          <p className="mt-0.5 text-xs text-gray-600">
            Due {new Date(milestone.due_date).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
            })}
          </p>
        )}
      </div>
    </form>
  );
}
