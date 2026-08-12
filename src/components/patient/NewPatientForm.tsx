"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.string().min(1, "Age is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().optional(),
  preferredLanguage: z.string().min(1, "Language is required"),
  village: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function NewPatientForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      preferredLanguage: "Hindi"
    }
  });

  async function onSubmit(data: PatientFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create patient");
      }

      // Automatically create a draft case and redirect
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: result.data._id }),
      });
      const caseResult = await caseRes.json();
      
      if (!caseRes.ok) throw new Error("Failed to create case");

      router.push(`/health-worker/cases/${caseResult.data._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} placeholder="e.g., Ravi Kumar" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" {...register("age")} placeholder="e.g., 42" />
          {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Biological Sex</Label>
          <Select onValueChange={(val) => setValue("sex", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && <p className="text-red-500 text-sm">{errors.sex.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" {...register("phone")} placeholder="e.g., 9876543210" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="village">Village/Location (Optional)</Label>
          <Input id="village" {...register("village")} placeholder="e.g., Ramgarh" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">Preferred Language</Label>
          <Select defaultValue="Hindi" onValueChange={(val) => setValue("preferredLanguage", val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Bengali">Bengali</SelectItem>
              <SelectItem value="Telugu">Telugu</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredLanguage && <p className="text-red-500 text-sm">{errors.preferredLanguage.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Continue to Intake
        </Button>
      </div>
    </form>
  );
}
