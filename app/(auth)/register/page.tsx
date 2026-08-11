"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: value.email,
          password: value.password,
          options: {
            data: {
              username: value.username,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccessMessage("Registration successful! Please check your email to confirm your account.");
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    },
  });

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
        <CardDescription>
          Start tracking your board exam review journey today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            children={(field) => {
              const { errors, isTouched, isDirty } = field.state.meta;
              const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
              return (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor={field.name}>
                    Username
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="mariasantos"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="username"
                  />
                  {shouldShowErrors ? (
                    <p className="text-xs font-medium text-destructive">
                      {errors.map((err) => (typeof err === "string" ? err : (err as { message?: string })?.message || String(err))).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            }}
          />

          <form.Field
            name="email"
            children={(field) => {
              const { errors, isTouched, isDirty } = field.state.meta;
              const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
              return (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor={field.name}>
                    Email Address
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="name@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="email"
                  />
                  {shouldShowErrors ? (
                    <p className="text-xs font-medium text-destructive">
                      {errors.map((err) => (typeof err === "string" ? err : (err as { message?: string })?.message || String(err))).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              const { errors, isTouched, isDirty } = field.state.meta;
              const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
              return (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor={field.name}>
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      <span className="sr-only">Toggle password visibility</span>
                    </button>
                  </div>
                  {shouldShowErrors ? (
                    <p className="text-xs font-medium text-destructive">
                      {errors.map((err) => (typeof err === "string" ? err : (err as { message?: string })?.message || String(err))).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            }}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => {
              const { errors, isTouched, isDirty } = field.state.meta;
              const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
              return (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor={field.name}>
                    Confirm Password
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="new-password"
                  />
                  {shouldShowErrors ? (
                    <p className="text-xs font-medium text-destructive">
                      {errors.map((err) => (typeof err === "string" ? err : (err as { message?: string })?.message || String(err))).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            )}
          />
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
