import { z } from "zod";
import { LeadInputYear, LeadInputModel } from "@workspace/api-client-react";

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "City/State is required"),
  year: z.enum([LeadInputYear.NUMBER_1985, LeadInputYear.NUMBER_1986], { required_error: "Year is required" }),
  model: z.enum([LeadInputModel.ATC_250R, LeadInputModel.TRX_250R], { required_error: "Model is required" }),
  condition: z.string().min(1, "Tell us the condition (any condition is fine)"),
  askingPrice: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
