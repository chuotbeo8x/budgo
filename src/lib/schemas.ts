import { z } from 'zod';

// Username slug validation
export const UsernameSlug = z.string()
  .min(2).max(30)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Lowercase letters, numbers, hyphens; no leading/trailing hyphen; no double hyphen")
  .transform(s => s.toLowerCase());

// Trip slug validation - more flexible for SEO
export const TripSlug = z.string()
  .min(2).max(100) // Longer limit for SEO
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Lowercase letters, numbers, hyphens; no leading/trailing hyphen; no double hyphen")
  .transform(s => s.toLowerCase());

// Group slug validation - more flexible for SEO
export const GroupSlug = z.string()
  .min(2).max(100) // Longer limit for SEO
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Lowercase letters, numbers, hyphens; no leading/trailing hyphen; no double hyphen")
  .transform(s => s.toLowerCase());

// Create Account Schema
export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  avatarUrl: z.string().url().optional(),
  username: UsernameSlug,
  birthday: z.coerce.date().optional(),
});

// Group Type
export const GroupType = z.enum(["public", "close", "secret"]);

// Create Group Schema
export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional(),
  type: GroupType,
  slug: GroupSlug,
});

// Currency
export const Currency = z.enum(["VND", "USD"]);

// Create Trip Schema
export const CreateTripSchema = z.object({
  name: z.string().min(1, "Tên chuyến đi không được để trống"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  destination: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  currency: Currency,
  costPerPersonPlanned: z.number().nonnegative().optional(),
  category: z.string().max(120).optional(),
  slug: TripSlug,
  groupId: z.string().optional(),
}).refine(v => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
  message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
  path: ["endDate"],
});

// Add Trip Member Schema
export const AddTripMemberSchema = z.object({
  tripId: z.string().min(1, "Trip ID không được để trống"),
  name: z.string().min(1, "Tên thành viên không được để trống"),
  type: z.enum(['user', 'group', 'ghost']),
  userId: z.string().optional(),
  groupId: z.string().optional(),
  optionalEmail: z.string().email().optional().or(z.literal('')),
});

// Split Method
export const SplitMethod = z.enum(["equal", "weight"]);

// Weight Entry
export const WeightEntry = z.object({
  memberId: z.string(),
  weight: z.number().min(0), // 0 = exclude theo weight
});

// Add Expense Schema
export const AddExpenseSchema = z.object({
  tripId: z.string(),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  description: z.string().max(2000).optional(),
  paidBy: z.string().min(1, "Phải chọn người thanh toán"),
  splitMethod: SplitMethod,
  category: z.string().optional(),
  weightMap: z.array(WeightEntry).optional(),
  exclusions: z.array(z.string()).optional(),
}).superRefine((v, ctx) => {
  if (v.splitMethod === "weight") {
    // For weight split, we'll create default weightMap in the action if not provided
    // So we don't need to validate weightMap here
    if (v.weightMap && v.weightMap.length > 0 && v.weightMap.every(w => w.weight === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ít nhất một thành viên phải có trọng số > 0"
      });
    }
  }
});

// Add Advance Schema
export const AddAdvanceSchema = z.object({
  tripId: z.string(),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  description: z.string().max(1000).optional(),
  paidBy: z.string(),
  paidTo: z.string(),
});

// Close Trip Schema
export const CloseTripSchema = z.object({
  tripId: z.string(),
  rounding: z.boolean().default(false),
});