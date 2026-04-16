// Tool: create_in_app_notification
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Tool:InAppNotif");

export const createInAppNotificationSchema = z.object({
  user_id: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.string(),
  action_url: z.string().optional(),
});

export async function createInAppNotification(
  input: z.infer<typeof createInAppNotificationSchema>,
): Promise<{ notification_id: string }> {
  try {
    log.info("Creating in-app notification", {
      userId: input.user_id,
      type: input.type,
    });
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    );
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.user_id,
        title: input.title,
        body: input.body,
        type: input.type,
        action_url: input.action_url,
        read: false,
      })
      .select("notification_id")
      .single();
    if (error) throw error;
    return { notification_id: data.notification_id };
  } catch (error) {
    log.error("In-app notification failed", error);
    throw error;
  }
}

export const createInAppNotificationTool = {
  name: "create_in_app_notification",
  description: "Create an in-app notification for a user",
  schema: createInAppNotificationSchema,
  func: createInAppNotification,
};
