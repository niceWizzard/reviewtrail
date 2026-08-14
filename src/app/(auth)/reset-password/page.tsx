"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

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
import { updatePassword } from "@/src/lib/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const result = resetPasswordSchema.safeParse(value);
      if (!result.success) {
        setErrorMessage(result.error.issues[0]?.message || "Please fix validation errors.");
        return;
      }
      try {
        await updatePassword(value.password);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        setErrorMessage(err?.message || "An unexpected error occurred.");
      }
    },
  });

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below to reset your account password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center py-2">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-lg font-semibold">Password Reset Successful</h3>
              <p className="text-sm text-muted-foreground">
                Your password has been updated. Redirecting you to your dashboard...
              </p>
            </div>
            <Button
              render={<Link href="/dashboard" />}
              className="w-full"
              nativeButton={false}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form
            method="post"
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldGroup>
              <form.Field name="password">
                {(field) => {
                  const { errors, isTouched, isDirty } = field.state.meta;
                  const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
                  return (
                    <Field data-invalid={shouldShowErrors}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          autoComplete="new-password"
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

              <form.Field name="confirmPassword">
                {(field) => {
                  const { errors, isTouched, isDirty } = field.state.meta;
                  const shouldShowErrors = (isTouched || isDirty) && errors && errors.length > 0;
                  return (
                    <Field data-invalid={shouldShowErrors}>
                      <FieldLabel htmlFor={field.name}>Confirm New Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={shouldShowErrors}
                      />
                      {shouldShowErrors && <FieldError errors={errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="size-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="shadow-lg border-border/80 p-8 flex justify-center items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </Card>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
