"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/firebase/users";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      await updateProfile(credential.user, { displayName: data.displayName });
      await createUserProfile(credential.user, {
        municipality: data.municipality,
      });
      router.push("/home");
    } catch {
      toast.error("Couldn't create your account. Try a different email.");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join FloodTrace to report flooding in your community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Full name</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="municipality">Municipality</Label>
            <Controller
              name="municipality"
              control={control}
              defaultValue={undefined}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="municipality" className="w-full">
                    <SelectValue placeholder="Select your municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accra">Accra</SelectItem>
                    <SelectItem value="Kumasi">Kumasi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.municipality && (
              <p className="text-sm text-destructive">
                {errors.municipality.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="mt-2 bg-gradient-to-r from-brand-from to-brand-to text-primary-foreground shadow-sm hover:opacity-90"
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
