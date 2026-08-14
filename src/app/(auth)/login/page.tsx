"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/src/components/ui/field";
import { loginUser } from "@/src/lib/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        const { error } = await loginUser({
          email: value.email,
          password: value.password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    },
  });

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your review schedules and subject trackers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const { errors, isTouched, isDirty } = field.state.meta;
                const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
                return (
                  <Field data-invalid={shouldShowErrors}>
                    <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="name@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="email"
                      aria-invalid={shouldShowErrors}
                    />
                    {shouldShowErrors && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const { errors, isTouched, isDirty } = field.state.meta;
                const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
                return (
                  <Field data-invalid={shouldShowErrors}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="current-password"
                        className="pr-10"
                        aria-invalid={shouldShowErrors}
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
                    {shouldShowErrors && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="shadow-lg border-border/80 p-8 flex justify-center items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
