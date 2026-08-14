"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

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
import { requestPasswordReset } from "@/src/lib/auth";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setIsSuccess(false);
      const result = forgotPasswordSchema.safeParse(value);
      if (!result.success) {
        setErrorMessage(result.error.issues[0]?.message || "Please enter a valid email address.");
        return;
      }
      try {
        const { error } = await requestPasswordReset(value.email);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setIsSuccess(true);
      } catch (err: any) {
        setErrorMessage(err?.message || "An unexpected error occurred.");
      }
    },
  });

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a password reset link.
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
              <h3 className="text-lg font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We sent a password reset link to your email inbox. Please check your email to reset your password.
              </p>
            </div>
            <Button
              render={<Link href="/login" />}
              variant="outline"
              className="w-full"
              nativeButton={false}
            >
              <ArrowLeft className="size-4 mr-2" />
              Return to Sign In
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
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Mail className="size-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        )}

        {!isSuccess && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="shadow-lg border-border/80 p-8 flex justify-center items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </Card>
      }
    >
      <ForgotPasswordForm />
    </React.Suspense>
  );
}
